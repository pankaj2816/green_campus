EMISSION_FACTOR_KG_PER_KWH = 0.82
ENERGY_COST_PER_KWH = 8.0

ENERGY_BENCHMARK = 100000
WATER_BENCHMARK = 20000
WASTE_BENCHMARK = 30000

COMPLIANCE_ENERGY_LIMIT = 500
COMPLIANCE_WATER_LIMIT = 200
COMPLIANCE_WASTE_LIMIT = 300

GREEN_INDEX_WEIGHTS = {
    "energy": 0.5,
    "water": 0.3,
    "waste": 0.2,
}

ANOMALY_THRESHOLD_PERCENT = 15
HIGH_ANOMALY_THRESHOLD_PERCENT = 30

ACADEMIC_OCCUPANCY_FACTORS = {
    1: 0.92,
    2: 0.95,
    3: 1.0,
    4: 1.0,
    5: 0.82,
    6: 0.45,
    7: 0.5,
    8: 0.78,
    9: 1.0,
    10: 1.0,
    11: 0.96,
    12: 0.6,
}


def get_assumptions_payload():
    return {
        "constants": {
            "emission_factor_kg_per_kwh": EMISSION_FACTOR_KG_PER_KWH,
            "energy_cost_per_kwh": ENERGY_COST_PER_KWH,
            "energy_benchmark": ENERGY_BENCHMARK,
            "water_benchmark": WATER_BENCHMARK,
            "waste_benchmark": WASTE_BENCHMARK,
            "compliance_energy_limit": COMPLIANCE_ENERGY_LIMIT,
            "compliance_water_limit": COMPLIANCE_WATER_LIMIT,
            "compliance_waste_limit": COMPLIANCE_WASTE_LIMIT,
            "weights": GREEN_INDEX_WEIGHTS,
            "anomaly_threshold_percent": ANOMALY_THRESHOLD_PERCENT,
            "high_anomaly_threshold_percent": HIGH_ANOMALY_THRESHOLD_PERCENT,
            "academic_occupancy_factors": ACADEMIC_OCCUPANCY_FACTORS,
        },
        "glossary": [
            {
                "term": "Gross Energy",
                "meaning": "Total electricity used before subtracting solar power.",
            },
            {
                "term": "Net Energy",
                "meaning": "Electricity still needed after solar power is used.",
            },
            {
                "term": "Green Index",
                "meaning": "An overall sustainability score. Higher means better performance.",
            },
            {
                "term": "Carbon Footprint",
                "meaning": "Estimated carbon created from the electricity taken from the grid.",
            },
            {
                "term": "Forecast Granularity",
                "meaning": "How the forecast is grouped: daily, monthly, yearly, or seasonal.",
            },
            {
                "term": "Scenario Simulator",
                "meaning": "A what-if tool for checking how changes affect cost, carbon, and the Green Index.",
            },
            {
                "term": "Seasonal Intelligence",
                "meaning": "A planning view that considers vacation months, busy campus months, and possible extra solar power.",
            },
        ],
    }
