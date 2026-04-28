from sqlalchemy.orm import Session

from app.models import EnergyData, SolarData, WasteData, WaterData
from app.services.carbon import calculate_carbon
from app.services.date_filters import apply_date_range
from app.services.metrics_config import (
    ANOMALY_THRESHOLD_PERCENT,
    ENERGY_COST_PER_KWH,
    HIGH_ANOMALY_THRESHOLD_PERCENT,
)


def _filter_query(query, model, building: str | None):
    if building:
        return query.filter(model.building == building)
    return query


def _resource_totals(db: Session, building: str | None, date_from: str | None = None, date_to: str | None = None):
    energy_records = apply_date_range(
        _filter_query(db.query(EnergyData), EnergyData, building).order_by(EnergyData.timestamp),
        EnergyData,
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
    solar_records = apply_date_range(
        _filter_query(db.query(SolarData), SolarData, building).order_by(SolarData.timestamp),
        SolarData,
        date_from,
        date_to,
    ).all()

    return {
        "energy": [record.consumption_kwh for record in energy_records],
        "water": [record.consumption_kl for record in water_records],
        "waste": [record.quantity_kg for record in waste_records],
        "solar": [record.solar_kwh for record in solar_records],
    }


def _anomaly_card(resource_name: str, values, unit: str):
    if len(values) < 5:
        return None

    latest = values[-1]
    recent_window = values[-5:-1]
    avg_value = sum(recent_window) / len(recent_window)
    deviation = ((latest - avg_value) / avg_value) * 100 if avg_value else 0

    if abs(deviation) < ANOMALY_THRESHOLD_PERCENT:
        return None

    severity = "high" if abs(deviation) >= HIGH_ANOMALY_THRESHOLD_PERCENT else "medium"
    anomaly_type = "spike" if deviation > 0 else "drop"

    return {
        "resource": resource_name,
        "severity": severity,
        "type": anomaly_type,
        "deviation_percent": round(deviation, 2),
        "impact_score": round(min(abs(deviation) * 1.6, 100), 1),
        "message": (
            f"{resource_name.title()} shows a {round(deviation, 2)}% {anomaly_type} "
            f"versus its recent operating baseline. Latest reading: {round(latest, 2)} {unit}."
        ),
    }


def _peer_comparison(building: str | None, performance_data):
    if not building or not performance_data:
        return None

    current = next((item for item in performance_data if item["building"] == building), None)
    if not current:
        return None

    peer_values = [item["net_energy"] for item in performance_data if item["building"] != building]
    if not peer_values:
        return None

    peer_avg = sum(peer_values) / len(peer_values)
    if peer_avg == 0:
        return None

    delta_percent = ((current["net_energy"] - peer_avg) / peer_avg) * 100
    return {
        "building": building,
        "peer_average_net_energy": round(peer_avg, 2),
        "delta_percent": round(delta_percent, 2),
    }


def _opportunity_cards(totals, forecast_payload, peer_context=None):
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
            "impact_score": round(min(solar_ratio * 1.2, 100), 1),
            "message": f"Solar currently offsets {round(solar_ratio, 2)}% of gross electricity demand.",
        })
        opportunities.append({
            "title": "Carbon Footprint",
            "metric": round(calculate_carbon(net_energy), 2),
            "unit": "kg CO2",
            "impact_score": round(min((calculate_carbon(net_energy) / 1000) * 8, 100), 1),
            "message": "Reducing net grid energy will create the strongest near-term carbon benefit.",
        })

    forecast_energy = forecast_payload.get("energy", {}).get("forecast_values", [])
    if forecast_energy:
        peak_energy = max(forecast_energy)
        forecast_range = forecast_payload.get("energy", {}).get("forecast_upper", [])
        peak_buffer = round((max(forecast_range) - peak_energy), 2) if forecast_range else 0
        opportunities.append({
            "title": "Peak Forecast Window",
            "metric": round(peak_energy, 2),
            "unit": "kWh",
            "impact_score": round(min((peak_energy / 1000) * 10, 100), 1),
            "message": f"Prepare operations around the heaviest projected energy period. Uncertainty buffer: {peak_buffer} kWh.",
        })

    if peer_context and peer_context["delta_percent"] > 10:
        opportunities.append({
            "title": "Peer Efficiency Gap",
            "metric": peer_context["delta_percent"],
            "unit": "%",
            "impact_score": round(min(peer_context["delta_percent"] * 1.8, 100), 1),
            "message": f"{peer_context['building']} is using more net energy than peer buildings on average, which creates a targeted optimization opportunity.",
        })

    if water_total > 0:
        opportunities.append({
            "title": "Water Use",
            "metric": round(water_total, 2),
            "unit": "kl",
            "impact_score": round(min((water_total / 100) * 2, 100), 1),
            "message": "Water efficiency improvements can be targeted through leak detection and fixture scheduling.",
        })

    if waste_total > 0:
        opportunities.append({
            "title": "Waste Load",
            "metric": round(waste_total, 2),
            "unit": "kg",
            "impact_score": round(min((waste_total / 100) * 2.5, 100), 1),
            "message": "Waste segregation and collection planning remain visible operational improvement areas.",
        })

    if net_energy > 0:
        opportunities.append({
            "title": "Energy Cost Exposure",
            "metric": round(net_energy * ENERGY_COST_PER_KWH, 2),
            "unit": "Rs",
            "impact_score": round(min(((net_energy * ENERGY_COST_PER_KWH) / 10000) * 4, 100), 1),
            "message": "This is the estimated electricity spend implied by current net energy consumption.",
        })

    return opportunities


