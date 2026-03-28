from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
import pandas as pd
from app.database import get_db
from app import models
from app.routers.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Data Management"])


@router.post("/upload-campus-excel")
async def upload_campus_excel(
        file: UploadFile = File(...),
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)):

    # Read Excel
    xls = pd.ExcelFile(file.file)

    solar_df = pd.read_excel(xls, "solar")
    energy_df = pd.read_excel(xls, "energy")
    water_df = pd.read_excel(xls, "water")
    waste_df = pd.read_excel(xls, "waste")

    # Clear old data
    db.query(models.SolarData).delete()
    db.query(models.EnergyData).delete()
    db.query(models.WaterData).delete()
    db.query(models.WasteData).delete()

    # -------- SOLAR --------
    for _, row in solar_df.iterrows():

        timestamp = pd.to_datetime(row["date"])

        db.add(models.SolarData(
            building=row["building"],
            solar_kwh=float(row["solar_kwh"]),
            timestamp=timestamp
        ))

    # -------- ENERGY --------
    for _, row in energy_df.iterrows():

        timestamp = pd.to_datetime(row["date"])

        db.add(models.EnergyData(
            building=row["building"],
            consumption_kwh=float(row["energy_kwh"]),
            timestamp=timestamp
        ))

    # -------- WATER --------
    for _, row in water_df.iterrows():

        timestamp = pd.to_datetime(row["date"])

        db.add(models.WaterData(
            building=row["building"],
            consumption_kl=float(row["water_kl"]),
            timestamp=timestamp
        ))

    # -------- WASTE --------
    for _, row in waste_df.iterrows():

        timestamp = pd.to_datetime(row["date"])

        db.add(models.WasteData(
            building=row["building"],
            quantity_kg=float(row["waste_kg"]),
            waste_type="general",
            timestamp=timestamp
        ))

    db.commit()

    return {"message": "Campus dataset imported successfully"}


@router.post("/reset-campus-data")
def reset_campus_data(
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)):

    db.query(models.SolarData).delete()
    db.query(models.EnergyData).delete()
    db.query(models.WaterData).delete()
    db.query(models.WasteData).delete()
    db.commit()

    return {"message": "All campus resource data has been reset"}
