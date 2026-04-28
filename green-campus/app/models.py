from sqlalchemy import Column, Integer, Float, String, DateTime, Text
from app.database import Base
from datetime import datetime

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