def _recommendations(totals, anomalies, risk_data, peer_context=None):
    recs = []

    energy_total = sum(totals["energy"])
    water_total = sum(totals["water"])
    waste_total = sum(totals["waste"])
    solar_total = sum(totals["solar"])
    net_energy = max(energy_total - solar_total, 0)

    if energy_total > solar_total:
        estimated_kwh = round(net_energy * 0.08, 2)
        recs.append({
            "title": "Shift Non-Critical Loads",
            "priority": "high",
            "effort": "medium",
            "message": "Move flexible electrical loads toward solar-rich hours to reduce grid dependence and carbon intensity.",
            "estimated_savings_kwh": estimated_kwh,
            "estimated_savings_rs": round(estimated_kwh * ENERGY_COST_PER_KWH, 2),
            "estimated_savings_carbon": round(calculate_carbon(estimated_kwh), 2),
        })

    if water_total > 0:
        recs.append({
            "title": "Leak and Fixture Audit",
            "priority": "medium",
            "effort": "medium",
            "message": "Track daily water baselines building by building and flag abrupt consumption jumps for inspection.",
            "estimated_savings_kwh": 0,
            "estimated_savings_rs": round(water_total * 0.02, 2),
            "estimated_savings_carbon": 0,
        })

    if waste_total > 0:
        recs.append({
            "title": "Smart Segregation Plan",
            "priority": "medium",
            "effort": "low",
            "message": "Combine waste hotspots with awareness drives and collection scheduling to reduce landfill load.",
            "estimated_savings_kwh": 0,
            "estimated_savings_rs": round(waste_total * 0.4, 2),
            "estimated_savings_carbon": 0,
        })

    if anomalies:
        recs.append({
            "title": "Investigate Latest Anomalies",
            "priority": "high",
            "effort": "low",
            "message": "Recent deviations indicate operations or equipment behavior changed enough to justify manual review.",
            "estimated_savings_kwh": round(net_energy * 0.03, 2),
            "estimated_savings_rs": round(net_energy * 0.03 * ENERGY_COST_PER_KWH, 2),
            "estimated_savings_carbon": round(calculate_carbon(net_energy * 0.03), 2),
        })

    if peer_context and peer_context["delta_percent"] > 10:
        peer_gap_kwh = round(net_energy * min(peer_context["delta_percent"] / 100, 0.12), 2)
        recs.append({
            "title": "Close Peer Performance Gap",
            "priority": "high",
            "effort": "medium",
            "message": "This building is materially above peer net-energy behavior, so targeted control tuning should be prioritized.",
            "estimated_savings_kwh": peer_gap_kwh,
            "estimated_savings_rs": round(peer_gap_kwh * ENERGY_COST_PER_KWH, 2),
            "estimated_savings_carbon": round(calculate_carbon(peer_gap_kwh), 2),
        })

    if risk_data and risk_data[0]["risk_level"] == "HIGH":
        recs.append({
            "title": "Peak Demand Response",
            "priority": "high",
            "effort": "high",
            "message": "Forecasted growth risk is high, so prepare peak-shaving actions and occupancy-aware controls.",
            "estimated_savings_kwh": round(risk_data[0]["projected_energy"] * 0.05, 2),
            "estimated_savings_rs": round(risk_data[0]["projected_energy"] * 0.05 * ENERGY_COST_PER_KWH, 2),
            "estimated_savings_carbon": round(calculate_carbon(risk_data[0]["projected_energy"] * 0.05), 2),
        })

    for item in recs:
        item["impact_score"] = round(
            min(
                (
                    float(item.get("estimated_savings_kwh", 0) or 0) * 0.02
                    + float(item.get("estimated_savings_rs", 0) or 0) / 1000
                    + float(item.get("estimated_savings_carbon", 0) or 0) * 0.04
                ),
                100,
            ),
            1,
        )

    recs.sort(key=lambda item: item["impact_score"], reverse=True)
    return recs


def generate_insights(
    db: Session,
    performance_data,
    forecast_payload=None,
    risk_data=None,
    building: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
):
    totals = _resource_totals(db, building, date_from, date_to)

    anomalies = []
    resource_definitions = [
        ("energy", totals["energy"], "kWh"),
        ("water", totals["water"], "kl"),
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

    peer_context = _peer_comparison(building, performance_data)
    opportunities = _opportunity_cards(totals, forecast_payload or {}, peer_context=peer_context)
    recommendations = _recommendations(totals, anomalies, risk_data or [], peer_context=peer_context)

    return {
        "scope": building or "Campus",
        "date_from": date_from,
        "date_to": date_to,
        "headline_insights": insights,
        "anomalies": anomalies,
        "opportunities": opportunities,
        "recommendations": recommendations,
        "peer_context": peer_context,
    }
