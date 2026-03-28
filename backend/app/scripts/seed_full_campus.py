import random
from datetime import datetime, timedelta
from app.database import SessionLocal
from app.models import EnergyData, WaterData, WasteData, SolarData

db = SessionLocal()

buildings = ["AB5", "NLH", "Hostel M", "Library"]

days_of_history = 60
start_date = datetime.now() - timedelta(days=days_of_history)

for building in buildings:

    # Base patterns per building (to make them different)
    base_energy = random.randint(120, 250)
    base_water = random.randint(15, 40)
    base_waste = random.randint(20, 80)
    base_solar = random.randint(30, 90)

    for day in range(days_of_history):
        timestamp = start_date + timedelta(days=day)

        # Simulate realistic variation
        energy = base_energy + random.randint(-20, 25)
        water = base_water + random.uniform(-5, 6)
        waste = base_waste + random.uniform(-10, 12)
        solar = base_solar + random.randint(-15, 15)

        # Occasionally inject spike (real-world anomaly simulation)
        if random.random() < 0.05:
            energy *= 1.8

        db.add(EnergyData(
            building=building,
            consumption_kwh=max(0, energy),
            timestamp=timestamp
        ))

        db.add(WaterData(
            building=building,
            consumption_kl=max(0, water),
            timestamp=timestamp
        ))

        db.add(WasteData(
            building=building,
            waste_type="general",
            quantity_kg=max(0, waste),
            timestamp=timestamp
        ))

        db.add(SolarData(
            building=building,
            solar_kwh=max(0, solar),
            timestamp=timestamp
        ))

db.commit()
db.close()

print("✅ Full campus historical dataset seeded successfully!")