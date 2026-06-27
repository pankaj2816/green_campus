import json
from datetime import datetime

from sqlalchemy.orm import Session

from app import models


def log_audit_event(
    db: Session,
    *,
    event_type: str,
    action: str,
    actor_username: str,
    summary: str,
    scope: str = "Campus",
    target_name: str | None = None,
    details: dict | None = None,
):
    event = models.AuditEvent(
        event_type=event_type,
        action=action,
        actor_username=actor_username,
        scope=scope,
        target_name=target_name,
        summary=summary,
        details_json=json.dumps(details or {}, default=_json_default),
    )
    db.add(event)
    db.flush()
    return event


def serialize_audit_event(event: models.AuditEvent):
    try:
        details = json.loads(event.details_json) if event.details_json else {}
    except json.JSONDecodeError:
        details = {}

    return {
        "id": event.id,
        "event_type": event.event_type,
        "action": event.action,
        "actor_username": event.actor_username,
        "scope": event.scope,
        "target_name": event.target_name,
        "summary": event.summary,
        "details": details,
        "created_at": event.created_at.isoformat() if event.created_at else None,
    }


def _json_default(value):
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value)
