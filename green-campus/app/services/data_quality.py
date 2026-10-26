from collections import Counter, defaultdict
from calendar import monthrange
from datetime import datetime

from sqlalchemy.orm import Session

from app import models
from app.services.date_filters import apply_date_range, normalize_date_range


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


def _infer_cadence(timestamps):
    timestamps = sorted(set(timestamps))
    if len(timestamps) < 4:
        return "unknown"
    months = [value.year * 12 + value.month for value in timestamps]
    month_steps = [right - left for left, right in zip(months, months[1:])]
    same_day = len({value.day for value in timestamps}) == 1
    month_ends = all(value.day == monthrange(value.year, value.month)[1] for value in timestamps)
    same_time = len({value.time() for value in timestamps}) == 1
    # Calendar evidence takes precedence over elapsed-day spacing for monthly totals.
    if (all(step > 0 for step in month_steps) and same_time and (same_day or month_ends)
            and month_steps.count(1) >= max(2, len(month_steps) * 0.6)):
        return "monthly"
    seconds = [(right - left).total_seconds() for left, right in zip(timestamps, timestamps[1:])]
    for cadence, unit in (("hourly", 3600), ("daily", 86400)):
        if (all(step % unit == 0 for step in seconds)
                and seconds.count(unit) >= max(2, len(seconds) * 0.6)):
            return cadence
    return "unknown"


def _interval_index(value, cadence):
    if cadence == "monthly":
        return value.year * 12 + value.month
    if cadence == "daily":
        return value.toordinal()
    return value.toordinal() * 24 + value.hour


def _coverage_percent(observed, expected):
    # Rounding must never label an incomplete long series as fully covered.
    return min(99.9 if observed < expected else 100, round(100 * observed / expected, 1))


