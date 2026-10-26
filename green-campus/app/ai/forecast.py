import math
from collections import defaultdict
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models import EnergyData, SolarData, WasteData, WaterData
from app.services.date_filters import apply_date_range
from app.services.metrics_config import ACADEMIC_OCCUPANCY_FACTORS, get_runtime_constants
from app.services.settings_service import get_dashboard_settings


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


def _season_occupancy_factor(season: str, occupancy_factors: dict) -> float:
    season_months = {
        "Winter": [12, 1, 2],
        "Summer": [3, 4, 5],
        "Monsoon": [6, 7, 8, 9],
        "Post-Monsoon": [10, 11],
    }
    months = season_months.get(season, [1])
    return sum(occupancy_factors.get(month, 1.0) for month in months) / len(months)


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
            season_year = timestamp.year + (1 if timestamp.month == 12 else 0)
            key = (season_year, season)
            sort_key = (season_year, SEASON_ORDER.index(season))
            label = f"{season} {season_year}"
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


def _future_points(latest_timestamp: datetime | None, granularity: str, periods: int, occupancy_factors: dict):
    if latest_timestamp is None:
        latest_timestamp = datetime.now()

    points = []
    if granularity == "daily":
        for offset in range(1, periods + 1):
            current = latest_timestamp + timedelta(days=offset)
            points.append({
                "label": current.strftime("%d %b"),
                "period_index": current.date().toordinal(),
                "cycle_key": current.weekday(),
                "occupancy_factor": occupancy_factors.get(current.month, 1.0),
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
                "period_index": year * 12 + month - 1,
                "cycle_key": month,
                "occupancy_factor": occupancy_factors.get(month, 1.0),
            })
        return points

    if granularity == "yearly":
        avg_occupancy = _mean(list(occupancy_factors.values()))
        for offset in range(1, periods + 1):
            year = latest_timestamp.year + offset
            points.append({
                "label": str(year),
                "period_index": year,
                "cycle_key": "yearly",
                "occupancy_factor": avg_occupancy,
            })
        return points

    current_season = get_season(latest_timestamp)
    season_year = latest_timestamp.year + (1 if latest_timestamp.month == 12 else 0)
    current_index = SEASON_ORDER.index(current_season)
    for offset in range(1, periods + 1):
        season_index = current_index + offset
        season = SEASON_ORDER[season_index % len(SEASON_ORDER)]
        year = season_year + (season_index // len(SEASON_ORDER))
        points.append({
            "label": f"{season} {year}",
            "period_index": year * 4 + SEASON_ORDER.index(season),
            "cycle_key": season,
            "occupancy_factor": _season_occupancy_factor(season, occupancy_factors),
        })

    return points


def _period_index(timestamp, granularity):
    if granularity == "daily":
        return timestamp.date().toordinal()
    if granularity == "monthly":
        return timestamp.year * 12 + timestamp.month - 1
    if granularity == "yearly":
        return timestamp.year
    year = timestamp.year + (timestamp.month == 12)
    return year * 4 + SEASON_ORDER.index(get_season(timestamp))


def _baseline_prediction(history, target, cycle_length):
    """Use an observed seasonal reference, never a missing day or future value."""
    reference = target - cycle_length
    latest = max(history)
    while reference > latest:
        reference -= cycle_length
    if reference in history:
        return history[reference]
    matching = [value for index, value in sorted(history.items())
                if (target - index) % cycle_length == 0]
    return _mean(matching[-8:] if matching else list(history.values())[-8:])


def build_resource_payload(records, field_name: str, granularity: str, periods: int, occupancy_factors: dict, occupancy_sensitive=True):
    records = sorted(records, key=lambda record: record.timestamp)
    historical_labels, historical_values, cycle_keys, cycle_meta = aggregate_records(records, field_name, granularity)
    latest_timestamp = records[-1].timestamp if records else None
    future_points = _future_points(latest_timestamp, granularity, periods, occupancy_factors) if records else []

    cycle_buckets = defaultdict(list)
    for value, cycle_key in zip(historical_values, cycle_keys):
        cycle_buckets[cycle_key].append(float(value))

    cycle_means = [_mean(bucket) for bucket in cycle_buckets.values() if bucket]
    cycle_length = {"daily": 7, "monthly": 12, "seasonal": 4, "yearly": 1}[granularity]
    indexes = sorted({_period_index(record.timestamp, granularity) for record in records})
    history = dict(zip(indexes, historical_values))
    # Errors are computed only from earlier observations, not fitted residuals.
    errors = []
    for position in range(max(cycle_length, len(indexes) - 56), len(indexes)):
        earlier = {index: history[index] for index in indexes[:position]}
        target = indexes[position]
        errors.append(abs(history[target] - _baseline_prediction(earlier, target, cycle_length)))
    ordered_errors = sorted(errors)
    radius = ordered_errors[math.ceil(.9 * len(ordered_errors)) - 1] if ordered_errors else None
    historical_occupancy = _mean([occupancy_factors.get(record.timestamp.month, 1.0) for record in records])

    forecast_values = []
    lower_bounds = []
    upper_bounds = []
    forecast_labels = []
    occupancy_points = []
    confidence_reasons = []
    occupancy_scenario_values = []

    for point in future_points:
        baseline_mean = _baseline_prediction(history, point["period_index"], cycle_length)
        variability = radius if radius is not None else _stddev(historical_values)
        variability *= math.sqrt(max(1, (point["period_index"] - indexes[-1]) / cycle_length))
        occupancy_factor = point["occupancy_factor"]
        occupancy_multiplier = occupancy_factor / historical_occupancy if occupancy_sensitive and historical_occupancy else 1.0

        adjusted_forecast = max(round(baseline_mean, 2), 0)
        lower_bound = max(round(adjusted_forecast - variability, 2), 0)
        upper_bound = max(round(adjusted_forecast + variability, 2), adjusted_forecast)

        confidence_reason = (
            "Spread uses earlier seasonal-reference errors; it is not a calibrated confidence interval."
            if errors else "Insufficient backtest history: spread uses observed variation, not a calibrated confidence interval."
        )

        forecast_labels.append(point["label"])
        forecast_values.append(adjusted_forecast)
        lower_bounds.append(lower_bound)
        upper_bounds.append(upper_bound)
        occupancy_points.append(round(occupancy_factor, 2))
        confidence_reasons.append(confidence_reason)
        occupancy_scenario_values.append(round(max(baseline_mean * occupancy_multiplier, 0), 2))

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
        "occupancy_factors": occupancy_points,
        "baseline_mean": baseline_mean,
        "recent_mean": recent_mean,
        "variability_score": round(_stddev(historical_values), 2) if historical_values else 0.0,
        "seasonality_strength": seasonality_strength,
        "confidence_reasons": confidence_reasons,
        "forecast_method": "seasonal_naive_with_recent_cycle_fallback",
        "method_description": "Previous observed week/year cycle; recent same-cycle mean when the reference is absent. Missing periods are not zero-filled.",
        "spread_type": "historical_error_spread" if errors else "historical_variation_only",
        "nominal_coverage_percent": None,
        "spread_backtest_cases": len(errors),
        "occupancy_adjustment_applied": False,
        "occupancy_scenario_values": occupancy_scenario_values,
        "occupancy_note": "Occupancy factors are assumptions shown as a separate what-if scenario, not measured predictors. All-zero historical factors disable the scenario adjustment.",
    }


