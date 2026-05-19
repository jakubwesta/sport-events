import enum
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Enum, Boolean, Text
from sqlalchemy.orm import relationship
from app.database import Base

class EventType(str, enum.Enum):
    INDIVIDUAL = "INDIVIDUAL"
    TEAM = "TEAM"

class EventStatus(str, enum.Enum):
    PLANNING = "PLANNING"
    REGISTRATION = "REGISTRATION" 
    IN_PROGRESS = "IN_PROGRESS"  
    COMPLETED = "COMPLETED"     
    CANCELLED = "CANCELLED"    
    POSTPONED = "POSTPONED"

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    event_type = Column(Enum(EventType), default=EventType.INDIVIDUAL, nullable=False)
    status = Column(Enum(EventStatus), default=EventStatus.PLANNING, nullable=False) 
    
    max_participants = Column(Integer, nullable=True)
    min_team_size = Column(Integer, default=1)    
    max_team_size = Column(Integer, default=1)
    
    price = Column(Float, default=0.0)        
    start_date = Column(DateTime, nullable=False)     
    duration = Column(Integer, nullable=True)       
    registration_deadline = Column(DateTime, nullable=False) 
    
    is_active = Column(Boolean, default=True)
    is_published = Column(Boolean, default=False)     

    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    category = relationship("Category", back_populates="events")

    location_id = Column(Integer, ForeignKey("locations.id", ondelete="SET NULL"), nullable=True)
    location = relationship("Location", back_populates="events")

    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    owner = relationship("User", back_populates="events")

    participations = relationship("Participation", back_populates="event")  