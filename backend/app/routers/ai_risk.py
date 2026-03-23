from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.ai.forecast import forecast_resources
from app.ai.risk import evaluate_energy_risk

router = APIRouter(prefix="/ai", tags=["AI Risk"])


@router.get("/risk/energy")
def energy_risk(db: Session = Depends(get_db)):

    forecast_data = forecast_resources(db)

    risk_results = evaluate_energy_risk(forecast_data)

    return risk_results