from collections import Counter
from datetime import datetime

from sqlalchemy.orm import Session

from app import models
from app.services.date_filters import apply_date_range


RESOURCE_CONFIG = {
    "energy": {
        "model": models.EnergyData,
        "value_attr": "consumption_kwh",
        "unit": "kWh",
        "required": True,
    },
    "water": {
        "model": models.WaterData,
        "value_attr": "consumption_kl",
        "unit": "kl",
        "required": True,
    },
    "waste": {
        "model": models.WasteData,
        "value_attr": "quantity_kg",
        "unit": "kg",
        "required": False,
    },
    "solar": {
        "model": models.SolarData,
        "value_attr": "solar_kwh",
        "unit": "kWh",
        "required": False,
    },
}


def _month_key(value: datetime):
    return value.year, value.month


def _month_range(start: datetime, end: datetime):
    cursor_year, cursor_month = start.year, start.month
    end_key = (end.year, end.month)
    months = []

    while (cursor_year, cursor_month) <= end_key:
        months.append((cursor_year, cursor_month))
        cursor_month += 1
        if cursor_month > 12:
            cursor_month = 1
            cursor_year += 1

    return months


def _format_month(month_key):
    year, month = month_key
    return f"{year}-{month:02d}"


def _resource_rows(db: Session, resource: str, building: str | None, date_from: str | None, date_to: str | None):
    config = RESOURCE_CONFIG[resource]
    model = config["model"]
    query = db.query(model)

    if building:
        query = query.filter(model.building == building)

    return apply_date_range(query, model, date_from, date_to).order_by(model.timestamp).all()


def _summarize_resource(rows: list, resource: str, expected_months: list[tuple[int, int]]):
    config = RESOURCE_CONFIG[resource]
    value_attr = config["value_attr"]

    if not rows:
        return {
            "resource": resource,
            "unit": config["unit"],
            "required": config["required"],
            "row_count": 0,
            "building_count": 0,
            "first_date": None,
            "last_date": None,
            "covered_months": 0,
            "missing_month_count": len(expected_months),
            "missing_months": [_format_month(month) for month in expected_months[:12]],
            "duplicate_readings": 0,
            "zero_or_negative_values": 0,
            "average_value": 0,
            "status": "missing" if config["required"] else "optional_missing",
            "score": 0 if config["required"] else 75,
        }

    buildings = {row.building for row in rows if row.building}
    timestamps = [row.timestamp for row in rows if row.timestamp]
    covered_month_keys = {_month_key(value) for value in timestamps}
    missing_months = [month for month in expected_months if month not in covered_month_keys]
    duplicate_keys = Counter(
        (row.building, row.timestamp.date().isoformat())
        for row in rows
        if row.building and row.timestamp
    )
    duplicate_count = sum(count - 1 for count in duplicate_keys.values() if count > 1)
    values = [float(getattr(row, value_attr) or 0) for row in rows]
    zero_or_negative = sum(1 for value in values if value <= 0)

    month_coverage = (len(covered_month_keys) / len(expected_months)) if expected_months else 1
    value_health = 1 - (zero_or_negative / len(values)) if values else 0
    duplicate_health = 1 - min(duplicate_count / max(len(rows), 1), 1)
    score = round((month_coverage * 50) + (value_health * 30) + (duplicate_health * 20), 1)

    if score >= 85:
        status = "strong"
    elif score >= 65:
        status = "usable"
    else:
        status = "needs_review"

    return {
        "resource": resource,
        "unit": config["unit"],
        "required": config["required"],
        "row_count": len(rows),
        "building_count": len(buildings),
        "first_date": min(timestamps).date().isoformat() if timestamps else None,
        "last_date": max(timestamps).date().isoformat() if timestamps else None,
        "covered_months": len(covered_month_keys),
        "missing_month_count": len(missing_months),
        "missing_months": [_format_month(month) for month in missing_months[:12]],
        "duplicate_readings": duplicate_count,
        "zero_or_negative_values": zero_or_negative,
        "average_value": round(sum(values) / len(values), 2) if values else 0,
        "status": status,
        "score": score,
    }


def build_data_quality_report(
    db: Session,
    building: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
):
    resource_rows = {
        resource: _resource_rows(db, resource, building, date_from, date_to)
        for resource in RESOURCE_CONFIG
    }
    all_timestamps = [
        row.timestamp
        for rows in resource_rows.values()
        for row in rows
        if row.timestamp
    ]

    if all_timestamps:
        first_date = min(all_timestamps)
        last_date = max(all_timestamps)
        expected_months = _month_range(first_date, last_date)
    else:
        first_date = None
        last_date = None
        expected_months = []

    resources = [
        _summarize_resource(rows, resource, expected_months)
        for resource, rows in resource_rows.items()
    ]

    required_scores = [item["score"] for item in resources if item["required"]]
    optional_scores = [item["score"] for item in resources if not item["required"] and item["row_count"] > 0]
    overall_score = round(
        ((sum(required_scores) / max(len(required_scores), 1)) * 0.75) +
        ((sum(optional_scores) / max(len(optional_scores), 1)) * 0.25 if optional_scores else 18),
        1,
    )
    history_months = len(expected_months)
    forecast_readiness = min(round((history_months / 12) * 100, 1), 100)

    issue_count = sum(
        1
        for item in resources
        if item["status"] in {"missing", "needs_review"} or item["duplicate_readings"] or item["zero_or_negative_values"]
    )

    recommendations = []
    for item in resources:
        label = item["resource"].title()
        if item["required"] and item["row_count"] == 0:
            recommendations.append(f"Add {label} data before using dashboard results for decisions.")
        if item["missing_month_count"] > 0 and item["row_count"] > 0:
            recommendations.append(f"Review missing {label} months: {', '.join(item['missing_months'][:4])}.")
        if item["duplicate_readings"] > 0:
            recommendations.append(f"Check duplicate {label} readings for the same building and date.")
        if item["zero_or_negative_values"] > 0:
            recommendations.append(f"Check zero or negative {label} values because they can distort trends.")

    if not recommendations:
        recommendations.append("Data is consistent enough for planning, forecasting, and executive reporting.")

    if overall_score >= 85:
        trust_level = "High"
    elif overall_score >= 65:
        trust_level = "Medium"
    else:
        trust_level = "Low"

    return {
        "scope": building or "Campus",
        "date_from": date_from or (first_date.date().isoformat() if first_date else None),
        "date_to": date_to or (last_date.date().isoformat() if last_date else None),
        "overall_score": overall_score,
        "trust_level": trust_level,
        "issue_count": issue_count,
        "history_months": history_months,
        "forecast_readiness": forecast_readiness,
        "resources": resources,
        "recommendations": recommendations[:6],
    }
