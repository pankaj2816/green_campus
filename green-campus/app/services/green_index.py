def calculate_green_index(net_energy: float | None, water: float | None, waste: float | None, constants: dict) -> dict:
    """Score campus resources the same way the dashboard does.

    Each resource is capped at its benchmark, combined with the configured
    weights, then inverted so a higher Green Index means lower resource pressure.
    """
    weights = constants.get("weights") or {}
    values = {"energy": net_energy, "water": water, "waste": waste}
    assessed = [name for name, value in values.items() if value is not None
                and float(constants.get(f"{name}_benchmark") or 0) > 0]
    weight_sum = sum(float(weights.get(name, 0) or 0) for name in assessed)
    ratios = {name: min(max(float(values[name]), 0) / float(constants[f"{name}_benchmark"]), 1)
              for name in assessed}
    pressure = sum(float(weights.get(name, 0) or 0) * ratios[name] for name in assessed)
    unavailable = [name for name in values if name not in assessed]
    return {
        **{f"{name}_score": round((1 - ratios[name]) * 100, 2) if name in ratios else None
           for name in values},
        "green_index": round((1 - pressure / weight_sum) * 100, 2) if weight_sum else None,
        "assessment": "unavailable" if not weight_sum else "partial" if unavailable else "complete",
        "assessed_resources": assessed,
        "unavailable_resources": unavailable,
        "note": "Missing resources are excluded and available weights renormalized. Partial scores are not directly comparable to complete scores; benchmarks are configured assumptions.",
    }
