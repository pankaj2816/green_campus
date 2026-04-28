import json

from sqlalchemy.orm import Session

from app import models
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
    }
    return merged


def save_dashboard_settings(db: Session, settings_payload: dict):
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
    }

    record = db.query(models.CampusSetting).filter(models.CampusSetting.key == SETTINGS_KEY).first()
    if not record:
        record = models.CampusSetting(key=SETTINGS_KEY, value_json=json.dumps(next_payload))
        db.add(record)
    else:
        record.value_json = json.dumps(next_payload)

    db.commit()
    db.refresh(record)
    return next_payload
