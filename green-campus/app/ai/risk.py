from app.services.carbon import calculate_carbon
from app.services.metrics_config import get_runtime_constants


def evaluate_resource_risk(forecast_payload):
    energy_payload = forecast_payload.get("energy", {})
    historical_values = energy_payload.get("historical_values", [])
    forecast_values = energy_payload.get("forecast_values", [])
    lower_values = energy_payload.get("forecast_lower", [])
    upper_values = energy_payload.get("forecast_upper", [])
    occupancy_factors = energy_payload.get("occupancy_factors", [])

    if not historical_values or not forecast_values:
        return []

    current = historical_values[-1]
    future = forecast_values[-1]
    baseline = historical_values[:-1] or historical_values
    baseline_avg = sum(baseline) / len(baseline) if baseline else current

    growth_percent = ((future - current) / current) * 100 if current else 0.0
    volatility_percent = (
        ((max(historical_values) - min(historical_values)) / baseline_avg) * 100
        if baseline_avg
        else 0.0
    )
    confidence_band_percent = (
        (((upper_values[-1] - lower_values[-1]) / future) * 100) if future and lower_values and upper_values else 0.0
    )
    average_future_occupancy = sum(occupancy_factors) / len(occupancy_factors) if occupancy_factors else 1.0
    occupancy_applied = energy_payload.get("occupancy_adjustment_applied", False)
    occupancy_impact_percent = round((average_future_occupancy - 1.0) * 100, 2) if occupancy_applied else 0.0

    risk_score = 0
    if growth_percent > 18:
        risk_score += 2
    elif growth_percent > 8:
        risk_score += 1

    if volatility_percent > 35:
        risk_score += 2
    elif volatility_percent > 18:
        risk_score += 1

    if confidence_band_percent > 30:
        risk_score += 1

    if occupancy_applied and average_future_occupancy > 0.95:
        risk_score += 1

    if risk_score >= 4:
        risk_level = "HIGH"
    elif risk_score >= 2:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    trend_direction = "upward" if growth_percent > 0 else "downward" if growth_percent < 0 else "stable"
    constants = forecast_payload.get("metric_constants") or get_runtime_constants()
    solar_payload = forecast_payload.get("solar", {})
    solar_by_label = dict(zip(solar_payload.get("forecast_labels", []), solar_payload.get("forecast_values", [])))
    energy_label = (energy_payload.get("forecast_labels") or [None])[-1]
    projected_net = max(future - solar_by_label.get(energy_label, 0), 0)
    projected_cost = round(projected_net * constants["energy_cost_per_kwh"], 2)
    projected_carbon = round(calculate_carbon(projected_net, constants["emission_factor_kg_per_kwh"]), 2)

    if occupancy_applied and average_future_occupancy < 0.7:
        primary_driver = "Lower expected campus occupancy is moderating future demand."
    elif growth_percent > 0:
        primary_driver = "The historical seasonal reference projects higher demand; assumed occupancy is shown separately, not treated as a measured cause."
    else:
        primary_driver = "Recent demand is stable or softening, so risk mainly comes from variability."

    return [{
        "building": forecast_payload.get("building", "Campus"),
        "granularity": forecast_payload.get("granularity", "monthly"),
        "risk_level": risk_level,
        "trend_direction": trend_direction,
        "growth_percent": round(growth_percent, 2),
        "volatility_percent": round(volatility_percent, 2),
        "confidence_band_percent": round(confidence_band_percent, 2),
        "occupancy_impact_percent": occupancy_impact_percent,
        "average_future_occupancy": round(average_future_occupancy, 2),
        "occupancy_adjustment_applied": occupancy_applied,
        "spread_type": energy_payload.get("spread_type"),
        "risk_note": "Heuristic planning indicator, not a validated probability. Forecast spread is not a calibrated confidence interval.",
        "projected_energy": round(future, 2),
        "projected_net_energy": round(projected_net, 2),
        "projected_energy_low": round(lower_values[-1], 2) if lower_values else round(future, 2),
        "projected_energy_high": round(upper_values[-1], 2) if upper_values else round(future, 2),
        "projected_cost": projected_cost,
        "projected_carbon": projected_carbon,
        "primary_driver": primary_driver,
        "message": (
            f"Energy demand is trending {trend_direction} with a projected "
            f"{round(growth_percent, 2)}% change, {round(volatility_percent, 2)}% volatility, "
            f"and a {round(confidence_band_percent, 2)}% forecast range."
        ),
    }]
