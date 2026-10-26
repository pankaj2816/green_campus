from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db
from app.routers.auth import get_current_user, require_admin

router = APIRouter(prefix="/waste", tags=["Waste"])


def _serialize_waste(entry: models.WasteData):
    return {
        "id": entry.id,
        "building": entry.building,
        "waste_type": entry.waste_type or "general",
        "quantity_kg": entry.quantity_kg,
        "timestamp": entry.timestamp.isoformat() if entry.timestamp else None,
    }


@router.post("/")
def add_waste(
    data: schemas.WasteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    created = crud.create_waste(db, data)
    return _serialize_waste(created)


@router.get("/")
def get_waste(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    waste = crud.get_all_waste(db)
    total_kg = sum(item.quantity_kg for item in waste)
    by_type = {}
    for item in waste:
        label = (item.waste_type or "general").strip() or "general"
        by_type[label] = by_type.get(label, 0) + float(item.quantity_kg or 0)

    return {
        "total_waste_kg": total_kg,
        "waste_by_type": {label: round(quantity, 2) for label, quantity in sorted(by_type.items())},
        "records": [_serialize_waste(item) for item in waste],
    }
