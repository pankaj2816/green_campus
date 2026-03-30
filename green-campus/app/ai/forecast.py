import math
from collections import defaultdict
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models import EnergyData, SolarData, WasteData, WaterData
from app.services.metrics_config import ACADEMIC_OCCUPANCY_FACTORS


GRANULARITY_CONFIG = {
    "daily": {"periods": 14, "default_label": "Next 14 Days"},
    "monthly": {"periods": 12, "default_label": "Next 12 Months"},
    "yearly": {"periods": 5, "default_label": "Next 5 Years"},
    "seasonal": {"periods": 8, "default_label": "Next 8 Seasons"},
}

SEASON_ORDER = ["Winter", "Summer", "Monsoon", "Post-Monsoon"]


def normalize_granularity(granularity: str | None) -> str:
    if not granularity:
        return "monthly"

    normalized = granularity.lower()
    if normalized not in GRANULARITY_CONFIG:
        return "monthly"

    return normalized


def get_season(dt: datetime) -> str:
    month = dt.month

    if month in (12, 1, 2):
        return "Winter"
    if month in (3, 4, 5):
        return "Summer"
    if month in (6, 7, 8, 9):
        return "Monsoon"
    return "Post-Monsoon"


def _season_occupancy_factor(season: str) -> float:
    season_months = {
        "Winter": [12, 1, 2],
        "Summer": [3, 4, 5],
        "Monsoon": [6, 7, 8, 9],
        "Post-Monsoon": [10, 11],
    }
    months = season_months.get(season, [1])
    return sum(ACADEMIC_OCCUPANCY_FACTORS.get(month, 1.0) for month in months) / len(months)


def aggregate_records(records, field_name: str, granularity: str):
    grouped = defaultdict(float)
    cycle_meta = {}

    for record in records:
        timestamp = record.timestamp

        if granularity == "daily":
            key = timestamp.date()
            sort_key = key
            label = timestamp.strftime("%d %b")
            cycle_key = timestamp.weekday()
            cycle_meta[cycle_key] = {"weekday": cycle_key}
        elif granularity == "monthly":
            key = (timestamp.year, timestamp.month)
            sort_key = key
            label = timestamp.strftime("%b %Y")
            cycle_key = timestamp.month
            cycle_meta[cycle_key] = {"month": timestamp.month}
        elif granularity == "yearly":
            key = timestamp.year
            sort_key = key
            label = str(timestamp.year)
            cycle_key = "yearly"
            cycle_meta[cycle_key] = {"year": timestamp.year}
        else:
            season = get_season(timestamp)
            key = (timestamp.year, season)
            sort_key = (timestamp.year, SEASON_ORDER.index(season))
            label = f"{season} {timestamp.year}"
            cycle_key = season
            cycle_meta[cycle_key] = {"season": season}

        grouped[(sort_key, label, cycle_key)] += float(getattr(record, field_name, 0) or 0)

    ordered = sorted(grouped.items(), key=lambda item: item[0][0])

    labels = [item[0][1] for item in ordered]
    values = [round(item[1], 2) for item in ordered]
    cycle_keys = [item[0][2] for item in ordered]

    return labels, values, cycle_keys, cycle_meta


def _mean(values):
    return sum(values) / len(values) if values else 0.0


def _stddev(values):
    if len(values) < 2:
        return 0.0
    avg = _mean(values)
    variance = sum((value - avg) ** 2 for value in values) / len(values)
    return math.sqrt(variance)


