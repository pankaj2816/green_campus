from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.compliance_service import calculate_compliance_score
from app.routers.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/compliance", tags=["Compliance"])


@router.get("/score")
def get_compliance_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return calculate_compliance_score(db)