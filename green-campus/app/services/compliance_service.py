from sqlalchemy.orm import Session

from app.models import EnergyData, SolarData, WasteData, WaterData
from app.services.green_index import calculate_green_index
from app.services.metrics_config import get_runtime_constants
from app.services.settings_service import get_dashboard_settings


def _grade(green_index: float) -> str:
    if green_index >= 85:
        return "A"
    if green_index >= 70:
        return "B"
    if green_index >= 50:
        return "C"
    return "D"


def calculate_compliance_score(db: Session):
    settings = get_dashboard_settings(db)
    constants = get_runtime_constants(settings)

    energy_rows = db.query(EnergyData).all()
    water_rows = db.query(WaterData).all()
    waste_rows = db.query(WasteData).all()
    solar_rows = db.query(SolarData).all()
    if not energy_rows and not water_rows and not waste_rows and not solar_rows:
        return {"scope": "Campus", "grade": "Not assessed", "formula": "dashboard_green_index", "green_index": None, "energy_score": None, "water_score": None, "waste_score": None}

    total_energy = sum(float(entry.consumption_kwh or 0) for entry in energy_rows)
    total_water = sum(float(entry.consumption_kl or 0) for entry in water_rows)
    total_waste = sum(float(entry.quantity_kg or 0) for entry in waste_rows)
    total_solar = sum(float(entry.solar_kwh or 0) for entry in solar_rows)
    net_energy = max(total_energy - total_solar, 0)

    scores = calculate_green_index(net_energy, total_water, total_waste, constants)
    green_index = scores["green_index"]

    return {
        "scope": "Campus",
        "grade": _grade(green_index),
        "formula": "dashboard_green_index",
        **scores,
    }
