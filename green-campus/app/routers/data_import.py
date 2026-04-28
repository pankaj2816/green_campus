from io import BytesIO

import pandas as pd
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.routers.auth import get_current_user
from app.routers.dashboard import calculate_building_performance

router = APIRouter(prefix="/admin", tags=["Data Management"])

REQUIRED_SHEETS = {
    "energy": {"required": True, "columns": ["date", "building", "energy_kwh"]},
    "water": {"required": True, "columns": ["date", "building", "water_kl"]},
    "solar": {"required": False, "columns": ["date", "building", "solar_kwh"]},
    "waste": {"required": False, "columns": ["date", "building", "waste_kg"]},
}


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


def _infer_water_unit(df: pd.DataFrame):
    if df.empty:
        return df, "kl"

    numeric_values = pd.to_numeric(df["water_kl"], errors="coerce").dropna()
    if numeric_values.empty:
        return df, "kl"

    median_value = float(numeric_values.median())
    if median_value > 10000:
        df = df.copy()
        df["water_kl"] = pd.to_numeric(df["water_kl"], errors="coerce").fillna(0) / 1000
        return df, "liters_converted_to_kl"

    return df, "kl"


def _validate_workbook(file_obj):
    xls = pd.ExcelFile(file_obj)
    results = {
        "sheet_names": xls.sheet_names,
        "missing_required_sheets": [],
        "optional_missing_sheets": [],
        "sheet_summaries": [],
        "warnings": [],
        "ready": True,
    }

    dataframes = {}
    for sheet_name, config in REQUIRED_SHEETS.items():
        if sheet_name not in xls.sheet_names:
            if config["required"]:
                results["missing_required_sheets"].append(sheet_name)
                results["ready"] = False
            else:
                results["optional_missing_sheets"].append(sheet_name)
            continue

        df = pd.read_excel(xls, sheet_name)
        missing_columns = [column for column in config["columns"] if column not in df.columns]
        if missing_columns:
            results["ready"] = False
            results["warnings"].append(
                f"Sheet '{sheet_name}' is missing columns: {', '.join(missing_columns)}."
            )

        if sheet_name == "water" and "water_kl" in df.columns:
            df, inferred_water_unit = _infer_water_unit(df)
            if inferred_water_unit == "liters_converted_to_kl":
                results["warnings"].append(
                    "Water values looked like liters, so they were converted to kl during import."
                )

        dataframes[sheet_name] = df
        results["sheet_summaries"].append({
            "sheet": sheet_name,
            "rows": int(len(df.index)),
            "columns": list(df.columns),
            "status": "ready" if not missing_columns else "needs_attention",
        })

    return results, dataframes


def _clear_existing_data(db: Session):
    db.query(models.SolarData).delete()
    db.query(models.EnergyData).delete()
    db.query(models.WaterData).delete()
    db.query(models.WasteData).delete()


@router.post("/validate-campus-excel")
async def validate_campus_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    validation, _ = _validate_workbook(file.file)
    return validation


@router.post("/upload-campus-excel")
async def upload_campus_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    validation, dataframes = _validate_workbook(file.file)
    if not validation["ready"]:
        raise HTTPException(status_code=400, detail="Workbook validation failed. Please review required sheets and columns.")

    energy_df = dataframes.get("energy", pd.DataFrame(columns=["date", "building", "energy_kwh"]))
    water_df = dataframes.get("water", pd.DataFrame(columns=["date", "building", "water_kl"]))
    solar_df = dataframes.get("solar", pd.DataFrame(columns=["date", "building", "solar_kwh"]))
    waste_df = dataframes.get("waste", pd.DataFrame(columns=["date", "building", "waste_kg"]))

    _clear_existing_data(db)

    for _, row in solar_df.iterrows():
        db.add(models.SolarData(
            building=row["building"],
            solar_kwh=float(row["solar_kwh"]),
            timestamp=pd.to_datetime(row["date"]),
        ))

    for _, row in energy_df.iterrows():
        db.add(models.EnergyData(
            building=row["building"],
            consumption_kwh=float(row["energy_kwh"]),
            timestamp=pd.to_datetime(row["date"]),
        ))

    for _, row in water_df.iterrows():
        db.add(models.WaterData(
            building=row["building"],
            consumption_kl=float(row["water_kl"]),
            timestamp=pd.to_datetime(row["date"]),
        ))

    for _, row in waste_df.iterrows():
        db.add(models.WasteData(
            building=row["building"],
            quantity_kg=float(row["waste_kg"]),
            waste_type=row.get("waste_type", "general") if isinstance(row, pd.Series) else "general",
            timestamp=pd.to_datetime(row["date"]),
        ))

    db.commit()

    return {
        "message": "Campus dataset imported successfully",
        "validation": validation,
        "imported_rows": {
            "energy": int(len(energy_df.index)),
            "water": int(len(water_df.index)),
            "solar": int(len(solar_df.index)),
            "waste": int(len(waste_df.index)),
        },
    }


@router.post("/reset-campus-data")
def reset_campus_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _clear_existing_data(db)
    db.commit()
    return {"message": "All campus resource data has been reset"}


@router.get("/export-campus-excel")
def export_campus_excel(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
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
