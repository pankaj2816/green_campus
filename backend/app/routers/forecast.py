from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.ai.forecast import forecast_resources

router = APIRouter(prefix="/ai", tags=["AI Forecast"])


@router.get("/forecast/resources")
def resource_forecast(db: Session = Depends(get_db)):
    return forecast_resources(db)