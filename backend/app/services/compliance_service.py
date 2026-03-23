from app.models import EnergyData, WaterData, WasteData
from sqlalchemy.orm import Session


def calculate_compliance_score(db: Session):

    energy_data = db.query(EnergyData).all()
    water_data = db.query(WaterData).all()
    waste_data = db.query(WasteData).all()

    total_energy = sum(e.consumption_kwh for e in energy_data)
    total_water = sum(w.consumption_kl for w in water_data)
    total_waste = sum(w.quantity_kg for w in waste_data)

    # --- Government Threshold Benchmarks ---
    ENERGY_LIMIT = 500
    WATER_LIMIT = 200
    WASTE_LIMIT = 300

    # Normalize scores (lower consumption = better score)
    energy_score = max(0, 100 - (total_energy / ENERGY_LIMIT) * 100)
    water_score = max(0, 100 - (total_water / WATER_LIMIT) * 100)
    waste_score = max(0, 100 - (total_waste / WASTE_LIMIT) * 100)

    # Weighted Governance Index
    green_index = (
        0.5 * energy_score +
        0.3 * water_score +
        0.2 * waste_score
    )

    # Grade Assignment
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
        "waste_score": round(waste_score, 2)
    }