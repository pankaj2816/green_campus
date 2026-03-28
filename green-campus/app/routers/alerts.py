from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.routers.auth import get_current_user
from app.services.alert_service import build_alert_overview

router = APIRouter(prefix="/ai", tags=["Alert Center"])


@router.get("/alerts/overview")
def alerts_overview(
    building: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return build_alert_overview(db, building=building)
