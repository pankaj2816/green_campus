from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.routers.auth import get_current_user
from app.services.audit import log_audit_event
from app.services.device_readiness import (
    build_device_readiness_payload,
    list_or_seed_devices,
    replace_device_registry,
)

router = APIRouter(prefix="/operations", tags=["Operations"])


class DeviceItemRequest(BaseModel):
    id: int | None = None
    name: str = Field(min_length=2)
    category: str = Field(min_length=2)
    building: str = Field(min_length=2)
    source_type: str = Field(min_length=2)
    status: str = Field(min_length=2)
    expected_frequency_minutes: int = Field(ge=15, le=10080)
    last_sync_at: str | None = None
    notes: str | None = None
    is_critical: bool = False


class DeviceRegistryRequest(BaseModel):
    devices: list[DeviceItemRequest]


@router.get("/devices")
def get_device_readiness(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    devices = list_or_seed_devices(db)
    return build_device_readiness_payload(devices)


@router.post("/devices")
def save_device_readiness(
    request: DeviceRegistryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    saved_devices = replace_device_registry(
        db,
        [device.model_dump() for device in request.devices],
    )
    payload = build_device_readiness_payload(saved_devices)
    log_audit_event(
        db,
        event_type="device_registry",
        action="replace",
        actor_username=current_user.username,
        summary=f"Updated device readiness registry with {len(saved_devices)} device records",
        target_name="device_registry",
        details={
            "device_count": len(saved_devices),
            "critical_devices": payload["summary"]["critical_devices"],
            "readiness_score": payload["summary"]["readiness_score"],
        },
    )
    db.commit()
    return payload
