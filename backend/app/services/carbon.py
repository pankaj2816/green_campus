def calculate_carbon(kwh: float):
    EMISSION_FACTOR = 0.82  # India average kg CO2 per kWh
    return kwh * EMISSION_FACTOR