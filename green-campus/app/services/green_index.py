def calculate_green_index(energy_score, water_score, waste_score, renewable_score, carbon_score):
    return (
        0.30 * energy_score +
        0.25 * water_score +
        0.20 * waste_score +
        0.15 * renewable_score +
        0.10 * carbon_score
    )