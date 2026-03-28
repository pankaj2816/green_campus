from collections import defaultdict

from sqlalchemy.orm import Session

from app.ai.forecast import forecast_resources
from app.ai.risk import evaluate_resource_risk
from app.models import EnergyData, SolarData, WasteData, WaterData


def _filter_query(query, model, building: str | None):
    if building:
        return query.filter(model.building == building)
    return query


def _daily_totals(records, field_name: str):
    totals = defaultdict(float)
    for record in records:
        totals[record.timestamp.date()] += float(getattr(record, field_name, 0) or 0)
    return totals


def build_alert_overview(db: Session, building: str | None = None):
    energy_records = _filter_query(db.query(EnergyData), EnergyData, building).order_by(EnergyData.timestamp).all()
    solar_records = _filter_query(db.query(SolarData), SolarData, building).order_by(SolarData.timestamp).all()
    water_records = _filter_query(db.query(WaterData), WaterData, building).order_by(WaterData.timestamp).all()
    waste_records = _filter_query(db.query(WasteData), WasteData, building).order_by(WasteData.timestamp).all()

    energy_daily = _daily_totals(energy_records, "consumption_kwh")
    solar_daily = _daily_totals(solar_records, "solar_kwh")
    water_daily = _daily_totals(water_records, "consumption_kl")
    waste_daily = _daily_totals(waste_records, "quantity_kg")

    alerts = []

    if energy_daily:
        energy_values = list(energy_daily.values())
        avg_energy = sum(energy_values) / len(energy_values)
        latest_date = max(energy_daily)
        latest_energy = energy_daily[latest_date]
        if avg_energy and latest_energy > avg_energy * 1.18:
            alerts.append({
                "level": "high",
                "title": "Energy Spike",
                "message": f"Latest daily energy use is {round(((latest_energy - avg_energy) / avg_energy) * 100, 1)}% above the recent average.",
            })

    if water_daily:
        water_values = list(water_daily.values())
        avg_water = sum(water_values) / len(water_values)
        latest_date = max(water_daily)
        latest_water = water_daily[latest_date]
        if avg_water and latest_water > avg_water * 1.15:
            alerts.append({
                "level": "medium",
                "title": "Water Leak Check",
                "message": "Water use is notably higher than the recent daily baseline, so leak inspection is worth checking.",
            })

    if waste_daily:
        waste_values = list(waste_daily.values())
        avg_waste = sum(waste_values) / len(waste_values)
        latest_date = max(waste_daily)
        latest_waste = waste_daily[latest_date]
        if avg_waste and latest_waste > avg_waste * 1.2:
            alerts.append({
                "level": "medium",
                "title": "Waste Surge",
                "message": "Waste generation is rising above the recent daily average and may need sorting or collection review.",
            })

    export_ready_days = []
    for day in sorted(set(energy_daily) | set(solar_daily)):
        solar_total = solar_daily.get(day, 0)
        energy_total = energy_daily.get(day, 0)
        if solar_total > energy_total:
            export_ready_days.append({
                "date": day.isoformat(),
                "surplus_kwh": round(solar_total - energy_total, 2),
            })

    forecast_payload = forecast_resources(db, granularity="daily", building=building)
    risk_data = evaluate_resource_risk(forecast_payload)

    if risk_data and risk_data[0]["risk_level"] == "HIGH":
        alerts.append({
            "level": "high",
            "title": "High Forecast Risk",
            "message": risk_data[0]["message"],
        })

    if not alerts:
        alerts.append({
            "level": "low",
            "title": "System Stable",
            "message": "No major resource alerts are active right now.",
        })

    return {
        "scope": building or "Campus",
        "alerts": alerts,
        "export_ready_days": export_ready_days[:10],
        "export_ready_day_count": len(export_ready_days),
    }
