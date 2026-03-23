from sqlalchemy.orm import Session
from app import models, schemas

def create_energy(db: Session, energy: schemas.EnergyCreate):
    db_energy = models.EnergyData(**energy.dict())
    db.add(db_energy)
    db.commit()
    db.refresh(db_energy)
    return db_energy

def get_all_energy(db: Session):
    return db.query(models.EnergyData).all()

# ---------------- WATER ----------------

def create_water(db: Session, water: schemas.WaterCreate):
    db_water = models.WaterData(**water.dict())
    db.add(db_water)
    db.commit()
    db.refresh(db_water)
    return db_water

def get_all_water(db: Session):
    return db.query(models.WaterData).all()

# ---------------- WASTE ----------------

def create_waste(db: Session, waste: schemas.WasteCreate):
    db_waste = models.WasteData(**waste.dict())
    db.add(db_waste)
    db.commit()
    db.refresh(db_waste)
    return db_waste

def get_all_waste(db: Session):
    return db.query(models.WasteData).all()