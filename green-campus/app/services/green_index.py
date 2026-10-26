def calculate_green_index(net_energy: float, water: float, waste: float, constants: dict) -> dict:
    """Score campus resources the same way the dashboard does.

    Each resource is capped at its benchmark, combined with the configured
    weights, then inverted so a higher Green Index means lower resource pressure.
    """
    weights = constants.get("weights") or {}
    energy_benchmark = float(constants.get("energy_benchmark") or 0)
    water_benchmark = float(constants.get("water_benchmark") or 0)
    waste_benchmark = float(constants.get("waste_benchmark") or 0)

    energy_ratio = min(float(net_energy) / energy_benchmark, 1) if energy_benchmark else 0
    water_ratio = min(float(water) / water_benchmark, 1) if water_benchmark else 0
    waste_ratio = min(float(waste) / waste_benchmark, 1) if waste_benchmark else 0
    efficiency_score = (
        (float(weights.get("energy", 0) or 0) * energy_ratio)
        + (float(weights.get("water", 0) or 0) * water_ratio)
        + (float(weights.get("waste", 0) or 0) * waste_ratio)
    )

    return {
        "energy_score": round((1 - energy_ratio) * 100, 2),
        "water_score": round((1 - water_ratio) * 100, 2),
        "waste_score": round((1 - waste_ratio) * 100, 2),
        "green_index": round((1 - efficiency_score) * 100, 2),
    }
