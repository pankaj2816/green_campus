from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

router = APIRouter(prefix="/solar", tags=["Solar"])


@router.post("/")
def add_solar(building: str, solar_kwh: float, db: Session = Depends(get_db)):
    solar = models.SolarData(
        building=building,
        solar_kwh=solar_kwh
    )
    db.add(solar)
    db.commit()
    db.refresh(solar)
    return {"message": "Solar data added"}


@router.get("/")
def get_solar(db: Session = Depends(get_db)):
    solar = db.query(models.SolarData).all()
    total_solar = sum(s.solar_kwh for s in solar)

    return {
        "total_solar_kwh": round(total_solar, 2),
        "records": solar
    }