from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class OrmModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class EnergyBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, allow_inf_nan=False)
    building: str = Field(min_length=1, max_length=200)
    consumption_kwh: float = Field(ge=0)


class EnergyCreate(EnergyBase):
    pass


class Energy(EnergyBase, OrmModel):
    id: int
    timestamp: datetime


class WaterBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, allow_inf_nan=False)
    building: str = Field(min_length=1, max_length=200)
    consumption_kl: float = Field(ge=0)


class WaterCreate(WaterBase):
    pass


class Water(WaterBase, OrmModel):
    id: int
    timestamp: datetime


class WasteBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, allow_inf_nan=False)
    building: str = Field(min_length=1, max_length=200)
    waste_type: str = Field(min_length=1, max_length=200)
    quantity_kg: float = Field(ge=0)


class WasteCreate(WasteBase):
    pass


class Waste(WasteBase, OrmModel):
    id: int
    timestamp: datetime
