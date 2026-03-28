from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas

router = APIRouter(prefix="/water", tags=["Water"])

@router.post("/")
def add_water(data: schemas.WaterCreate, db: Session = Depends(get_db)):
    return crud.create_water(db, data)

@router.get("/")
def get_water(db: Session = Depends(get_db)):
    water = crud.get_all_water(db)
    total_kl = sum(w.consumption_kl for w in water)

    return {
        "total_water_kl": total_kl,
        "records": water
    }