from datetime import datetime

from app.services.metrics_config import ACADEMIC_OCCUPANCY_FACTORS


MONTH_LABELS = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
}


def generate_seasonal_outlook(summary, forecast_payload, building: str | None = None):
    current_month = datetime.now().month
    next_month = (current_month % 12) + 1
    current_occupancy = ACADEMIC_OCCUPANCY_FACTORS.get(current_month, 1.0)
    next_occupancy = ACADEMIC_OCCUPANCY_FACTORS.get(next_month, 1.0)

    forecast_energy = forecast_payload.get("energy", {}).get("forecast_values", [])
    forecast_solar = forecast_payload.get("solar", {}).get("forecast_values", [])
    first_forecast_energy = forecast_energy[0] if forecast_energy else summary.get("net_energy", 0)
    first_forecast_solar = forecast_solar[0] if forecast_solar else summary.get("solar", 0)
    potential_export = max(first_forecast_solar - first_forecast_energy, 0)

    low_occupancy = next_occupancy < 0.65
    if low_occupancy:
        headline = (
            f"{MONTH_LABELS[next_month]} is modeled as a low-occupancy campus month, "
            "so electricity and water demand are expected to soften."
        )
    else:
        headline = (
            f"{MONTH_LABELS[next_month]} is modeled as a normal-to-high occupancy period, "
            "so resource planning should assume standard campus activity."
        )

    recommendations = []
    if low_occupancy:
        recommendations.append(
            "Use the lower occupancy window for maintenance shutdowns, pump scheduling, and HVAC optimization."
        )
        recommendations.append(
            "Review hostels, labs, and admin blocks separately because some loads will remain active even during break."
        )
    else:
        recommendations.append(
            "Prepare for higher classroom and hostel usage by tightening peak-hour energy controls."
        )

    if potential_export > 0:
        recommendations.append(
            f"Projected solar output could exceed demand by about {round(potential_export, 2)} kWh in the near term, "
            "creating an opportunity for grid export or storage."
        )
    else:
        recommendations.append(
            "Solar is likely to offset demand but not fully exceed it, so load shifting remains the best operational lever."
        )

    return {
        "scope": building or "Campus",
        "current_month": MONTH_LABELS[current_month],
        "next_month": MONTH_LABELS[next_month],
        "current_occupancy_factor": current_occupancy,
        "next_occupancy_factor": next_occupancy,
        "headline": headline,
        "potential_export_kwh": round(potential_export, 2),
        "forecast_energy_next_period": round(first_forecast_energy, 2),
        "forecast_solar_next_period": round(first_forecast_solar, 2),
        "recommendations": recommendations,
    }
