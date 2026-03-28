from app.database import SessionLocal
from app.models import SolarData

db = SessionLocal()

db.query(SolarData).delete()
db.commit()

db.close()

print("Solar data cleared.")