import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class MatchStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    
    participation_a_id = Column(Integer, ForeignKey("participations.id", ondelete="CASCADE"), nullable=False)
    participation_b_id = Column(Integer, ForeignKey("participations.id", ondelete="CASCADE"), nullable=False)
    
    start_time = Column(DateTime, nullable=True)
    status = Column(Enum(MatchStatus), default=MatchStatus.SCHEDULED, nullable=False)
    
    team_a_score = Column(Integer, nullable=True)
    team_b_score = Column(Integer, nullable=True)
    
    details = Column(JSON, nullable=True, default=lambda: {})

    event = relationship("Event", back_populates="matches")
    participation_a = relationship("Participation", foreign_keys=[participation_a_id])
    participation_b = relationship("Participation", foreign_keys=[participation_b_id])
