from fastapi import APIRouter

from app.services.metrics_config import get_assumptions_payload

router = APIRouter(prefix="/meta", tags=["Metadata"])


@router.get("/assumptions")
def get_assumptions():
    return get_assumptions_payload()
