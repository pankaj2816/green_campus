from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas

router = APIRouter(prefix="/waste", tags=["Waste"])

@router.post("/")
def add_waste(data: schemas.WasteCreate, db: Session = Depends(get_db)):
    return crud.create_waste(db, data)

@router.get("/")
def get_waste(db: Session = Depends(get_db)):
    waste = crud.get_all_waste(db)
    total_kg = sum(w.quantity_kg for w in waste)

    return {
        "total_waste_kg": total_kg,
        "records": waste
    }