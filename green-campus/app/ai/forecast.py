from collections import defaultdict
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models import EnergyData, SolarData, WasteData, WaterData


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


def aggregate_records(records, field_name: str, granularity: str):
    grouped = defaultdict(float)

    for record in records:
        timestamp = record.timestamp

        if granularity == "daily":
            key = timestamp.date()
            sort_key = key
            label = timestamp.strftime("%d %b")
            cycle_key = timestamp.weekday()
        elif granularity == "monthly":
            key = (timestamp.year, timestamp.month)
            sort_key = key
            label = timestamp.strftime("%b %Y")
            cycle_key = timestamp.month
        elif granularity == "yearly":
            key = timestamp.year
            sort_key = key
            label = str(timestamp.year)
            cycle_key = "yearly"
        else:
            season = get_season(timestamp)
            key = (timestamp.year, season)
            sort_key = (timestamp.year, SEASON_ORDER.index(season))
            label = f"{season} {timestamp.year}"
            cycle_key = season

        grouped[(sort_key, label, cycle_key)] += float(getattr(record, field_name, 0) or 0)

    ordered = sorted(grouped.items(), key=lambda item: item[0][0])

    labels = [item[0][1] for item in ordered]
    values = [round(item[1], 2) for item in ordered]
    cycle_keys = [item[0][2] for item in ordered]

    return labels, values, cycle_keys


def seasonal_average_forecast(values, cycle_keys, periods):
    if not values:
        return [0.0] * periods

    cycle_buckets = defaultdict(list)
    for value, cycle_key in zip(values, cycle_keys):
        cycle_buckets[cycle_key].append(float(value))

    cycle_means = {
        key: sum(bucket) / len(bucket)
        for key, bucket in cycle_buckets.items()
        if bucket
    }

    ordered_cycle = list(dict.fromkeys(cycle_keys))
    if not ordered_cycle:
        ordered_cycle = [0]

    overall_mean = sum(values) / len(values)
    forecast = []
    last_index = len(ordered_cycle) - 1

    for i in range(periods):
        cycle_key = ordered_cycle[(last_index + i + 1) % len(ordered_cycle)]
        forecast.append(round(float(cycle_means.get(cycle_key, overall_mean)), 2))

    return forecast


def generate_future_labels(latest_timestamp: datetime | None, granularity: str, periods: int):
    if latest_timestamp is None:
        latest_timestamp = datetime.now()

    labels = []

    if granularity == "daily":
        for offset in range(1, periods + 1):
            labels.append((latest_timestamp + timedelta(days=offset)).strftime("%d %b"))
        return labels

    if granularity == "monthly":
        for offset in range(1, periods + 1):
            month_index = latest_timestamp.month - 1 + offset
            year = latest_timestamp.year + (month_index // 12)
            month = (month_index % 12) + 1
            labels.append(datetime(year, month, 1).strftime("%b %Y"))
        return labels

    if granularity == "yearly":
        for offset in range(1, periods + 1):
            labels.append(str(latest_timestamp.year + offset))
        return labels

    current_season = get_season(latest_timestamp)
    current_index = SEASON_ORDER.index(current_season)

    for offset in range(1, periods + 1):
        season_index = current_index + offset
        season = SEASON_ORDER[season_index % len(SEASON_ORDER)]
        year = latest_timestamp.year + (season_index // len(SEASON_ORDER))
        labels.append(f"{season} {year}")

    return labels


def build_resource_payload(records, field_name: str, granularity: str, periods: int):
    historical_labels, historical_values, cycle_keys = aggregate_records(records, field_name, granularity)
    forecast_values = seasonal_average_forecast(historical_values, cycle_keys, periods)
    latest_timestamp = records[-1].timestamp if records else None
    forecast_labels = generate_future_labels(latest_timestamp, granularity, periods)

    return {
        "historical_labels": historical_labels,
        "historical_values": historical_values,
        "forecast_labels": forecast_labels,
        "forecast_values": forecast_values,
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

    payload = {
        "granularity": granularity,
        "building": building or "Campus",
        "horizon_label": GRANULARITY_CONFIG[granularity]["default_label"],
        "energy": build_resource_payload(energy_data, "consumption_kwh", granularity, periods),
        "water": build_resource_payload(water_data, "consumption_kl", granularity, periods),
        "waste": build_resource_payload(waste_data, "quantity_kg", granularity, periods),
        "solar": build_resource_payload(solar_data, "solar_kwh", granularity, periods),
    }

    return payload
