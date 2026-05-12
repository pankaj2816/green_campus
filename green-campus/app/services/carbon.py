from app.services.metrics_config import EMISSION_FACTOR_KG_PER_KWH


def calculate_carbon(kwh: float, emission_factor: float | None = None):
    return kwh * (emission_factor if emission_factor is not None else EMISSION_FACTOR_KG_PER_KWH)