def _filtered_query(db: Session, model, building: str | None, date_from: str | None, date_to: str | None):
    query = db.query(model).order_by(model.timestamp)
    if building:
        query = query.filter(model.building == building)
    return apply_date_range(query, model, date_from, date_to)


def forecast_resources(
    db: Session,
    granularity: str = "monthly",
    building: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
):
    granularity = normalize_granularity(granularity)
    periods = GRANULARITY_CONFIG[granularity]["periods"]
    settings = get_dashboard_settings(db)
    occupancy_factors = settings["academic_occupancy_factors"] or ACADEMIC_OCCUPANCY_FACTORS

    energy_data = _filtered_query(db, EnergyData, building, date_from, date_to).all()
    water_data = _filtered_query(db, WaterData, building, date_from, date_to).all()
    waste_data = _filtered_query(db, WasteData, building, date_from, date_to).all()
    solar_data = _filtered_query(db, SolarData, building, date_from, date_to).all()

    energy_payload = build_resource_payload(energy_data, "consumption_kwh", granularity, periods, occupancy_factors)
    water_payload = build_resource_payload(water_data, "consumption_kl", granularity, periods, occupancy_factors)
    waste_payload = build_resource_payload(waste_data, "quantity_kg", granularity, periods, occupancy_factors)
    solar_payload = build_resource_payload(solar_data, "solar_kwh", granularity, periods, occupancy_factors, occupancy_sensitive=False)

    avg_future_occupancy = _mean(energy_payload.get("occupancy_factors", []))
    return {
        "reference_date": energy_data[-1].timestamp.date().isoformat() if energy_data else None,
        "academic_occupancy_factors": occupancy_factors,
        "metric_constants": get_runtime_constants(settings),
        "granularity": granularity,
        "building": building or "Campus",
        "date_from": date_from,
        "date_to": date_to,
        "horizon_label": GRANULARITY_CONFIG[granularity]["default_label"],
        "future_occupancy_average": round(avg_future_occupancy, 2) if avg_future_occupancy else 0.0,
        "energy": energy_payload,
        "water": water_payload,
        "waste": waste_payload,
        "solar": solar_payload,
    }
