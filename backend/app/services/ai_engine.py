from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import EnergyData
from datetime import datetime

ANOMALY_THRESHOLD = 0.25  # 25% deviation


def detect_energy_anomalies(db: Session):
    anomalies = []

    # Get all buildings
    buildings = db.query(EnergyData.building).distinct().all()
    buildings = [b[0] for b in buildings]

    for building in buildings:

        records = (
            db.query(EnergyData)
            .filter(EnergyData.building == building)
            .order_by(EnergyData.timestamp)
            .all()
        )

        if len(records) < 3:
            continue  # not enough history

        # Historical average (exclude latest entry)
        historical = records[:-1]
        latest = records[-1]

        avg_energy = sum(r.consumption_kwh for r in historical) / len(historical)

        if avg_energy == 0:
            continue

        deviation = (latest.consumption_kwh - avg_energy) / avg_energy

        if abs(deviation) > ANOMALY_THRESHOLD:
            anomalies.append({
                "building": building,
                "type": "energy_spike" if deviation > 0 else "energy_drop",
                "deviation_percent": round(deviation * 100, 2),
                "message": (
                    f"Energy usage {'increased' if deviation > 0 else 'decreased'} "
                    f"by {round(deviation * 100, 2)}% compared to historical average."
                )
            })

    return anomalies