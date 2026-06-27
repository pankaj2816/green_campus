import json

from sqlalchemy.orm import Session

from app import models
from app.services.audit import log_audit_event
from app.services.metrics_config import ACADEMIC_OCCUPANCY_FACTORS


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
        normalized[int(key)] = float(value)
    return normalized


def get_dashboard_settings(db: Session):
    record = db.query(models.CampusSetting).filter(models.CampusSetting.key == SETTINGS_KEY).first()
    if not record:
        return DEFAULT_SETTINGS.copy()

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

    record = db.query(models.CampusSetting).filter(models.CampusSetting.key == SETTINGS_KEY).first()
    if not record:
        record = models.CampusSetting(key=SETTINGS_KEY, value_json=json.dumps(next_payload))
        db.add(record)
    else:
        record.value_json = json.dumps(next_payload)

    if actor_username:
        changed_sections = [key for key, value in settings_payload.items() if value]
        log_audit_event(
            db,
            event_type="settings",
            action="update",
            actor_username=actor_username,
            summary=f"Updated dashboard settings: {', '.join(changed_sections) if changed_sections else 'no visible sections'}",
            target_name=SETTINGS_KEY,
            details={
                "changed_sections": changed_sections,
            },
        )

    db.commit()
    db.refresh(record)
    return next_payload
