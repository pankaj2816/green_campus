from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.services.metrics_config import get_assumptions_payload
from app.services.settings_service import get_dashboard_settings, save_dashboard_settings
from app.database import get_db
from app.models import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/meta", tags=["Metadata"])


@router.get("/assumptions")
def get_assumptions(db: Session = Depends(get_db)):
    payload = get_assumptions_payload()
    payload["settings"] = get_dashboard_settings(db)
    return payload


class SettingsRequest(BaseModel):
    academic_occupancy_factors: dict | None = None
    campus_context: dict | None = None


@router.get("/settings")
def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_dashboard_settings(db)


@router.post("/settings")
def update_settings(
    request: SettingsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return save_dashboard_settings(
        db,
        {
            "academic_occupancy_factors": request.academic_occupancy_factors or {},
            "campus_context": request.campus_context or {},
        },
    )
