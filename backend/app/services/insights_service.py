from app.models import EnergyData, WaterData, WasteData
from app.services.carbon import calculate_carbon
from sqlalchemy.orm import Session


def generate_insights(db: Session, performance_data):

    energy_data = db.query(EnergyData).all()
    water_data = db.query(WaterData).all()
    waste_data = db.query(WasteData).all()

    insights = []

    total_energy = sum(e.consumption_kwh for e in energy_data)
    total_water = sum(w.consumption_kl for w in water_data)
    total_waste = sum(w.quantity_kg for w in waste_data)

    # Simple sustainability thresholds
    if total_energy > 500:
        insights.append({
            "type": "energy_alert",
            "message": "High campus energy usage detected."
        })

    if total_water > 100:
        insights.append({
            "type": "water_alert",
            "message": "Water consumption exceeds threshold."
        })

    if total_waste > 200:
        insights.append({
            "type": "waste_alert",
            "message": "Waste generation is critically high."
        })

    if performance_data:
        best = performance_data[0]
        worst = performance_data[-1]

        insights.append({
            "type": "best_building",
            "message": f"Best performing building: {best['building']}"
        })

        insights.append({
            "type": "worst_building",
            "message": f"Needs improvement: {worst['building']}"
        })

    return insights