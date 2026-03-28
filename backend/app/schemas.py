from pydantic import BaseModel
from datetime import datetime

class EnergyBase(BaseModel):
    building: str
    consumption_kwh: float

class EnergyCreate(EnergyBase):
    pass

class Energy(EnergyBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True

# ---------------- WATER ----------------

class WaterBase(BaseModel):
    building: str
    consumption_kl: float

class WaterCreate(WaterBase):
    pass

class Water(WaterBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True

# ---------------- WASTE ----------------

class WasteBase(BaseModel):
    building: str
    waste_type: str
    quantity_kg: float

class WasteCreate(WasteBase):
    pass

class Waste(WasteBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True