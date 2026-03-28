from app.services.metrics_config import ENERGY_COST_PER_KWH


def evaluate_resource_risk(forecast_payload):
    energy_payload = forecast_payload.get("energy", {})
    historical_values = energy_payload.get("historical_values", [])
    forecast_values = energy_payload.get("forecast_values", [])

    if not historical_values or not forecast_values:
        return []

    current = historical_values[-1]
    future = forecast_values[-1]
    baseline = historical_values[:-1] or historical_values
    baseline_avg = sum(baseline) / len(baseline) if baseline else current

    if current == 0:
        growth_percent = 0.0
    else:
        growth_percent = ((future - current) / current) * 100

    if baseline_avg == 0:
        volatility_percent = 0.0
    else:
        volatility_percent = ((max(historical_values) - min(historical_values)) / baseline_avg) * 100

    if growth_percent > 20 or volatility_percent > 35:
        risk_level = "HIGH"
    elif growth_percent > 10 or volatility_percent > 20:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    trend_direction = "upward" if growth_percent > 0 else "downward" if growth_percent < 0 else "stable"
    projected_cost = round(future * ENERGY_COST_PER_KWH, 2)
    projected_carbon = round(future * 0.82, 2)

    return [{
        "building": forecast_payload.get("building", "Campus"),
        "granularity": forecast_payload.get("granularity", "monthly"),
        "risk_level": risk_level,
        "trend_direction": trend_direction,
        "growth_percent": round(growth_percent, 2),
        "volatility_percent": round(volatility_percent, 2),
        "projected_energy": round(future, 2),
        "projected_cost": projected_cost,
        "projected_carbon": projected_carbon,
        "message": (
            f"Energy demand is trending {trend_direction} with a projected "
            f"{round(growth_percent, 2)}% change and {round(volatility_percent, 2)}% volatility."
        ),
    }]
