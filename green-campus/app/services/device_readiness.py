from datetime import datetime, timezone
from fastapi import HTTPException

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app import models

STATUS_SCORES = {
    "healthy": 100,
    "warning": 65,
    "manual": 55,
    "planned": 40,
    "offline": 15,
}


def list_devices(db: Session):
    return db.query(models.DeviceRegistry).order_by(models.DeviceRegistry.name.asc()).all()


def replace_device_registry(db: Session, payload_devices: list[dict]):
    existing = {
        device.id: device
        for device in db.query(models.DeviceRegistry).all()
    }
    kept_ids = set()
    names = [item["name"].strip().casefold() for item in payload_devices]
    ids = [item["id"] for item in payload_devices if item.get("id") is not None]
    if len(set(names)) != len(names) or len(set(ids)) != len(ids):
        raise HTTPException(status_code=422, detail="Device names and IDs must be unique.")
    if any(device_id not in existing for device_id in ids):
        raise HTTPException(status_code=422, detail="A device ID does not exist. Refresh the registry before saving.")

    for item in payload_devices:
        device_id = item.get("id")
        device = existing.get(device_id) if device_id else None
        if not device:
            device = models.DeviceRegistry()
            db.add(device)

        device.name = item["name"].strip()
        device.category = item["category"].strip()
        device.building = item["building"].strip()
        device.source_type = item["source_type"].strip()
        device.status = item["status"].strip()
        device.expected_frequency_minutes = int(item["expected_frequency_minutes"])
        device.last_sync_at = _parse_datetime(item.get("last_sync_at"))
        device.notes = (item.get("notes") or "").strip() or None
        device.is_critical = bool(item.get("is_critical"))

        try:
            db.flush()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=409, detail="Device names conflict with existing records. Refresh before saving.")
        kept_ids.add(device.id)

    for device in existing.values():
        if device.id not in kept_ids:
            db.delete(device)

    db.flush()
    return list_devices(db)


def build_device_readiness_payload(devices: list[models.DeviceRegistry]):
    serialized = [serialize_device(device) for device in devices]
    total_devices = len(serialized)
    healthy_count = sum(1 for device in serialized if device["status"] == "healthy" and device["sync_state"] == "ok")
    critical_count = sum(1 for device in serialized if device["is_critical"])
    readiness_score = round(
        sum(device["readiness_score"] for device in serialized) / max(total_devices, 1),
        1,
    )

    return {
        "summary": {
            "total_devices": total_devices,
            "healthy_devices": healthy_count,
            "critical_devices": critical_count,
            "readiness_score": readiness_score,
            "status_breakdown": {
                status: sum(1 for device in serialized if device["status"] == status)
                for status in STATUS_SCORES
            },
        },
        "devices": serialized,
    }


def serialize_device(device: models.DeviceRegistry):
    sync_state = _sync_state(device.last_sync_at, device.expected_frequency_minutes, device.status)
    base_score = STATUS_SCORES.get(device.status, 35)
    if sync_state == "stale":
        base_score = max(base_score - 20, 10)
    elif sync_state == "missing":
        base_score = min(base_score, 40)

    return {
        "id": device.id,
        "name": device.name,
        "category": device.category,
        "building": device.building,
        "source_type": device.source_type,
        "status": device.status,
        "expected_frequency_minutes": device.expected_frequency_minutes,
        "last_sync_at": _utc_datetime(device.last_sync_at).isoformat() if device.last_sync_at else None,
        "notes": device.notes,
        "is_critical": device.is_critical,
        "sync_state": sync_state,
        "readiness_score": round(base_score, 1),
    }


def _sync_state(last_sync_at: datetime | None, expected_frequency_minutes: int, status: str):
    if status == "offline":
        return "offline"
    if status == "planned":
        return "planned"
    if not last_sync_at:
        return "missing"

    freshness_limit = max(expected_frequency_minutes * 2, 60)
    age_minutes = (datetime.now(timezone.utc) - _utc_datetime(last_sync_at)).total_seconds() / 60
    if age_minutes < -1:
        return "missing"
    if age_minutes > freshness_limit:
        return "stale"
    return "ok"


def _parse_datetime(value):
    if not value:
        return None
    try:
        parsed = value if isinstance(value, datetime) else datetime.fromisoformat(str(value))
        parsed = _utc_datetime(parsed)
        if parsed > datetime.now(timezone.utc):
            raise ValueError()
        return parsed.replace(tzinfo=None)
    except (ValueError, TypeError):
        raise HTTPException(status_code=422, detail="Last sync must be a valid timestamp that is not in the future.")


def _utc_datetime(value):
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)
