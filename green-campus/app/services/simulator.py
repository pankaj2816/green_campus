from sqlalchemy.orm import Session

from app import models
from app.services.carbon import calculate_carbon
from app.services.metrics_config import (
    ENERGY_BENCHMARK,
    ENERGY_COST_PER_KWH,
    GREEN_INDEX_WEIGHTS,
    WASTE_BENCHMARK,
    WATER_BENCHMARK,
)


def _apply_filter(query, model, building: str | None):
    if building:
        return query.filter(model.building == building)
    return query


def _totals(db: Session, building: str | None):
    energy = sum(entry.consumption_kwh for entry in _apply_filter(db.query(models.EnergyData), models.EnergyData, building).all())
    water = sum(entry.consumption_kl for entry in _apply_filter(db.query(models.WaterData), models.WaterData, building).all())
    waste = sum(entry.quantity_kg for entry in _apply_filter(db.query(models.WasteData), models.WasteData, building).all())
    solar = sum(entry.solar_kwh for entry in _apply_filter(db.query(models.SolarData), models.SolarData, building).all())

    return {
        "energy": float(energy),
        "water": float(water),
        "waste": float(waste),
        "solar": float(solar),
    }


def _green_index(net_energy: float, water: float, waste: float):
    energy_score = min(net_energy / ENERGY_BENCHMARK, 1)
    water_score = min(water / WATER_BENCHMARK, 1)
    waste_score = min(waste / WASTE_BENCHMARK, 1)
    efficiency_score = (
        (GREEN_INDEX_WEIGHTS["energy"] * energy_score) +
        (GREEN_INDEX_WEIGHTS["water"] * water_score) +
        (GREEN_INDEX_WEIGHTS["waste"] * waste_score)
    )
    return round((1 - efficiency_score) * 100, 2)


def simulate_sustainability_impact(db: Session, building: str | None, inputs: dict):
    baseline = _totals(db, building)

    energy_reduction_pct = float(inputs.get("energy_reduction_pct", 0) or 0)
    water_reduction_pct = float(inputs.get("water_reduction_pct", 0) or 0)
    waste_reduction_pct = float(inputs.get("waste_reduction_pct", 0) or 0)
    solar_increase_pct = float(inputs.get("solar_increase_pct", 0) or 0)

    projected = {
        "energy": baseline["energy"] * (1 - energy_reduction_pct / 100),
        "water": baseline["water"] * (1 - water_reduction_pct / 100),
        "waste": baseline["waste"] * (1 - waste_reduction_pct / 100),
        "solar": baseline["solar"] * (1 + solar_increase_pct / 100),
    }

    baseline_net_energy = max(baseline["energy"] - baseline["solar"], 0)
    projected_net_energy = max(projected["energy"] - projected["solar"], 0)

    baseline_carbon = calculate_carbon(baseline_net_energy)
    projected_carbon = calculate_carbon(projected_net_energy)
    baseline_cost = baseline_net_energy * ENERGY_COST_PER_KWH
    projected_cost = projected_net_energy * ENERGY_COST_PER_KWH

    return {
        "scope": building or "Campus",
        "inputs": {
            "energy_reduction_pct": energy_reduction_pct,
            "water_reduction_pct": water_reduction_pct,
            "waste_reduction_pct": waste_reduction_pct,
            "solar_increase_pct": solar_increase_pct,
        },
        "baseline": {
            **{key: round(value, 2) for key, value in baseline.items()},
            "net_energy": round(baseline_net_energy, 2),
            "carbon": round(baseline_carbon, 2),
            "energy_cost": round(baseline_cost, 2),
            "green_index": _green_index(baseline_net_energy, baseline["water"], baseline["waste"]),
        },
        "projected": {
            **{key: round(value, 2) for key, value in projected.items()},
            "net_energy": round(projected_net_energy, 2),
            "carbon": round(projected_carbon, 2),
            "energy_cost": round(projected_cost, 2),
            "green_index": _green_index(projected_net_energy, projected["water"], projected["waste"]),
        },
        "impact": {
            "carbon_saved": round(baseline_carbon - projected_carbon, 2),
            "cost_saved": round(baseline_cost - projected_cost, 2),
            "green_index_gain": round(
                _green_index(projected_net_energy, projected["water"], projected["waste"]) -
                _green_index(baseline_net_energy, baseline["water"], baseline["waste"]),
                2,
            ),
        },
    }
