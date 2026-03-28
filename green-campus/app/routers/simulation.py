from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.routers.auth import get_current_user
from app.services.simulator import simulate_sustainability_impact

router = APIRouter(prefix="/ai", tags=["AI Simulation"])


class SimulationRequest(BaseModel):
    building: str | None = None
    energy_reduction_pct: float = 0
    water_reduction_pct: float = 0
    waste_reduction_pct: float = 0
    solar_increase_pct: float = 0


@router.post("/simulate/impact")
def simulate_impact(
    request: SimulationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return simulate_sustainability_impact(
        db,
        request.building,
        {
            "energy_reduction_pct": request.energy_reduction_pct,
            "water_reduction_pct": request.water_reduction_pct,
            "waste_reduction_pct": request.waste_reduction_pct,
            "solar_increase_pct": request.solar_increase_pct,
        },
    )
