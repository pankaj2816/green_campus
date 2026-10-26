from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db
from app.routers.auth import get_current_user, require_admin

router = APIRouter(prefix="/water", tags=["Water"])


def _serialize_water(entry: models.WaterData):
    return {
        "id": entry.id,
        "building": entry.building,
        "consumption_kl": entry.consumption_kl,
        "timestamp": entry.timestamp.isoformat() if entry.timestamp else None,
    }


@router.post("/")
def add_water(
    data: schemas.WaterCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    created = crud.create_water(db, data)
    return _serialize_water(created)


@router.get("/")
def get_water(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    water = crud.get_all_water(db)
    total_kl = sum(item.consumption_kl for item in water)

    return {
        "total_water_kl": total_kl,
        "records": [_serialize_water(item) for item in water],
    }
