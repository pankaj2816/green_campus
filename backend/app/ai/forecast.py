from sqlalchemy.orm import Session
from app.models import EnergyData, WaterData, WasteData, SolarData
from datetime import datetime
import pandas as pd


# ----------------------------------
# helper function
# ----------------------------------

def seasonal_forecast(series, periods=12):

    if len(series) == 0:
        return [0] * periods

    df = pd.DataFrame({
        "value": series,
        "month": range(len(series))
    })

    # detect monthly seasonality
    seasonal_pattern = df.groupby(df["month"] % 12)["value"].mean()

    forecast = []

    last_index = len(series)

    for i in range(periods):
        month_index = (last_index + i) % 12
        forecast.append(float(seasonal_pattern.get(month_index, seasonal_pattern.mean())))

    return forecast


# ----------------------------------
# main forecast function
# ----------------------------------

def forecast_resources(db: Session):

    # ENERGY
    energy_data = db.query(EnergyData).order_by(EnergyData.timestamp).all()
    energy_series = [e.consumption_kwh for e in energy_data]

    # WATER
    water_data = db.query(WaterData).order_by(WaterData.timestamp).all()
    water_series = [w.consumption_kl for w in water_data]

    # WASTE
    waste_data = db.query(WasteData).order_by(WasteData.timestamp).all()
    waste_series = [w.quantity_kg for w in waste_data]

    # SOLAR
    solar_data = db.query(SolarData).order_by(SolarData.timestamp).all()
    solar_series = [s.solar_kwh for s in solar_data]


    # generate forecasts
    energy_forecast = seasonal_forecast(energy_series)
    water_forecast = seasonal_forecast(water_series)
    waste_forecast = seasonal_forecast(waste_series)
    solar_forecast = seasonal_forecast(solar_series)


    # create month labels
    months = []

    today = datetime.now()

    for i in range(12):
        future = pd.Timestamp(today) + pd.DateOffset(months=i)
        months.append(future.strftime("%b-%y"))


    return {
        "months": months,
        "energy": energy_forecast,
        "water": water_forecast,
        "waste": waste_forecast,
        "solar": solar_forecast
    }