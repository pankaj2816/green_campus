from fastapi import APIRouter, Depends
from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db
from app.routers.auth import get_current_user
from app.services.carbon import calculate_carbon

router = APIRouter(prefix="/energy", tags=["Energy"])


def _apply_building_filter(query, building: str | None):
    if building:
        return query.filter(models.EnergyData.building == building)
    return query


@router.post("/")
def add_energy(
    data: schemas.EnergyCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud.create_energy(db, data)


@router.get("/")
def get_energy(
    building: str | None = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = _apply_building_filter(db.query(models.EnergyData), building)
    energy = query.all()
    total_kwh = sum(entry.consumption_kwh for entry in energy)

    return {
        "scope": building or "Campus",
        "total_energy_kwh": round(total_kwh, 2),
        "carbon_emission_kg": round(calculate_carbon(total_kwh), 2),
        "records": energy,
    }


@router.get("/trend")
def energy_trend(
    building: str | None = None,
    db: Session = Depends(get_db),
):
    energy_query = db.query(
        extract("year", models.EnergyData.timestamp).label("year"),
        extract("month", models.EnergyData.timestamp).label("month"),
        func.sum(models.EnergyData.consumption_kwh).label("energy_total"),
    )
    solar_query = db.query(
        extract("year", models.SolarData.timestamp).label("year"),
        extract("month", models.SolarData.timestamp).label("month"),
        func.sum(models.SolarData.solar_kwh).label("solar_total"),
    )

    if building:
        energy_query = energy_query.filter(models.EnergyData.building == building)
        solar_query = solar_query.filter(models.SolarData.building == building)

    energy_rows = energy_query.group_by("year", "month").order_by("year", "month").all()
    solar_rows = solar_query.group_by("year", "month").order_by("year", "month").all()

    solar_map = {
        (int(row.year), int(row.month)): float(row.solar_total or 0)
        for row in solar_rows
    }

    trend = []
    for row in energy_rows:
        key = (int(row.year), int(row.month))
        solar_value = solar_map.get(key, 0.0)
        energy_value = float(row.energy_total or 0)
        trend.append({
            "month": f"{key[1]:02d}-{key[0]}",
            "energy": round(energy_value, 2),
            "solar": round(solar_value, 2),
            "net": round(max(energy_value - solar_value, 0), 2),
        })

    return trend


@router.get("/by-building")
def energy_by_building(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = (
        db.query(
            models.EnergyData.building,
            func.sum(models.EnergyData.consumption_kwh).label("total_kwh"),
        )
        .group_by(models.EnergyData.building)
        .all()
    )

    return [
        {"building": row.building, "total_kwh": float(row.total_kwh or 0)}
        for row in result
    ]


@router.get("/monthly")
def monthly_energy(
    building: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(
        extract("year", models.EnergyData.timestamp).label("year"),
        extract("month", models.EnergyData.timestamp).label("month"),
        func.sum(models.EnergyData.consumption_kwh).label("total_kwh"),
    )

    if building:
        query = query.filter(models.EnergyData.building == building)

    result = query.group_by("year", "month").order_by("year", "month").all()

    return [
        {
            "year": int(row.year),
            "month": int(row.month),
            "total_kwh": float(row.total_kwh or 0),
        }
        for row in result
    ]


@router.get("/daily")
def daily_energy(
    building: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(
        extract("year", models.EnergyData.timestamp).label("year"),
        extract("month", models.EnergyData.timestamp).label("month"),
        extract("day", models.EnergyData.timestamp).label("day"),
        func.sum(models.EnergyData.consumption_kwh).label("total_kwh"),
    )

    if building:
        query = query.filter(models.EnergyData.building == building)

    result = query.group_by("year", "month", "day").order_by("year", "month", "day").all()

    return [
        {
            "date": f"{int(row.year)}-{int(row.month):02d}-{int(row.day):02d}",
            "total_kwh": float(row.total_kwh or 0),
        }
        for row in result
    ]