def _future_points(latest_timestamp: datetime | None, granularity: str, periods: int):
    if latest_timestamp is None:
        latest_timestamp = datetime.now()

    points = []

    if granularity == "daily":
        for offset in range(1, periods + 1):
            current = latest_timestamp + timedelta(days=offset)
            points.append({
                "label": current.strftime("%d %b"),
                "cycle_key": current.weekday(),
                "occupancy_factor": ACADEMIC_OCCUPANCY_FACTORS.get(current.month, 1.0),
            })
        return points

    if granularity == "monthly":
        for offset in range(1, periods + 1):
            month_index = latest_timestamp.month - 1 + offset
            year = latest_timestamp.year + (month_index // 12)
            month = (month_index % 12) + 1
            current = datetime(year, month, 1)
            points.append({
                "label": current.strftime("%b %Y"),
                "cycle_key": month,
                "occupancy_factor": ACADEMIC_OCCUPANCY_FACTORS.get(month, 1.0),
            })
        return points

    if granularity == "yearly":
        avg_occupancy = _mean(list(ACADEMIC_OCCUPANCY_FACTORS.values()))
        for offset in range(1, periods + 1):
            year = latest_timestamp.year + offset
            points.append({
                "label": str(year),
                "cycle_key": "yearly",
                "occupancy_factor": avg_occupancy,
            })
        return points

    current_season = get_season(latest_timestamp)
    current_index = SEASON_ORDER.index(current_season)

    for offset in range(1, periods + 1):
        season_index = current_index + offset
        season = SEASON_ORDER[season_index % len(SEASON_ORDER)]
        year = latest_timestamp.year + (season_index // len(SEASON_ORDER))
        points.append({
            "label": f"{season} {year}",
            "cycle_key": season,
            "occupancy_factor": _season_occupancy_factor(season),
        })

    return points


def build_resource_payload(records, field_name: str, granularity: str, periods: int):
    historical_labels, historical_values, cycle_keys, cycle_meta = aggregate_records(records, field_name, granularity)
    latest_timestamp = records[-1].timestamp if records else None
    future_points = _future_points(latest_timestamp, granularity, periods)

    cycle_buckets = defaultdict(list)
    for value, cycle_key in zip(historical_values, cycle_keys):
        cycle_buckets[cycle_key].append(float(value))

    cycle_means = [_mean(bucket) for bucket in cycle_buckets.values() if bucket]

    global_mean = _mean(historical_values)
    average_occupancy = _mean(list(ACADEMIC_OCCUPANCY_FACTORS.values())) or 1.0
    forecast_values = []
    lower_bounds = []
    upper_bounds = []
    forecast_labels = []
    occupancy_factors = []

    for point in future_points:
        cycle_key = point["cycle_key"]
        history_for_cycle = cycle_buckets.get(cycle_key, historical_values or [0.0])
        baseline_mean = _mean(history_for_cycle) or global_mean
        variability = _stddev(history_for_cycle) or max(baseline_mean * 0.08, 1.0)
        occupancy_factor = point["occupancy_factor"]
        occupancy_multiplier = occupancy_factor / average_occupancy if average_occupancy else 1.0

        adjusted_forecast = max(round(baseline_mean * occupancy_multiplier, 2), 0)
        lower_bound = max(round(adjusted_forecast - variability, 2), 0)
        upper_bound = max(round(adjusted_forecast + variability, 2), adjusted_forecast)

        forecast_labels.append(point["label"])
        forecast_values.append(adjusted_forecast)
        lower_bounds.append(lower_bound)
        upper_bounds.append(upper_bound)
        occupancy_factors.append(round(occupancy_factor, 2))

    recent_slice = historical_values[-6:] if historical_values else []
    baseline_mean = round(_mean(historical_values), 2) if historical_values else 0.0
    recent_mean = round(_mean(recent_slice), 2) if recent_slice else baseline_mean
    seasonality_strength = round(_stddev(cycle_means), 2) if cycle_means else 0.0

    return {
        "historical_labels": historical_labels,
        "historical_values": historical_values,
        "forecast_labels": forecast_labels,
        "forecast_values": forecast_values,
        "forecast_lower": lower_bounds,
        "forecast_upper": upper_bounds,
        "occupancy_factors": occupancy_factors,
        "baseline_mean": baseline_mean,
        "recent_mean": recent_mean,
        "variability_score": round(_stddev(historical_values), 2) if historical_values else 0.0,
        "seasonality_strength": seasonality_strength,
    }


def forecast_resources(db: Session, granularity: str = "monthly", building: str | None = None):
    granularity = normalize_granularity(granularity)
    periods = GRANULARITY_CONFIG[granularity]["periods"]

    energy_query = db.query(EnergyData).order_by(EnergyData.timestamp)
    water_query = db.query(WaterData).order_by(WaterData.timestamp)
    waste_query = db.query(WasteData).order_by(WasteData.timestamp)
    solar_query = db.query(SolarData).order_by(SolarData.timestamp)

    if building:
        energy_query = energy_query.filter(EnergyData.building == building)
        water_query = water_query.filter(WaterData.building == building)
        waste_query = waste_query.filter(WasteData.building == building)
        solar_query = solar_query.filter(SolarData.building == building)

    energy_data = energy_query.all()
    water_data = water_query.all()
    waste_data = waste_query.all()
    solar_data = solar_query.all()

    energy_payload = build_resource_payload(energy_data, "consumption_kwh", granularity, periods)
    water_payload = build_resource_payload(water_data, "consumption_kl", granularity, periods)
    waste_payload = build_resource_payload(waste_data, "quantity_kg", granularity, periods)
    solar_payload = build_resource_payload(solar_data, "solar_kwh", granularity, periods)

    avg_future_occupancy = _mean(energy_payload.get("occupancy_factors", []))
    payload = {
        "granularity": granularity,
        "building": building or "Campus",
        "horizon_label": GRANULARITY_CONFIG[granularity]["default_label"],
        "future_occupancy_average": round(avg_future_occupancy, 2) if avg_future_occupancy else 0.0,
        "energy": energy_payload,
        "water": water_payload,
        "waste": waste_payload,
        "solar": solar_payload,
    }

    return payload
