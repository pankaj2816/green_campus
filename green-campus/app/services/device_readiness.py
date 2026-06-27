from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app import models

DEFAULT_DEVICE_BLUEPRINTS = [
    {
        "name": "Main Grid Meter",
        "category": "Energy Meter",
        "building": "Campus Main Feed",
        "source_type": "smart_meter",
        "status": "healthy",
        "expected_frequency_minutes": 60,
        "last_sync_at": None,
        "notes": "Primary incoming electricity meter for total campus draw.",
        "is_critical": True,
    },
    {
        "name": "Admin Block Water Meter",
        "category": "Water Meter",
        "building": "Admin Block",
        "source_type": "smart_meter",
        "status": "warning",
        "expected_frequency_minutes": 180,
        "last_sync_at": None,
        "notes": "Useful for validating daytime academic water demand.",
        "is_critical": True,
    },
    {
        "name": "Solar Plant Inverter Feed",
        "category": "Solar Inverter",
        "building": "Solar Plant",
        "source_type": "inverter_api",
        "status": "healthy",
        "expected_frequency_minutes": 30,
        "last_sync_at": None,
        "notes": "Tracks solar generation availability and export readiness.",
        "is_critical": True,
    },
    {
        "name": "Hostel Waste Weighing Log",
        "category": "Waste Collection",
        "building": "Hostels",
        "source_type": "manual_log",
        "status": "manual",
        "expected_frequency_minutes": 1440,
        "last_sync_at": None,
        "notes": "Daily manual waste entry until digital weighing is installed.",
        "is_critical": False,
    },
]

STATUS_SCORES = {
    "healthy": 100,
    "warning": 65,
    "manual": 55,
    "planned": 40,
    "offline": 15,
}


def list_or_seed_devices(db: Session):
    devices = db.query(models.DeviceRegistry).order_by(models.DeviceRegistry.name.asc()).all()
    if devices:
        return devices

    seeded_devices = []
    now = datetime.utcnow()
    for item in DEFAULT_DEVICE_BLUEPRINTS:
        last_sync_at = item["last_sync_at"] or (
            now - timedelta(minutes=max(int(item["expected_frequency_minutes"] / 2), 15))
            if item["status"] in {"healthy", "warning", "manual"}
            else None
        )
        device = models.DeviceRegistry(
            name=item["name"],
            category=item["category"],
            building=item["building"],
            source_type=item["source_type"],
            status=item["status"],
            expected_frequency_minutes=item["expected_frequency_minutes"],
            last_sync_at=last_sync_at,
            notes=item["notes"],
            is_critical=item["is_critical"],
        )
        db.add(device)
        seeded_devices.append(device)

    db.commit()
    for device in seeded_devices:
        db.refresh(device)
    return seeded_devices


def replace_device_registry(db: Session, payload_devices: list[dict]):
    existing = {
        device.id: device
        for device in db.query(models.DeviceRegistry).all()
    }
    kept_ids = set()

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

        db.flush()
        kept_ids.add(device.id)

    for device in existing.values():
        if device.id not in kept_ids:
            db.delete(device)

    db.commit()
    return list_or_seed_devices(db)


def build_device_readiness_payload(devices: list[models.DeviceRegistry]):
    serialized = [serialize_device(device) for device in devices]
    total_devices = len(serialized)
    healthy_count = sum(1 for device in serialized if device["status"] == "healthy")
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
        base_score = max(base_score - 15, 10)

    return {
        "id": device.id,
        "name": device.name,
        "category": device.category,
        "building": device.building,
        "source_type": device.source_type,
        "status": device.status,
        "expected_frequency_minutes": device.expected_frequency_minutes,
        "last_sync_at": device.last_sync_at.isoformat() if device.last_sync_at else None,
        "notes": device.notes,
        "is_critical": device.is_critical,
        "sync_state": sync_state,
        "readiness_score": round(base_score, 1),
    }


def _sync_state(last_sync_at: datetime | None, expected_frequency_minutes: int, status: str):
    if status == "planned":
        return "planned"
    if not last_sync_at:
        return "missing"

    freshness_limit = max(expected_frequency_minutes * 2, 60)
    age_minutes = (datetime.utcnow() - last_sync_at).total_seconds() / 60
    if age_minutes > freshness_limit:
        return "stale"
    return "ok"


def _parse_datetime(value):
    if not value:
        return None
    if isinstance(value, datetime):
        return value
    return datetime.fromisoformat(str(value))
