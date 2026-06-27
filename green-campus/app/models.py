from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text

from app.database import Base

class EnergyData(Base):
    __tablename__ = "energy_data"

    id = Column(Integer, primary_key=True, index=True)
    building = Column(String)
    consumption_kwh = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)


class WaterData(Base):
    __tablename__ = "water_data"

    id = Column(Integer, primary_key=True, index=True)
    building = Column(String)
    consumption_kl = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)


class WasteData(Base):
    __tablename__ = "waste_data"

    id = Column(Integer, primary_key=True, index=True)
    building = Column(String)
    waste_type = Column(String)
    quantity_kg = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

class SolarData(Base):
    __tablename__ = "solar_data"

    id = Column(Integer, primary_key=True, index=True)
    building = Column(String)
    solar_kwh = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="viewer")  # admin / manager / viewer


class CampusSetting(Base):
    __tablename__ = "campus_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value_json = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, index=True)
    action = Column(String, index=True)
    actor_username = Column(String, index=True)
    scope = Column(String, default="Campus")
    target_name = Column(String, nullable=True)
    summary = Column(String)
    details_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class DeviceRegistry(Base):
    __tablename__ = "device_registry"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    category = Column(String, index=True)
    building = Column(String, index=True)
    source_type = Column(String, default="meter")
    status = Column(String, default="planned", index=True)
    expected_frequency_minutes = Column(Integer, default=1440)
    last_sync_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    is_critical = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
