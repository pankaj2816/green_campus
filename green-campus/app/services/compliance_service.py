from sqlalchemy.orm import Session

from app.models import EnergyData, WaterData, WasteData
from app.services.metrics_config import (
    COMPLIANCE_ENERGY_LIMIT,
    COMPLIANCE_WASTE_LIMIT,
    COMPLIANCE_WATER_LIMIT,
)


def calculate_compliance_score(db: Session):
    energy_data = db.query(EnergyData).all()
    water_data = db.query(WaterData).all()
    waste_data = db.query(WasteData).all()

    total_energy = sum(entry.consumption_kwh for entry in energy_data)
    total_water = sum(entry.consumption_kl for entry in water_data)
    total_waste = sum(entry.quantity_kg for entry in waste_data)

    energy_score = max(0, 100 - (total_energy / COMPLIANCE_ENERGY_LIMIT) * 100)
    water_score = max(0, 100 - (total_water / COMPLIANCE_WATER_LIMIT) * 100)
    waste_score = max(0, 100 - (total_waste / COMPLIANCE_WASTE_LIMIT) * 100)

    green_index = (
        0.5 * energy_score +
        0.3 * water_score +
        0.2 * waste_score
    )

    if green_index >= 85:
        grade = "A"
    elif green_index >= 70:
        grade = "B"
    elif green_index >= 50:
        grade = "C"
    else:
        grade = "D"

    return {
        "green_index": round(green_index, 2),
        "grade": grade,
        "energy_score": round(energy_score, 2),
        "water_score": round(water_score, 2),
        "waste_score": round(waste_score, 2),
    }
