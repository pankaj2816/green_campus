from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.insights_service import generate_insights
from app.routers.dashboard import building_performance
from app.models import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/insights", tags=["AI Insights"])


@router.get("/")
def get_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    performance = building_performance(db)
    return generate_insights(db, performance)