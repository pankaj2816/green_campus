from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.insights_service import generate_insights
from app.routers.dashboard import calculate_building_performance
from app.models import User
from app.routers.auth import get_current_user
from app.ai.forecast import forecast_resources
from app.ai.risk import evaluate_resource_risk

router = APIRouter(prefix="/insights", tags=["AI Insights"])


@router.get("/")
def get_insights(
    building: str | None = None,
    granularity: str = "monthly",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    performance = calculate_building_performance(db, building=building)
    forecast_payload = forecast_resources(db, granularity=granularity, building=building)
    risk_data = evaluate_resource_risk(forecast_payload)
    return generate_insights(
        db,
        performance,
        forecast_payload=forecast_payload,
        risk_data=risk_data,
        building=building,
    )
