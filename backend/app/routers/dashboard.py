from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models
from app.database import get_db
from app.models import EnergyData, WaterData, WasteData
from app.services.carbon import calculate_carbon
#from app.auth import get_current_user
from app.routers.auth import get_current_user
router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# ==========================================
# 🔹 BUILDING PERFORMANCE (RANKING ENGINE)
# ==========================================
@router.get("/building-performance")
def building_performance(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    energy = (
        db.query(
            models.EnergyData.building,
            func.sum(models.EnergyData.consumption_kwh).label("total_energy")
        )
        .group_by(models.EnergyData.building)
        .all()
    )

    water = (
        db.query(
            models.WaterData.building,
            func.sum(models.WaterData.consumption_kl).label("total_water")
        )
        .group_by(models.WaterData.building)
        .all()
    )

    waste = (
        db.query(
            models.WasteData.building,
            func.sum(models.WasteData.quantity_kg).label("total_waste")
        )
        .group_by(models.WasteData.building)
        .all()
    )

    solar = (
        db.query(
            models.SolarData.building,
            func.sum(models.SolarData.solar_kwh).label("total_solar")
        )
        .group_by(models.SolarData.building)
        .all()
    )

    performance = {}

    # ENERGY
    for e in energy:
        performance[e.building] = {
            "energy": float(e.total_energy or 0),
            "solar": 0,
            "net_energy": 0,
            "water": 0,
            "waste": 0
        }

    # WATER
    for w in water:
        if w.building not in performance:
            performance[w.building] = {"energy": 0, "solar": 0, "net_energy": 0, "water": 0, "waste": 0}
        performance[w.building]["water"] = float(w.total_water or 0)

    # WASTE
    for ws in waste:
        if ws.building not in performance:
            performance[ws.building] = {"energy": 0, "solar": 0, "net_energy": 0, "water": 0, "waste": 0}
        performance[ws.building]["waste"] = float(ws.total_waste or 0)

    # SOLAR
    for s in solar:
        if s.building not in performance:
            performance[s.building] = {"energy": 0, "solar": 0, "net_energy": 0, "water": 0, "waste": 0}
        performance[s.building]["solar"] = float(s.total_solar or 0)

    if not performance:
        return []

    # Calculate net energy + normalization
    for building, values in performance.items():
        values["net_energy"] = max(values["energy"] - values["solar"], 0)

    max_energy = max([v["net_energy"] for v in performance.values()] or [1])
    max_water = max([v["water"] for v in performance.values()] or [1])
    max_waste = max([v["waste"] for v in performance.values()] or [1])

    results = []

    for building, values in performance.items():

        norm_energy = values["net_energy"] / max_energy if max_energy else 0
        norm_water = values["water"] / max_water if max_water else 0
        norm_waste = values["waste"] / max_waste if max_waste else 0

        score = (0.5 * norm_energy) + (0.3 * norm_water) + (0.2 * norm_waste)

        carbon = calculate_carbon(values["net_energy"])

        results.append({
            "building": building,
            "energy": round(values["energy"], 2),
            "solar": round(values["solar"], 2),
            "net_energy": round(values["net_energy"], 2),
            "water": round(values["water"], 2),
            "waste": round(values["waste"], 2),
            "carbon": round(carbon, 2),
            "efficiency_score": round(score, 3)
        })

    results.sort(key=lambda x: x["efficiency_score"])

    for idx, r in enumerate(results):
        r["rank"] = idx + 1

    return results

# ==========================================
# 🔹 ALL BUILDINGS (FOR DROPDOWN FILTER)
# ==========================================
@router.get("/all-buildings")
def get_all_buildings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    energy_buildings = db.query(models.EnergyData.building).distinct().all()
    water_buildings = db.query(models.WaterData.building).distinct().all()
    waste_buildings = db.query(models.WasteData.building).distinct().all()

    buildings = set()

    for b in energy_buildings + water_buildings + waste_buildings:
        if b[0]:
            buildings.add(b[0])

    return list(buildings)


# ==========================================
# 🔹 DASHBOARD SUMMARY (CARDS DATA)
# ==========================================
@router.get("/summary")
def get_summary(
    building: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    energy_query = db.query(models.EnergyData)
    water_query = db.query(models.WaterData)
    waste_query = db.query(models.WasteData)
    solar_query = db.query(models.SolarData)

    if building:
        energy_query = energy_query.filter(models.EnergyData.building == building)
        water_query = water_query.filter(models.WaterData.building == building)
        waste_query = waste_query.filter(models.WasteData.building == building)
        solar_query = solar_query.filter(models.SolarData.building == building)

    # 🔹 Calculate totals FIRST
    total_energy = sum(e.consumption_kwh for e in energy_query.all())
    total_water = sum(w.consumption_kl for w in water_query.all())
    total_waste = sum(w.quantity_kg for w in waste_query.all())
    total_solar = sum(s.solar_kwh for s in solar_query.all())

    # 🔹 Net energy after solar
    net_energy = max(total_energy - total_solar, 0)

    carbon = calculate_carbon(net_energy)

    # Benchmarks
    ENERGY_BENCHMARK = 100000
    WATER_BENCHMARK = 20000
    WASTE_BENCHMARK = 30000

    energy_score = min(net_energy / ENERGY_BENCHMARK, 1)
    water_score = min(total_water / WATER_BENCHMARK, 1)
    waste_score = min(total_waste / WASTE_BENCHMARK, 1)

    efficiency_score = (
        (0.5 * energy_score) +
        (0.3 * water_score) +
        (0.2 * waste_score)
    )

    green_index = round((1 - efficiency_score) * 100, 2)

    return {
        "energy": round(total_energy, 2),
        "solar": round(total_solar, 2),
        "net_energy": round(net_energy, 2),
        "water": round(total_water, 2),
        "waste": round(total_waste, 2),
        "carbon": round(carbon, 2),
        "green_index": green_index
    }