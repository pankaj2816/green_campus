def evaluate_energy_risk(forecast_data):

    results = []

    # get energy prediction series
    predictions = forecast_data.get("energy", [])

    # safety check
    if not isinstance(predictions, list) or len(predictions) < 2:
        return []

    current = predictions[0]
    future = predictions[-1]

    # avoid divide by zero
    if current == 0:
        growth_percent = 0
    else:
        growth_percent = ((future - current) / current) * 100

    # risk classification
    if growth_percent > 20:
        risk_level = "HIGH"
    elif growth_percent > 10:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # cost & carbon estimation
    projected_cost = round(future * 8, 2)       # ₹8 per kWh assumption
    projected_carbon = round(future * 0.82, 2)  # carbon factor

    results.append({
        "building": "Campus",
        "risk_level": risk_level,
        "growth_percent": round(growth_percent, 2),
        "projected_cost": projected_cost,
        "projected_carbon": projected_carbon
    })

    return results