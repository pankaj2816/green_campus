from collections import defaultdict

from sqlalchemy.orm import Session

from app.ai.forecast import forecast_resources
from app.ai.risk import evaluate_resource_risk
from app.services.date_filters import apply_date_range
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


def build_alert_overview(
    db: Session,
    building: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
):
    energy_records = apply_date_range(
        _filter_query(db.query(EnergyData), EnergyData, building).order_by(EnergyData.timestamp),
        EnergyData,
        date_from,
        date_to,
    ).all()
    solar_records = apply_date_range(
        _filter_query(db.query(SolarData), SolarData, building).order_by(SolarData.timestamp),
        SolarData,
        date_from,
        date_to,
    ).all()
    water_records = apply_date_range(
        _filter_query(db.query(WaterData), WaterData, building).order_by(WaterData.timestamp),
        WaterData,
        date_from,
        date_to,
    ).all()
    waste_records = apply_date_range(
        _filter_query(db.query(WasteData), WasteData, building).order_by(WasteData.timestamp),
        WasteData,
        date_from,
        date_to,
    ).all()

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
                "category": "consumption",
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
                "category": "water",
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
                "category": "waste",
                "title": "Waste Surge",
                "message": "Waste generation is rising above the recent daily average and may need sorting or collection review.",
            })

    if energy_daily and solar_daily:
        recent_days = sorted(energy_daily)[-7:]
        if recent_days:
            average_net = sum(max(energy_daily.get(day, 0) - solar_daily.get(day, 0), 0) for day in recent_days) / len(recent_days)
            average_solar_cover = (
                sum(
                    (solar_daily.get(day, 0) / energy_daily.get(day, 0))
                    for day in recent_days
                    if energy_daily.get(day, 0) > 0
                )
                / max(sum(1 for day in recent_days if energy_daily.get(day, 0) > 0), 1)
            )
            if average_solar_cover < 0.15 and average_net > 0:
                alerts.append({
                    "level": "medium",
                    "category": "solar",
                    "title": "Low Solar Coverage",
                    "message": "Recent solar coverage has stayed low against demand, so daytime load shifting or generation checks may help.",
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

    forecast_payload = forecast_resources(
        db,
        granularity="daily",
        building=building,
        date_from=date_from,
        date_to=date_to,
    )
    risk_data = evaluate_resource_risk(forecast_payload)

    if risk_data and risk_data[0]["risk_level"] == "HIGH":
        alerts.append({
            "level": "high",
            "category": "forecast",
            "title": "High Forecast Risk",
            "message": risk_data[0]["message"],
        })

    if not alerts:
        alerts.append({
            "level": "low",
            "category": "system",
            "title": "System Stable",
            "message": "No major resource alerts are active right now.",
        })

    return {
        "scope": building or "Campus",
        "date_from": date_from,
        "date_to": date_to,
        "alerts": alerts,
        "export_ready_days": export_ready_days[:10],
        "export_ready_day_count": len(export_ready_days),
    }
