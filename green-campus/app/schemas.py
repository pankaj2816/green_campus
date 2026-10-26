from datetime import datetime

from pydantic import BaseModel, ConfigDict


class OrmModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class EnergyBase(BaseModel):
    building: str
    consumption_kwh: float


class EnergyCreate(EnergyBase):
    pass


class Energy(EnergyBase, OrmModel):
    id: int
    timestamp: datetime


class WaterBase(BaseModel):
    building: str
    consumption_kl: float


class WaterCreate(WaterBase):
    pass


class Water(WaterBase, OrmModel):
    id: int
    timestamp: datetime


class WasteBase(BaseModel):
    building: str
    waste_type: str
    quantity_kg: float


class WasteCreate(WasteBase):
    pass


class Waste(WasteBase, OrmModel):
    id: int
    timestamp: datetime
