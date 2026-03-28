from app.services.metrics_config import EMISSION_FACTOR_KG_PER_KWH


def calculate_carbon(kwh: float):
    return kwh * EMISSION_FACTOR_KG_PER_KWH
