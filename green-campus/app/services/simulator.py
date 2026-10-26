from sqlalchemy.orm import Session

from app import models
from app.services.carbon import calculate_carbon
from app.services.green_index import calculate_green_index
from app.services.date_filters import apply_date_range
from app.services.metrics_config import (
    get_runtime_constants,
)
from app.services.settings_service import get_dashboard_settings


def _apply_filter(query, model, building: str | None):
    if building:
        return query.filter(model.building == building)
    return query


def _totals(db: Session, building: str | None, date_from: str | None = None, date_to: str | None = None):
    energy = sum(
        entry.consumption_kwh
        for entry in apply_date_range(
            _apply_filter(db.query(models.EnergyData), models.EnergyData, building),
            models.EnergyData,
            date_from,
            date_to,
        ).all()
    )
    water = sum(
        entry.consumption_kl
        for entry in apply_date_range(
            _apply_filter(db.query(models.WaterData), models.WaterData, building),
            models.WaterData,
            date_from,
            date_to,
        ).all()
    )
    waste = sum(
        entry.quantity_kg
        for entry in apply_date_range(
            _apply_filter(db.query(models.WasteData), models.WasteData, building),
            models.WasteData,
            date_from,
            date_to,
        ).all()
    )
    solar = sum(
        entry.solar_kwh
        for entry in apply_date_range(
            _apply_filter(db.query(models.SolarData), models.SolarData, building),
            models.SolarData,
            date_from,
            date_to,
        ).all()
    )

    return {
        "energy": float(energy),
        "water": float(water),
        "waste": float(waste),
        "solar": float(solar),
    }


def _green_index(net_energy: float, water: float, waste: float, constants: dict, availability: dict):
    return calculate_green_index(net_energy if availability["energy"] else None,
                                 water if availability["water"] else None,
                                 waste if availability["waste"] else None, constants)["green_index"]


def simulate_sustainability_impact(db: Session, building: str | None, inputs: dict):
    settings = get_dashboard_settings(db)
    constants = get_runtime_constants(settings)
    baseline = _totals(db, building, inputs.get("date_from"), inputs.get("date_to"))
    availability = {}
    for name, model in (("energy", models.EnergyData), ("water", models.WaterData),
                        ("waste", models.WasteData), ("solar", models.SolarData)):
        availability[name] = apply_date_range(_apply_filter(db.query(model), model, building), model,
                                              inputs.get("date_from"), inputs.get("date_to")).first() is not None

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

    baseline_carbon = calculate_carbon(baseline_net_energy, constants["emission_factor_kg_per_kwh"])
    projected_carbon = calculate_carbon(projected_net_energy, constants["emission_factor_kg_per_kwh"])
    baseline_cost = baseline_net_energy * constants["energy_cost_per_kwh"]
    projected_cost = projected_net_energy * constants["energy_cost_per_kwh"]
    baseline_index = _green_index(baseline_net_energy, baseline["water"], baseline["waste"], constants, availability)
    projected_index = _green_index(projected_net_energy, projected["water"], projected["waste"], constants, availability)

    return {
        "scope": building or "Campus",
        "resource_availability": availability,
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
            "green_index": baseline_index,
        },
        "projected": {
            **{key: round(value, 2) for key, value in projected.items()},
            "net_energy": round(projected_net_energy, 2),
            "carbon": round(projected_carbon, 2),
            "energy_cost": round(projected_cost, 2),
            "green_index": projected_index,
        },
        "impact": {
            "carbon_saved": round(baseline_carbon - projected_carbon, 2),
            "cost_saved": round(baseline_cost - projected_cost, 2),
            "green_index_gain": round(projected_index - baseline_index, 2)
                if projected_index is not None and baseline_index is not None else None,
        },
    }
