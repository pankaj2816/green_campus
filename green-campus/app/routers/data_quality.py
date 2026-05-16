from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.routers.auth import get_current_user
from app.services.data_quality import build_data_quality_report

router = APIRouter(prefix="/ai", tags=["AI Data Quality"])


@router.get("/data-quality")
def get_data_quality(
    building: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return build_data_quality_report(
        db,
        building=building,
        date_from=date_from,
        date_to=date_to,
    )
