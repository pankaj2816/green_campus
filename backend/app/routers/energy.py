from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import crud, schemas, models
from app.services.carbon import calculate_carbon
from app.services.auth import get_current_user


router = APIRouter(prefix="/energy", tags=["Energy"])


# 🔐 Add Energy (Protected)
@router.post("/")
def add_energy(
    data: schemas.EnergyCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.create_energy(db, data)


# 🔐 Get All Energy Summary (Protected)
@router.get("/")
def get_energy(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    energy = crud.get_all_energy(db)

    total_kwh = sum(e.consumption_kwh for e in energy)
    carbon = calculate_carbon(total_kwh)

    return {
        "total_energy_kwh": total_kwh,
        "carbon_emission_kg": carbon,
        "records": energy
    }


from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import extract
from app.database import get_db
from app.models import EnergyData, SolarData

router = APIRouter(prefix="/energy", tags=["Energy"])


@router.get("/trend")
def energy_trend(db: Session = Depends(get_db)):

    energy = (
        db.query(
            extract("year", EnergyData.timestamp).label("year"),
            extract("month", EnergyData.timestamp).label("month"),
            EnergyData.consumption_kwh
        )
        .order_by(EnergyData.timestamp)
        .all()
    )

    solar = (
        db.query(
            extract("year", SolarData.timestamp).label("year"),
            extract("month", SolarData.timestamp).label("month"),
            SolarData.solar_kwh
        )
        .order_by(SolarData.timestamp)
        .all()
    )

    trend = []

    for i in range(len(energy)):

        energy_val = energy[i].consumption_kwh
        solar_val = solar[i].solar_kwh if i < len(solar) else 0

        month_label = f"{int(energy[i].month):02d}-{int(energy[i].year)}"

        trend.append({
            "month": month_label,
            "energy": energy_val,
            "solar": solar_val,
            "net": energy_val - solar_val
        })

    return trend


# 🔐 Energy by Building (Protected)
@router.get("/by-building")
def energy_by_building(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = (
        db.query(
            models.EnergyData.building,
            func.sum(models.EnergyData.consumption_kwh).label("total_kwh")
        )
        .group_by(models.EnergyData.building)
        .all()
    )

    return [
        {
            "building": r[0],
            "total_kwh": float(r[1])
        }
        for r in result
    ]

from sqlalchemy import extract
from app.models import EnergyData

@router.get("/monthly")
def monthly_energy(db: Session = Depends(get_db)):
    result = (
        db.query(
            extract('year', EnergyData.timestamp).label("year"),
            extract('month', EnergyData.timestamp).label("month"),
            func.sum(EnergyData.consumption_kwh).label("total_kwh")
        )
        .group_by("year", "month")
        .order_by("year", "month")
        .all()
    )

    return [
        {
            "year": int(r.year),
            "month": int(r.month),
            "total_kwh": float(r.total_kwh)
        }
        for r in result
    ]

@router.get("/daily")
def daily_energy(db: Session = Depends(get_db)):
    result = (
        db.query(
            extract('year', EnergyData.timestamp).label("year"),
            extract('month', EnergyData.timestamp).label("month"),
            extract('day', EnergyData.timestamp).label("day"),
            func.sum(EnergyData.consumption_kwh).label("total_kwh")
        )
        .group_by("year", "month", "day")
        .order_by("year", "month", "day")
        .all()
    )

    return [
        {
            "date": f"{int(r.year)}-{int(r.month)}-{int(r.day)}",
            "total_kwh": float(r.total_kwh)
        }
        for r in result
    ]