def _coverage(rows, history_rows, buildings, start, end):
    history = defaultdict(list)
    observed = defaultdict(list)
    for row in history_rows:
        if row.building and row.timestamp:
            history[row.building].append(row.timestamp)
    for row in rows:
        if row.building and row.timestamp:
            observed[row.building].append(row.timestamp)
    details = []
    for building in sorted(buildings):
        cadence = _infer_cadence(history[building])
        item = {"building": building, "cadence": cadence, "observed_intervals": None,
                "expected_intervals": None, "missing_interval_count": None,
                "longest_gap_intervals": None, "coverage_percent": None}
        if cadence != "unknown" and start and end and start <= end:
            first, last = _interval_index(start, cadence), _interval_index(end, cadence)
            slots = sorted({_interval_index(value, cadence) for value in observed[building]
                            if first <= _interval_index(value, cadence) <= last})
            expected = last - first + 1
            boundaries = [first - 1, *slots, last + 1]
            item.update(observed_intervals=len(slots), expected_intervals=expected,
                        missing_interval_count=expected - len(slots),
                        longest_gap_intervals=max(b - a - 1 for a, b in zip(boundaries, boundaries[1:])),
                        coverage_percent=_coverage_percent(len(slots), expected))
        details.append(item)
    known = [item for item in details if item["expected_intervals"] is not None]
    expected = sum(item["expected_intervals"] for item in known)
    count = sum(item["observed_intervals"] for item in known)
    cadences = {item["cadence"] for item in details}
    return {
        "cadence": next(iter(cadences)) if len(cadences) == 1 else "mixed" if cadences else "unknown",
        "coverage_status": "known" if known and len(known) == len(details) else "partial" if known else "unknown",
        "coverage_percent": _coverage_percent(count, expected) if expected else None,
        "observed_intervals": count if known else None,
        "expected_intervals": expected if known else None,
        "missing_interval_count": expected - count if known else None,
        "longest_gap_intervals": max((item["longest_gap_intervals"] for item in known), default=None),
        "known_cadence_building_count": len(known),
        "unknown_cadence_building_count": len(details) - len(known),
        "building_coverage": details,
        "coverage_explanation": "Unique calendar slots per building, including boundary gaps; counts aggregate only known cadences. "
                                "Cadence uses scoped resource history (including outside the selected range), at least four timestamps, "
                                "and at least two unit steps comprising 60% of gaps, with all other gaps aligned to that cadence. "
                                "The full window is expected for every scoped building. Unknown cadence is not assumed complete. "
                                "Mixed-cadence gap lengths use each building's cadence.",
    }


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
            "score": 0,
        }

    buildings = {row.building for row in rows if row.building}
    timestamps = [row.timestamp for row in rows if row.timestamp]
    covered_month_keys = {_month_key(value) for value in timestamps}
    missing_months = [month for month in expected_months if month not in covered_month_keys]
    building_coverage = defaultdict(set)
    for row in rows:
        if row.building and row.timestamp:
            building_coverage[row.building].add(_month_key(row.timestamp))
    expected_month_set = set(expected_months)
    missing_building_months = sum(len(expected_month_set - months) for months in building_coverage.values())
    duplicate_keys = Counter(
        (row.building, row.timestamp.isoformat(), getattr(row, "waste_type", None))
        for row in rows
        if row.building and row.timestamp
    )
    duplicate_count = sum(count - 1 for count in duplicate_keys.values() if count > 1)
    values = [float(getattr(row, value_attr) or 0) for row in rows]
    zero_or_negative = sum(1 for value in values if value <= 0)

    month_coverage = 1 - missing_building_months / (len(expected_months) * max(len(buildings), 1)) if expected_months else 1
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
        "missing_building_month_count": missing_building_months,
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
    history_rows = {
        resource: _resource_rows(db, resource, building, None, None)
        for resource in RESOURCE_CONFIG
    }
    start, end = normalize_date_range(date_from, date_to)
    resource_rows = {
        resource: [row for row in rows if row.timestamp
                   and (not start or row.timestamp.date() >= start.date())
                   and (not end or row.timestamp.date() <= end.date())]
        for resource, rows in history_rows.items()
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
    else:
        first_date = None
        last_date = None
    # Explicit bounds still describe an expected window when it contains no rows.
    window_start = start or first_date or end
    window_end = last_date
    if end or (start and not last_date):
        window_end = (end or start).replace(hour=23, minute=59, second=59, microsecond=999999)
    expected_months = _month_range(window_start, window_end) if window_start and window_end else []
    buildings = {row.building for rows in history_rows.values() for row in rows if row.building}
    if building:
        buildings = {building}

    resources = [
        _summarize_resource(rows, resource, expected_months)
        for resource, rows in resource_rows.items()
    ]
    for item in resources:
        resource = item["resource"]
        coverage = _coverage(resource_rows[resource], history_rows[resource], buildings, window_start, window_end)
        item.update(coverage)
        observed_months = defaultdict(set)
        for row in resource_rows[resource]:
            if row.building and row.timestamp:
                observed_months[row.building].add(_month_key(row.timestamp))
        item["missing_building_month_count"] = sum(
            len(set(expected_months) - observed_months[name]) for name in buildings
        )
        if item["row_count"]:
            value_health = 1 - item["zero_or_negative_values"] / item["row_count"]
            duplicate_health = 1 - min(item["duplicate_readings"] / item["row_count"], 1)
            health = value_health * 30 + duplicate_health * 20
            if coverage["coverage_percent"] is None:
                item["score"] = round(health * 2, 1)
            else:
                item["score"] = round(health + coverage["coverage_percent"] * 0.5, 1)
            item["status"] = "strong" if item["score"] >= 85 else "usable" if item["score"] >= 65 else "needs_review"

    required_scores = [item["score"] for item in resources if item["required"]]
    optional_scores = [item["score"] for item in resources if not item["required"] and item["row_count"] > 0]
    overall_score = round(
        ((sum(required_scores) / max(len(required_scores), 1)) * (0.75 if optional_scores else 1)) +
        ((sum(optional_scores) / len(optional_scores)) * 0.25 if optional_scores else 0),
        1,
    )
    if not all_timestamps:
        overall_score = 0
    history_months = len(expected_months)
    required_coverage = min((item["covered_months"] for item in resources if item["required"]), default=0)
    history_availability = min(round((required_coverage / 12) * 100, 1), 100)
    required_resources = [item for item in resources if item["required"]]
    coverage_cap = min((detail["coverage_percent"] if detail["coverage_percent"] is not None else 0
                        for item in required_resources for detail in item["building_coverage"]), default=0)
    forecast_readiness = min(history_availability, coverage_cap)
    if any(not item["row_count"] for item in required_resources):
        forecast_readiness = 0

    issue_count = sum(
        1
        for item in resources
        if item["status"] in {"missing", "needs_review"} or item["duplicate_readings"] or item["zero_or_negative_values"]
        or (item["row_count"] and (item["coverage_status"] != "known" or item["missing_interval_count"]))
    )

    recommendations = []
    for item in resources:
        label = item["resource"].title()
        if item["row_count"] and item["coverage_status"] != "known":
            recommendations.append(f"Confirm {label} sampling cadence; interval coverage is unknown for some buildings.")
        if item["missing_interval_count"]:
            recommendations.append(f"Review {label} missing intervals per building ({item['missing_interval_count']} total).")
        if item["required"] and item["row_count"] == 0:
            recommendations.append(f"Add {label} data before using dashboard results for decisions.")
        if item["missing_month_count"] > 0 and item["row_count"] > 0:
            recommendations.append(f"Review missing {label} months: {', '.join(item['missing_months'][:4])}.")
        if item["duplicate_readings"] > 0:
            recommendations.append(f"Check duplicate {label} readings for the same building and date.")
        if item.get("missing_building_month_count", 0) > item["missing_month_count"]:
            recommendations.append(f"Some buildings have missing {label} months even though other buildings cover that period.")
        if item["zero_or_negative_values"] > 0:
            recommendations.append(f"Check zero or negative {label} values because they can distort trends.")

    if not recommendations:
        recommendations.append("No measured coverage, duplicate, or value issues found; validate forecasts separately before decisions.")

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
        "history_availability_percent": history_availability,
        "forecast_readiness_coverage_cap": coverage_cap,
        "history_availability_explanation": "Minimum required-resource observed month count / 12, capped at 100%; not interval completeness.",
        "forecast_readiness_explanation": "Data-sufficiency heuristic, not prediction accuracy. History availability is capped by the lowest "
                                          "required-resource building coverage; unknown cadence or missing required data gives zero readiness. "
                                          "Forecast accuracy requires independent backtesting.",
        "overall_score_explanation": "Coverage (50%), positive values (30%), and non-duplicates (20%). Unknown coverage is excluded "
                                     "from resource scoring, not treated as complete. Required resources carry 75% when optional data "
                                     "exists, otherwise 100%; absent optional resources are excluded. Buildings are those observed in scoped history.",
        "resources": resources,
        "recommendations": recommendations[:6],
    }
