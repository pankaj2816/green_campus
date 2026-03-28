from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.routers.auth import get_current_user
from app.services.carbon import calculate_carbon
from app.services.metrics_config import (
    ENERGY_BENCHMARK,
    GREEN_INDEX_WEIGHTS,
    WASTE_BENCHMARK,
    WATER_BENCHMARK,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _apply_building_filter(query, model, building: str | None):
    if building:
        return query.filter(model.building == building)
    return query


def calculate_building_performance(db: Session, building: str | None = None):
    energy_query = db.query(
        models.EnergyData.building,
        func.sum(models.EnergyData.consumption_kwh).label("total_energy"),
    )
    water_query = db.query(
        models.WaterData.building,
        func.sum(models.WaterData.consumption_kl).label("total_water"),
    )
    waste_query = db.query(
        models.WasteData.building,
        func.sum(models.WasteData.quantity_kg).label("total_waste"),
    )
    solar_query = db.query(
        models.SolarData.building,
        func.sum(models.SolarData.solar_kwh).label("total_solar"),
    )

    if building:
        energy_query = energy_query.filter(models.EnergyData.building == building)
        water_query = water_query.filter(models.WaterData.building == building)
        waste_query = waste_query.filter(models.WasteData.building == building)
        solar_query = solar_query.filter(models.SolarData.building == building)

    energy = energy_query.group_by(models.EnergyData.building).all()
    water = water_query.group_by(models.WaterData.building).all()
    waste = waste_query.group_by(models.WasteData.building).all()
    solar = solar_query.group_by(models.SolarData.building).all()

    performance = {}

    for entry in energy:
        performance[entry.building] = {
            "energy": float(entry.total_energy or 0),
            "solar": 0.0,
            "net_energy": 0.0,
            "water": 0.0,
            "waste": 0.0,
        }

    for entry in water:
        performance.setdefault(entry.building, {"energy": 0.0, "solar": 0.0, "net_energy": 0.0, "water": 0.0, "waste": 0.0})
        performance[entry.building]["water"] = float(entry.total_water or 0)

    for entry in waste:
        performance.setdefault(entry.building, {"energy": 0.0, "solar": 0.0, "net_energy": 0.0, "water": 0.0, "waste": 0.0})
        performance[entry.building]["waste"] = float(entry.total_waste or 0)

    for entry in solar:
        performance.setdefault(entry.building, {"energy": 0.0, "solar": 0.0, "net_energy": 0.0, "water": 0.0, "waste": 0.0})
        performance[entry.building]["solar"] = float(entry.total_solar or 0)

    if not performance:
        return []

    for values in performance.values():
        values["net_energy"] = max(values["energy"] - values["solar"], 0)

    max_energy = max((values["net_energy"] for values in performance.values()), default=1)
    max_water = max((values["water"] for values in performance.values()), default=1)
    max_waste = max((values["waste"] for values in performance.values()), default=1)

    results = []
    for building_name, values in performance.items():
        norm_energy = values["net_energy"] / max_energy if max_energy else 0
        norm_water = values["water"] / max_water if max_water else 0
        norm_waste = values["waste"] / max_waste if max_waste else 0
        score = (
            (GREEN_INDEX_WEIGHTS["energy"] * norm_energy) +
            (GREEN_INDEX_WEIGHTS["water"] * norm_water) +
            (GREEN_INDEX_WEIGHTS["waste"] * norm_waste)
        )

        results.append({
            "building": building_name,
            "energy": round(values["energy"], 2),
            "solar": round(values["solar"], 2),
            "net_energy": round(values["net_energy"], 2),
            "water": round(values["water"], 2),
            "waste": round(values["waste"], 2),
            "carbon": round(calculate_carbon(values["net_energy"]), 2),
            "efficiency_score": round(score, 3),
        })

    results.sort(key=lambda item: item["efficiency_score"])
    for index, item in enumerate(results, start=1):
        item["rank"] = index

    return results


@router.get("/building-performance")
def building_performance(
    building: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return calculate_building_performance(db, building=building)


@router.get("/all-buildings")
def get_all_buildings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    building_names = set()

    for model in (models.EnergyData, models.WaterData, models.WasteData, models.SolarData):
        rows = db.query(model.building).distinct().all()
        for row in rows:
            if row[0]:
                building_names.add(row[0])

    return sorted(building_names)


@router.get("/summary")
def get_summary(
    building: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    energy_query = _apply_building_filter(db.query(models.EnergyData), models.EnergyData, building)
    water_query = _apply_building_filter(db.query(models.WaterData), models.WaterData, building)
    waste_query = _apply_building_filter(db.query(models.WasteData), models.WasteData, building)
    solar_query = _apply_building_filter(db.query(models.SolarData), models.SolarData, building)

    total_energy = sum(entry.consumption_kwh for entry in energy_query.all())
    total_water = sum(entry.consumption_kl for entry in water_query.all())
    total_waste = sum(entry.quantity_kg for entry in waste_query.all())
    total_solar = sum(entry.solar_kwh for entry in solar_query.all())

    net_energy = max(total_energy - total_solar, 0)
    carbon = calculate_carbon(net_energy)

    energy_score = min(net_energy / ENERGY_BENCHMARK, 1)
    water_score = min(total_water / WATER_BENCHMARK, 1)
    waste_score = min(total_waste / WASTE_BENCHMARK, 1)
    efficiency_score = (
        (GREEN_INDEX_WEIGHTS["energy"] * energy_score) +
        (GREEN_INDEX_WEIGHTS["water"] * water_score) +
        (GREEN_INDEX_WEIGHTS["waste"] * waste_score)
    )
    green_index = round((1 - efficiency_score) * 100, 2)

    return {
        "scope": building or "Campus",
        "energy": round(total_energy, 2),
        "solar": round(total_solar, 2),
        "net_energy": round(net_energy, 2),
        "export_to_grid_kwh": round(max(total_solar - total_energy, 0), 2),
        "water": round(total_water, 2),
        "waste": round(total_waste, 2),
        "carbon": round(carbon, 2),
        "gross_carbon": round(calculate_carbon(total_energy), 2),
        "solar_avoided_carbon": round(calculate_carbon(min(total_solar, total_energy)), 2),
        "green_index": green_index,
    }
