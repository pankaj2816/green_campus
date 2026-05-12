from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.routers.auth import get_current_user
from app.services.carbon import calculate_carbon
from app.services.date_filters import apply_date_range, previous_period_range
from app.services.metrics_config import (
    get_runtime_constants,
)
from app.services.settings_service import get_dashboard_settings

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _apply_building_filter(query, model, building: str | None):
    if building:
        return query.filter(model.building == building)
    return query


def _resource_query(db: Session, model, building: str | None = None, date_from: str | None = None, date_to: str | None = None):
    query = db.query(model)
    query = _apply_building_filter(query, model, building)
    return apply_date_range(query, model, date_from, date_to)


def _summary_payload(
    db: Session,
    building: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
):
    settings = get_dashboard_settings(db)
    context = settings["campus_context"]
    occupancy_map = settings["academic_occupancy_factors"]
    constants = get_runtime_constants(settings)
    emission_factor = constants["emission_factor_kg_per_kwh"]
    energy_benchmark = constants["energy_benchmark"]
    water_benchmark = constants["water_benchmark"]
    waste_benchmark = constants["waste_benchmark"]
    green_index_weights = constants["weights"]
    energy_cost_per_kwh = constants["energy_cost_per_kwh"]

    energy_rows = _resource_query(db, models.EnergyData, building, date_from, date_to).all()
    water_rows = _resource_query(db, models.WaterData, building, date_from, date_to).all()
    waste_rows = _resource_query(db, models.WasteData, building, date_from, date_to).all()
    solar_rows = _resource_query(db, models.SolarData, building, date_from, date_to).all()

    total_energy = sum(entry.consumption_kwh for entry in energy_rows)
    total_water = sum(entry.consumption_kl for entry in water_rows)
    total_waste = sum(entry.quantity_kg for entry in waste_rows)
    total_solar = sum(entry.solar_kwh for entry in solar_rows)

    date_pool = [entry.timestamp for entry in [*energy_rows, *water_rows, *waste_rows, *solar_rows]]
    months_covered = max(len({(item.year, item.month) for item in date_pool}), 1) if date_pool else 1
    occupancy_average = (
        sum(occupancy_map.get(item.month, 1.0) for item in date_pool) / len(date_pool)
        if date_pool
        else 1.0
    )

    active_population = max(round(context["student_population"] * occupancy_average), 1)
    net_energy = max(total_energy - total_solar, 0)
    carbon = calculate_carbon(net_energy, emission_factor)

    energy_score = min(net_energy / energy_benchmark, 1) if energy_benchmark else 0
    water_score = min(total_water / water_benchmark, 1) if water_benchmark else 0
    waste_score = min(total_waste / waste_benchmark, 1) if waste_benchmark else 0
    efficiency_score = (
        (green_index_weights["energy"] * energy_score) +
        (green_index_weights["water"] * water_score) +
        (green_index_weights["waste"] * waste_score)
    )
    green_index = round((1 - efficiency_score) * 100, 2)

    monthly_energy_cost = (net_energy / months_covered) * energy_cost_per_kwh
    energy_budget_variance = monthly_energy_cost - context["monthly_energy_budget_rs"]
    solar_offset_percent = round((total_solar / total_energy) * 100, 2) if total_energy else 0

    return {
        "scope": building or "Campus",
        "energy": round(total_energy, 2),
        "solar": round(total_solar, 2),
        "net_energy": round(net_energy, 2),
        "export_to_grid_kwh": round(max(total_solar - total_energy, 0), 2),
        "water": round(total_water, 2),
        "waste": round(total_waste, 2),
        "carbon": round(carbon, 2),
        "gross_carbon": round(calculate_carbon(total_energy, emission_factor), 2),
        "solar_avoided_carbon": round(calculate_carbon(min(total_solar, total_energy), emission_factor), 2),
        "green_index": green_index,
        "date_from": date_from,
        "date_to": date_to,
        "months_covered": months_covered,
        "active_population": active_population,
        "energy_per_student_kwh": round(net_energy / active_population, 2),
        "water_per_student_kl": round(total_water / active_population, 4),
        "waste_per_student_kg": round(total_waste / active_population, 3),
        "energy_per_sqm_kwh": round(net_energy / max(context["built_up_area_sqm"], 1), 4),
        "monthly_energy_cost_rs": round(monthly_energy_cost, 2),
        "monthly_energy_budget_rs": round(context["monthly_energy_budget_rs"], 2),
        "energy_budget_variance_rs": round(energy_budget_variance, 2),
        "occupancy_average": round(occupancy_average, 2),
        "solar_offset_percent": solar_offset_percent,
    }


