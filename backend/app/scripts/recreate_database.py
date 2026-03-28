# app/scripts/recreate_database.py

from app.database import engine, Base
from app import models  # VERY IMPORTANT: ensures models are loaded

print("⚠ Dropping all tables...")
Base.metadata.drop_all(bind=engine)

print("🔄 Recreating tables with updated schema...")
Base.metadata.create_all(bind=engine)

print("✅ Database recreated successfully!")