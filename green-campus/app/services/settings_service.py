import json
import math
from copy import deepcopy
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app import models
from app.services.audit import log_audit_event
from app.services.metrics_config import ACADEMIC_OCCUPANCY_FACTORS, get_runtime_constants


SETTINGS_KEY = "dashboard_preferences"

DEFAULT_SETTINGS = {
    "academic_occupancy_factors": ACADEMIC_OCCUPANCY_FACTORS,
    "campus_context": {
        "student_population": 8500,
        "hostel_population": 3200,
        "built_up_area_sqm": 125000,
        "monthly_energy_budget_rs": 2500000,
    },
    "sustainability_goals": {
        "green_index_target": 88,
        "solar_offset_target_percent": 18,
        "water_per_student_target_kl": 0.22,
        "monthly_energy_cost_target_rs": 1800000,
    },
    "action_tracker": {},
    "metric_overrides": {},
}


def _normalize_occupancy_keys(values: dict):
    normalized = {}
    for key, value in values.items():
        try:
            month = int(key)
            factor = float(value)
            if str(month) != str(key) or not 1 <= month <= 12 or not math.isfinite(factor) or not 0 <= factor <= 1.2:
                raise ValueError()
        except (ValueError, TypeError, OverflowError):
            raise HTTPException(status_code=422, detail="Occupancy requires months 1-12 and finite activity factors between 0 and 1.2.")
        normalized[month] = factor
    return normalized


def _validate_settings(settings):
    def number(value, label, minimum=0, positive=False):
        try:
            result = float(value)
        except (TypeError, ValueError, OverflowError):
            result = float("nan")
        if not math.isfinite(result) or result < minimum or (positive and result == 0):
            raise HTTPException(status_code=422, detail=f"{label} must be a finite {'positive' if positive else 'non-negative'} number.")
        return result

    for key, value in settings["campus_context"].items():
        settings["campus_context"][key] = number(value, key, positive=key in {"student_population", "built_up_area_sqm"})
    for key, value in settings["sustainability_goals"].items():
        settings["sustainability_goals"][key] = number(value, key, positive=True)
    if settings["sustainability_goals"]["green_index_target"] > 100:
        raise HTTPException(status_code=422, detail="Green Index target cannot exceed 100.")
    valid_statuses = {"suggested", "planned", "in_progress", "completed"}
    if any(not isinstance(value, str) or value not in valid_statuses for value in settings["action_tracker"].values()):
        raise HTTPException(status_code=422, detail="Unknown action status.")

    constants = get_runtime_constants(settings)
    for key in ("energy_benchmark", "water_benchmark", "waste_benchmark", "energy_cost_per_kwh", "emission_factor_kg_per_kwh", "anomaly_threshold_percent", "high_anomaly_threshold_percent"):
        value = number(constants[key], key, positive=key.endswith("benchmark"))
        if key in settings["metric_overrides"]:
            settings["metric_overrides"][key] = value
    weights = {key: number(value, f"{key} weight") for key, value in constants["weights"].items()}
    if not math.isclose(sum(weights.values()), 1.0, abs_tol=0.000001):
        raise HTTPException(status_code=422, detail="Energy, water, and waste weights must add up to 1.")
    if "weights" in settings["metric_overrides"]:
        settings["metric_overrides"]["weights"] = weights
    if float(constants["high_anomaly_threshold_percent"]) < float(constants["anomaly_threshold_percent"]):
        raise HTTPException(status_code=422, detail="High anomaly threshold must be at least the normal threshold.")


def get_dashboard_settings(db: Session):
    record = db.query(models.CampusSetting).filter(models.CampusSetting.key == SETTINGS_KEY).first()
    if not record:
        return deepcopy(DEFAULT_SETTINGS)

    data = json.loads(record.value_json)
    occupancy = data.get("academic_occupancy_factors", {})
    merged = {
        "academic_occupancy_factors": {
            **DEFAULT_SETTINGS["academic_occupancy_factors"],
            **_normalize_occupancy_keys(occupancy),
        },
        "campus_context": {
            **DEFAULT_SETTINGS["campus_context"],
            **data.get("campus_context", {}),
        },
        "sustainability_goals": {
            **DEFAULT_SETTINGS["sustainability_goals"],
            **data.get("sustainability_goals", {}),
        },
        "action_tracker": {
            **DEFAULT_SETTINGS["action_tracker"],
            **data.get("action_tracker", {}),
        },
        "metric_overrides": {
            **DEFAULT_SETTINGS["metric_overrides"],
            **data.get("metric_overrides", {}),
        },
    }
    return merged


def save_dashboard_settings(db: Session, settings_payload: dict, actor_username: str | None = None):
    allowed = {
        "campus_context": set(DEFAULT_SETTINGS["campus_context"]),
        "sustainability_goals": set(DEFAULT_SETTINGS["sustainability_goals"]),
        "metric_overrides": {"weights", "energy_benchmark", "water_benchmark", "waste_benchmark", "energy_cost_per_kwh", "emission_factor_kg_per_kwh", "anomaly_threshold_percent", "high_anomaly_threshold_percent"},
    }
    for section, keys in allowed.items():
        values = settings_payload.get(section, {})
        if set(values) - keys:
            raise HTTPException(status_code=422, detail=f"Unknown setting in {section}.")
    overrides = settings_payload.get("metric_overrides", {})
    if "weights" in overrides and (not isinstance(overrides["weights"], dict) or set(overrides["weights"]) - {"energy", "water", "waste"}):
        raise HTTPException(status_code=422, detail="Weights must contain energy, water, and waste numbers.")
    current = get_dashboard_settings(db)
    next_payload = {
        "academic_occupancy_factors": {
            **current["academic_occupancy_factors"],
            **_normalize_occupancy_keys(settings_payload.get("academic_occupancy_factors", {})),
        },
        "campus_context": {
            **current["campus_context"],
            **settings_payload.get("campus_context", {}),
        },
        "sustainability_goals": {
            **current["sustainability_goals"],
            **settings_payload.get("sustainability_goals", {}),
        },
        "action_tracker": {
            **current["action_tracker"],
            **settings_payload.get("action_tracker", {}),
        },
        "metric_overrides": {
            **current["metric_overrides"],
            **settings_payload.get("metric_overrides", {}),
        },
    }

    _validate_settings(next_payload)

    record = db.query(models.CampusSetting).filter(models.CampusSetting.key == SETTINGS_KEY).first()
    if not record:
        record = models.CampusSetting(key=SETTINGS_KEY, value_json=json.dumps(next_payload))
        db.add(record)
    else:
        record.value_json = json.dumps(next_payload)

    changed_sections = [key for key in next_payload if next_payload[key] != current[key]]
    if actor_username and changed_sections:
        log_audit_event(
            db,
            event_type="settings",
            action="update",
            actor_username=actor_username,
            summary=f"Updated dashboard settings: {', '.join(changed_sections) if changed_sections else 'no visible sections'}",
            target_name=SETTINGS_KEY,
            details={
                "changed_sections": changed_sections,
                "before": {key: current[key] for key in changed_sections},
                "after": {key: next_payload[key] for key in changed_sections},
            },
        )

    db.commit()
    db.refresh(record)
    return next_payload
