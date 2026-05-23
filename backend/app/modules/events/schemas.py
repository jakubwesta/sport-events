from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List
from app.modules.events.models import EventType, EventStatus
from app.modules.categories.schemas import CategoryResponse
from app.modules.locations.schemas import LocationResponse
from app.modules.participations.schemas import ParticipationResponse

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: EventType = EventType.INDIVIDUAL
    status: EventStatus = EventStatus.PLANNING
    
    price: float = Field(0.0, ge=0.0) 
    start_date: datetime
    duration: Optional[int] = Field(None, description="Czas trwania w minutach")
    registration_deadline: datetime
    
    max_participants: Optional[int] = Field(None, description="Max liczba osób lub drużyn")
    min_team_size: int = Field(1, ge=1)
    max_team_size: int = Field(1, ge=1)
    
    is_published: bool = False

class EventCreate(EventBase):
    category_id: int
    location_id: Optional[int] = None

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[EventStatus] = None
    start_date: Optional[datetime] = None
    registration_deadline: Optional[datetime] = None
    price: Optional[float] = None
    is_published: Optional[bool] = None
    location_id: Optional[int] = None

class EventResponse(EventBase):
    id: int
    owner_id: int
    category: CategoryResponse
    location: Optional[LocationResponse] = None 
    
    model_config = ConfigDict(from_attributes=True)

class EventDetailsResponse(EventResponse):
    participations: List[ParticipationResponse] = []
    
    model_config = ConfigDict(from_attributes=True)