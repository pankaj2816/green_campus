from sqlalchemy.orm import Session

from app.models import EnergyData, SolarData, WasteData, WaterData
from app.services.carbon import calculate_carbon
from app.services.metrics_config import (
    ANOMALY_THRESHOLD_PERCENT,
    ENERGY_COST_PER_KWH,
    HIGH_ANOMALY_THRESHOLD_PERCENT,
)


def _filter_query(query, model, building: str | None):
    if building:
        return query.filter(model.building == building)
    return query


def _resource_totals(db: Session, building: str | None):
    energy_records = _filter_query(db.query(EnergyData), EnergyData, building).all()
    water_records = _filter_query(db.query(WaterData), WaterData, building).all()
    waste_records = _filter_query(db.query(WasteData), WasteData, building).all()
    solar_records = _filter_query(db.query(SolarData), SolarData, building).all()

    return {
        "energy": [record.consumption_kwh for record in energy_records],
        "water": [record.consumption_kl for record in water_records],
        "waste": [record.quantity_kg for record in waste_records],
        "solar": [record.solar_kwh for record in solar_records],
    }


def _anomaly_card(resource_name: str, values, unit: str):
    if len(values) < 4:
        return None

    latest = values[-1]
    historical = values[:-1]
    avg_value = sum(historical) / len(historical)
    deviation = 0 if avg_value == 0 else ((latest - avg_value) / avg_value) * 100

    if abs(deviation) < ANOMALY_THRESHOLD_PERCENT:
        return None

    return {
        "resource": resource_name,
        "severity": "high" if abs(deviation) >= HIGH_ANOMALY_THRESHOLD_PERCENT else "medium",
        "deviation_percent": round(deviation, 2),
        "message": (
            f"{resource_name.title()} moved {round(deviation, 2)}% from its recent average. "
            f"Latest reading: {round(latest, 2)} {unit}."
        ),
    }


def _opportunity_cards(totals, forecast_payload):
    opportunities = []

    gross_energy = sum(totals["energy"])
    solar_energy = sum(totals["solar"])
    water_total = sum(totals["water"])
    waste_total = sum(totals["waste"])
    net_energy = max(gross_energy - solar_energy, 0)

    if gross_energy > 0:
        solar_ratio = (solar_energy / gross_energy) * 100
        opportunities.append({
            "title": "Solar Offset",
            "metric": round(solar_ratio, 2),
            "unit": "%",
            "message": f"Solar currently offsets {round(solar_ratio, 2)}% of gross electricity demand.",
        })

        opportunities.append({
            "title": "Carbon Footprint",
        "metric": round(calculate_carbon(net_energy), 2),
        "unit": "kg CO2",
        "message": "Scope 2 emissions remain the highest-impact sustainability lever in the current dataset.",
    })

    forecast_energy = forecast_payload.get("energy", {}).get("forecast_values", [])
    if forecast_energy:
        peak_energy = max(forecast_energy)
        opportunities.append({
            "title": "Peak Forecast",
            "metric": round(peak_energy, 2),
            "unit": "kWh",
            "message": "The AI forecast suggests future peak-load planning should focus on the highest projected energy period.",
        })

    if water_total > 0:
        opportunities.append({
            "title": "Water Use",
            "metric": round(water_total, 2),
            "unit": "KL",
            "message": "Water efficiency improvements can be targeted through leak detection and reuse scheduling.",
        })

    if waste_total > 0:
        opportunities.append({
            "title": "Waste Load",
            "metric": round(waste_total, 2),
            "unit": "kg",
            "message": "Waste segregation and recycling campaigns remain a visible operational improvement area.",
        })

    if net_energy > 0:
        opportunities.append({
            "title": "Energy Cost Exposure",
            "metric": round(net_energy * ENERGY_COST_PER_KWH, 2),
            "unit": "Rs",
            "message": "This is the estimated electricity spend implied by current net energy consumption assumptions.",
        })

    return opportunities


def _recommendations(totals, anomalies, risk_data):
    recs = []

    energy_total = sum(totals["energy"])
    water_total = sum(totals["water"])
    waste_total = sum(totals["waste"])
    solar_total = sum(totals["solar"])

    if energy_total > solar_total:
        recs.append({
            "title": "Shift Non-Critical Loads",
            "priority": "high",
            "message": "Move flexible electrical loads toward solar-rich hours to reduce grid dependence and carbon intensity.",
        })

    if water_total > 0:
        recs.append({
            "title": "Leak and Fixture Audit",
            "priority": "medium",
            "message": "Track daily water baselines building by building and flag abrupt consumption jumps for inspection.",
        })

    if waste_total > 0:
        recs.append({
            "title": "Smart Segregation Plan",
            "priority": "medium",
            "message": "Combine waste hotspots with awareness drives and collection scheduling to reduce landfill load.",
        })

    if anomalies:
        recs.append({
            "title": "Investigate Latest Anomalies",
            "priority": "high",
            "message": "Recent deviations indicate operations or equipment behavior changed enough to justify manual review.",
        })

    if risk_data and risk_data[0]["risk_level"] == "HIGH":
        recs.append({
            "title": "Peak Demand Response",
            "priority": "high",
            "message": "Forecasted growth risk is high, so prepare peak-shaving actions and occupancy-aware controls.",
        })

    return recs


def generate_insights(
    db: Session,
    performance_data,
    forecast_payload=None,
    risk_data=None,
    building: str | None = None,
):
    totals = _resource_totals(db, building)

    anomalies = []
    resource_definitions = [
        ("energy", totals["energy"], "kWh"),
        ("water", totals["water"], "KL"),
        ("waste", totals["waste"], "kg"),
        ("solar", totals["solar"], "kWh"),
    ]

    for resource_name, values, unit in resource_definitions:
        card = _anomaly_card(resource_name, values, unit)
        if card:
            anomalies.append(card)

    insights = []
    if performance_data:
        best = performance_data[0]
        worst = performance_data[-1]
        insights.append({
            "type": "best_building",
            "message": f"Best performing building: {best['building']}",
        })
        insights.append({
            "type": "worst_building",
            "message": f"Needs improvement: {worst['building']}",
        })

    opportunities = _opportunity_cards(totals, forecast_payload or {})
    recommendations = _recommendations(totals, anomalies, risk_data or [])

    return {
        "scope": building or "Campus",
        "headline_insights": insights,
        "anomalies": anomalies,
        "opportunities": opportunities,
        "recommendations": recommendations,
    }
