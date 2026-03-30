from io import BytesIO

import pandas as pd
from fastapi import APIRouter, UploadFile, File, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.routers.auth import get_current_user
from app.routers.dashboard import calculate_building_performance

router = APIRouter(prefix="/admin", tags=["Data Management"])


def _rows_to_dataframe(rows, column_map):
    data = []

    for row in rows:
        item = {}

        for source_key, target_key in column_map.items():
            value = getattr(row, source_key)

            if source_key == "timestamp":
                value = pd.to_datetime(value).strftime("%Y-%m-%d")

            item[target_key] = value

        data.append(item)

    return pd.DataFrame(data)


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


@router.get("/export-campus-excel")
def export_campus_excel(
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)):

    energy_rows = db.query(models.EnergyData).order_by(models.EnergyData.timestamp).all()
    water_rows = db.query(models.WaterData).order_by(models.WaterData.timestamp).all()
    waste_rows = db.query(models.WasteData).order_by(models.WasteData.timestamp).all()
    solar_rows = db.query(models.SolarData).order_by(models.SolarData.timestamp).all()

    energy_df = _rows_to_dataframe(energy_rows, {
        "timestamp": "date",
        "building": "building",
        "consumption_kwh": "energy_kwh",
    })
    water_df = _rows_to_dataframe(water_rows, {
        "timestamp": "date",
        "building": "building",
        "consumption_kl": "water_kl",
    })
    waste_df = _rows_to_dataframe(waste_rows, {
        "timestamp": "date",
        "building": "building",
        "quantity_kg": "waste_kg",
        "waste_type": "waste_type",
    })
    solar_df = _rows_to_dataframe(solar_rows, {
        "timestamp": "date",
        "building": "building",
        "solar_kwh": "solar_kwh",
    })

    summary_df = pd.DataFrame([{
        "scope": "Campus",
        "energy_kwh": round(float(energy_df["energy_kwh"].sum()) if not energy_df.empty else 0, 2),
        "water_kl": round(float(water_df["water_kl"].sum()) if not water_df.empty else 0, 2),
        "waste_kg": round(float(waste_df["waste_kg"].sum()) if not waste_df.empty else 0, 2),
        "solar_kwh": round(float(solar_df["solar_kwh"].sum()) if not solar_df.empty else 0, 2),
        "record_count": len(energy_df) + len(water_df) + len(waste_df) + len(solar_df),
    }])
    performance_df = pd.DataFrame(calculate_building_performance(db))

    output = BytesIO()

    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        summary_df.to_excel(writer, sheet_name="summary", index=False)
        performance_df.to_excel(writer, sheet_name="building_performance", index=False)
        energy_df.to_excel(writer, sheet_name="energy", index=False)
        water_df.to_excel(writer, sheet_name="water", index=False)
        waste_df.to_excel(writer, sheet_name="waste", index=False)
        solar_df.to_excel(writer, sheet_name="solar", index=False)

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=green_campus_export.xlsx",
        },
    )
