from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.routers.auth import get_current_user, require_admin

router = APIRouter(prefix="/solar", tags=["Solar"])


def _serialize_solar(entry: models.SolarData):
    return {
        "id": entry.id,
        "building": entry.building,
        "solar_kwh": entry.solar_kwh,
        "timestamp": entry.timestamp.isoformat() if entry.timestamp else None,
    }


@router.post("/")
def add_solar(
    building: str = Query(min_length=1, max_length=200, pattern=r"\S"),
    solar_kwh: float = Query(ge=0, allow_inf_nan=False),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    solar = models.SolarData(
        building=building.strip(),
        solar_kwh=solar_kwh,
    )
    db.add(solar)
    db.commit()
    db.refresh(solar)
    return _serialize_solar(solar)


@router.get("/")
def get_solar(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    solar = db.query(models.SolarData).all()
    total_solar = sum(item.solar_kwh for item in solar)

    return {
        "total_solar_kwh": round(total_solar, 2),
        "records": [_serialize_solar(item) for item in solar],
    }