def _goal_progress_payload(summary_payload: dict, settings: dict):
    goals = settings.get("sustainability_goals", {})
    goal_definitions = [
        {
            "key": "green_index_target",
            "label": "Green Index",
            "current": float(summary_payload.get("green_index", 0) or 0),
            "target": float(goals.get("green_index_target", 0) or 0),
            "unit": "%",
            "higher_is_better": True,
        },
        {
            "key": "solar_offset_target_percent",
            "label": "Solar Offset",
            "current": float(summary_payload.get("solar_offset_percent", 0) or 0),
            "target": float(goals.get("solar_offset_target_percent", 0) or 0),
            "unit": "%",
            "higher_is_better": True,
        },
        {
            "key": "water_per_student_target_kl",
            "label": "Water Per Student",
            "current": float(summary_payload.get("water_per_student_kl", 0) or 0),
            "target": float(goals.get("water_per_student_target_kl", 0) or 0),
            "unit": "kl",
            "higher_is_better": False,
        },
        {
            "key": "monthly_energy_cost_target_rs",
            "label": "Monthly Energy Cost",
            "current": float(summary_payload.get("monthly_energy_cost_rs", 0) or 0),
            "target": float(goals.get("monthly_energy_cost_target_rs", 0) or 0),
            "unit": "Rs",
            "higher_is_better": False,
        },
    ]

    goal_progress = []
    for goal in goal_definitions:
        target = goal["target"]
        current = goal["current"]
        higher_is_better = goal["higher_is_better"]
        if target <= 0:
            completion = 0
            status = "not_set"
        elif higher_is_better:
            completion = min((current / target) * 100, 100)
            status = "on_track" if current >= target else "watch"
        else:
            completion = 100 if current <= 0 else min((target / current) * 100, 100)
            status = "on_track" if current <= target else "watch"

        variance = round(current - target, 2)
        goal_progress.append({
            "key": goal["key"],
            "label": goal["label"],
            "current": round(current, 2),
            "target": round(target, 2),
            "unit": goal["unit"],
            "completion_percent": round(completion, 1),
            "variance": variance,
            "higher_is_better": higher_is_better,
            "status": status,
        })

    return goal_progress


