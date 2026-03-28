from app.database import SessionLocal
from app.models import EnergyData, WaterData, WasteData, SolarData

db = SessionLocal()

print("Clearing tables...")

db.query(EnergyData).delete()
db.query(WaterData).delete()
db.query(WasteData).delete()
db.query(SolarData).delete()

db.commit()
db.close()

print("✅ All resource data cleared successfully!")