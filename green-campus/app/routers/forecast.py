from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.ai.forecast import forecast_resources

router = APIRouter(prefix="/ai", tags=["AI Forecast"])


@router.get("/forecast/resources")
def resource_forecast(
    granularity: str = "monthly",
    building: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    db: Session = Depends(get_db),
):
    return forecast_resources(
        db,
        granularity=granularity,
        building=building,
        date_from=date_from,
        date_to=date_to,
    )
