from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.ai.forecast import forecast_resources
from app.ai.risk import evaluate_resource_risk

router = APIRouter(prefix="/ai", tags=["AI Risk"])


@router.get("/risk/energy")
def energy_risk(
    granularity: str = "monthly",
    building: str | None = None,
    db: Session = Depends(get_db),
):

    forecast_data = forecast_resources(db, granularity=granularity, building=building)

    risk_results = evaluate_resource_risk(forecast_data)

    return risk_results
