from pydantic import BaseModel, ConfigDict
from typing import Optional

class LocationBase(BaseModel):
    name: Optional[str] = None
    address: str
    city: str
    latitude: float
    longitude: float

class LocationCreate(LocationBase):
    pass

class LocationResponse(LocationBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)