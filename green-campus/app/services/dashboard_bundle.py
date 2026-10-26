import logging

from sqlalchemy.orm import Session

from app.ai.forecast import forecast_resources
from app.ai.risk import evaluate_resource_risk
from app.models import AuditEvent
from app.routers.dashboard import (
    build_comparison_response,
    build_summary_response,
    calculate_building_performance,
    get_all_buildings,
)
from app.routers.energy import energy_by_building, energy_trend
from app.services.alert_service import build_alert_overview
from app.services.audit import serialize_audit_event
from app.services.data_quality import build_data_quality_report
from app.services.date_filters import normalize_date_range
from app.services.device_readiness import build_device_readiness_payload, list_devices
from app.services.insights_service import generate_insights
from app.services.seasonal_outlook import generate_seasonal_outlook

logger = logging.getLogger(__name__)


def build_dashboard_bundle(
    db: Session,
    *,
    building: str | None = None,
    granularity: str = "monthly",
    date_from: str | None = None,
    date_to: str | None = None,
    audit_limit: int = 12,
):
    normalize_date_range(date_from, date_to)
    sections = {}
    errors = {}
    forecast_cache = {}

    def capture(name, fn):
        try:
            sections[name] = fn()
        except Exception:
            db.rollback()
            logger.exception("Dashboard section %s failed", name)
            sections[name] = None
            errors[name] = "This section could not be loaded."
        return sections[name]

    def forecast_for(granularity_name: str):
        key = granularity_name or "monthly"
        if key not in forecast_cache:
            forecast_cache[key] = forecast_resources(
                db,
                granularity=key,
                building=building,
                date_from=date_from,
                date_to=date_to,
            )
        return forecast_cache[key]

    summary = capture(
        "summary",
        lambda: build_summary_response(db, building=building, date_from=date_from, date_to=date_to),
    )
    capture(
        "comparison",
        lambda: build_comparison_response(
            db,
            building=building,
            date_from=date_from,
            date_to=date_to,
            current=summary,
        ),
    )
    capture(
        "trend",
        lambda: energy_trend(building=building, date_from=date_from, date_to=date_to, db=db),
    )
    capture("buildings", lambda: get_all_buildings(db=db, current_user=None))
    capture(
        "building_energy",
        lambda: energy_by_building(
            date_from=date_from,
            date_to=date_to,
            current_user=None,
            db=db,
        ),
    )
    performance = capture(
        "performance",
        lambda: calculate_building_performance(
            db,
            building=building,
            date_from=date_from,
            date_to=date_to,
        ),
    )
    forecast = capture("forecast", lambda: forecast_for(granularity))
    risk = capture("risk", lambda: evaluate_resource_risk(forecast or {}))
    peers = capture("peers", lambda: calculate_building_performance(db, date_from=date_from, date_to=date_to)) if building and performance is not None else performance
    capture(
        "insights",
        lambda: generate_insights(
            db,
            peers or [],
            forecast_payload=forecast or {},
            risk_data=risk or [],
            building=building,
            date_from=date_from,
            date_to=date_to,
        ),
    )
    capture(
        "seasonal",
        lambda: generate_seasonal_outlook(
            summary or {},
            forecast_for("monthly"),
            building=building,
        ),
    )
    capture(
        "alerts",
        lambda: build_alert_overview(
            db,
            building=building,
            date_from=date_from,
            date_to=date_to,
            forecast_payload=forecast_for("daily"),
        ),
    )
    capture(
        "data_quality",
        lambda: build_data_quality_report(
            db,
            building=building,
            date_from=date_from,
            date_to=date_to,
        ),
    )
    capture(
        "devices",
        lambda: build_device_readiness_payload(list_devices(db)),
    )
    capture(
        "audit",
        lambda: {
            "records": [
                serialize_audit_event(record)
                for record in (
                    db.query(AuditEvent)
                    .order_by(AuditEvent.created_at.desc())
                    .limit(min(max(audit_limit, 1), 100))
                    .all()
                )
            ]
        },
    )

    return {
        "summary": sections.get("summary"),
        "comparison": sections.get("comparison"),
        "trend": sections.get("trend"),
        "buildings": sections.get("buildings"),
        "building_energy": sections.get("building_energy"),
        "performance": sections.get("performance"),
        "forecast": sections.get("forecast"),
        "risk": sections.get("risk"),
        "insights": sections.get("insights"),
        "seasonal": sections.get("seasonal"),
        "alerts": sections.get("alerts"),
        "data_quality": sections.get("data_quality"),
        "devices": sections.get("devices"),
        "audit": sections.get("audit"),
        "errors": errors,
    }
