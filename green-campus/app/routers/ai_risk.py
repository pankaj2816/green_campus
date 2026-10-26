from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.ai.forecast import forecast_resources
from app.ai.risk import evaluate_resource_risk
from app.models import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/ai", tags=["AI Risk"])


@router.get("/risk/energy")
def energy_risk(
    granularity: str = "monthly",
    building: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    forecast_data = forecast_resources(
        db,
        granularity=granularity,
        building=building,
        date_from=date_from,
        date_to=date_to,
    )

    risk_results = evaluate_resource_risk(forecast_data)

    return risk_results
