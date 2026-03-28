from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.ai.forecast import forecast_resources
from app.database import get_db
from app.models import User
from app.routers.auth import get_current_user
from app.routers.dashboard import get_summary
from app.services.seasonal_outlook import generate_seasonal_outlook

router = APIRouter(prefix="/ai", tags=["Seasonal Intelligence"])


@router.get("/seasonal-outlook")
def seasonal_outlook(
    building: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    summary = get_summary(building=building, db=db, current_user=current_user)
    forecast_payload = forecast_resources(db, granularity="seasonal", building=building)
    return generate_seasonal_outlook(summary, forecast_payload, building=building)