def calculate_building_performance(
    db: Session,
    building: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
):
    settings = get_dashboard_settings(db)
    constants = get_runtime_constants(settings)
    weights = constants["weights"]
    emission_factor = constants["emission_factor_kg_per_kwh"]

    energy_query = apply_date_range(
        _apply_building_filter(
            db.query(
                models.EnergyData.building,
                func.sum(models.EnergyData.consumption_kwh).label("total_energy"),
            ),
            models.EnergyData,
            building,
        ),
        models.EnergyData,
        date_from,
        date_to,
    )
    water_query = apply_date_range(
        _apply_building_filter(
            db.query(
                models.WaterData.building,
                func.sum(models.WaterData.consumption_kl).label("total_water"),
            ),
            models.WaterData,
            building,
        ),
        models.WaterData,
        date_from,
        date_to,
    )
    waste_query = apply_date_range(
        _apply_building_filter(
            db.query(
                models.WasteData.building,
                func.sum(models.WasteData.quantity_kg).label("total_waste"),
            ),
            models.WasteData,
            building,
        ),
        models.WasteData,
        date_from,
        date_to,
    )
    solar_query = apply_date_range(
        _apply_building_filter(
            db.query(
                models.SolarData.building,
                func.sum(models.SolarData.solar_kwh).label("total_solar"),
            ),
            models.SolarData,
            building,
        ),
        models.SolarData,
        date_from,
        date_to,
    )

    energy = energy_query.group_by(models.EnergyData.building).all()
    water = water_query.group_by(models.WaterData.building).all()
    waste = waste_query.group_by(models.WasteData.building).all()
    solar = solar_query.group_by(models.SolarData.building).all()

    performance = {}
    defaults = {"energy": 0.0, "solar": 0.0, "net_energy": 0.0, "water": 0.0, "waste": 0.0}

    for entry in energy:
        performance[entry.building] = {**defaults, "energy": float(entry.total_energy or 0)}
    for entry in water:
        performance.setdefault(entry.building, defaults.copy())
        performance[entry.building]["water"] = float(entry.total_water or 0)
    for entry in waste:
        performance.setdefault(entry.building, defaults.copy())
        performance[entry.building]["waste"] = float(entry.total_waste or 0)
    for entry in solar:
        performance.setdefault(entry.building, defaults.copy())
        performance[entry.building]["solar"] = float(entry.total_solar or 0)

    if not performance:
        return []

    for values in performance.values():
        values["net_energy"] = max(values["energy"] - values["solar"], 0)

    max_energy = max((values["net_energy"] for values in performance.values()), default=1) or 1
    max_water = max((values["water"] for values in performance.values()), default=1) or 1
    max_waste = max((values["waste"] for values in performance.values()), default=1) or 1

    results = []
    for building_name, values in performance.items():
        norm_energy = values["net_energy"] / max_energy
        norm_water = values["water"] / max_water
        norm_waste = values["waste"] / max_waste
        score = (
            (weights["energy"] * norm_energy) +
            (weights["water"] * norm_water) +
            (weights["waste"] * norm_waste)
        )

        results.append({
            "building": building_name,
            "energy": round(values["energy"], 2),
            "solar": round(values["solar"], 2),
            "net_energy": round(values["net_energy"], 2),
            "water": round(values["water"], 2),
            "waste": round(values["waste"], 2),
            "carbon": round(calculate_carbon(values["net_energy"], emission_factor), 2),
            "efficiency_score": round(score, 3),
        })

    results.sort(key=lambda item: item["efficiency_score"])
    for index, item in enumerate(results, start=1):
        item["rank"] = index

    return results


@router.get("/building-performance")
def building_performance(
    building: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return calculate_building_performance(db, building=building, date_from=date_from, date_to=date_to)


@router.get("/all-buildings")
def get_all_buildings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    building_names = set()
    for model in (models.EnergyData, models.WaterData, models.WasteData, models.SolarData):
        rows = db.query(model.building).distinct().all()
        for row in rows:
            if row[0]:
                building_names.add(row[0])
    return sorted(building_names)


@router.get("/summary")
def get_summary(
    building: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    summary = _summary_payload(db, building=building, date_from=date_from, date_to=date_to)
    settings = get_dashboard_settings(db)
    summary["goal_progress"] = _goal_progress_payload(summary, settings)
    summary["sustainability_goals"] = settings.get("sustainability_goals", {})
    summary["action_tracker"] = settings.get("action_tracker", {})
    return summary


@router.get("/comparison")
def get_comparison(
    building: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    current = _summary_payload(db, building=building, date_from=date_from, date_to=date_to)
    previous_from, previous_to = previous_period_range(date_from, date_to)

    if previous_from and previous_to:
        previous = _summary_payload(db, building=building, date_from=previous_from, date_to=previous_to)
        comparison_basis = f"{previous_from} to {previous_to}"
    else:
        previous = None
        comparison_basis = "No previous period selected"

    metrics = ["net_energy", "water", "waste", "carbon", "green_index", "monthly_energy_cost_rs"]
    delta = {}
    if previous:
        for metric in metrics:
            current_value = float(current.get(metric, 0) or 0)
            previous_value = float(previous.get(metric, 0) or 0)
            absolute_change = current_value - previous_value
            percent_change = ((absolute_change / previous_value) * 100) if previous_value else None
            delta[metric] = {
                "current": round(current_value, 2),
                "previous": round(previous_value, 2),
                "change": round(absolute_change, 2),
                "change_percent": round(percent_change, 2) if percent_change is not None else None,
            }

    return {
        "scope": building or "Campus",
        "current_period": {
            "date_from": date_from,
            "date_to": date_to,
        },
        "previous_period": {
            "date_from": previous_from,
            "date_to": previous_to,
        } if previous else None,
        "comparison_basis": comparison_basis,
        "current": current,
        "previous": previous,
        "delta": delta,
    }
