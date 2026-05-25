from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from app.modules.matches.models import MatchStatus
from app.modules.participations.schemas import ParticipationResponse

class MatchBase(BaseModel):
    event_id: int
    participation_a_id: int
    participation_b_id: int
    start_time: Optional[datetime] = None

class MatchCreate(MatchBase):
    pass

class MatchUpdateScore(BaseModel):
    team_a_score: Optional[int] = None
    team_b_score: Optional[int] = None
    status: Optional[MatchStatus] = None
    details: Optional[Dict[str, Any]] = None

class MatchResponse(MatchBase):
    id: int
    status: MatchStatus
    team_a_score: Optional[int]
    team_b_score: Optional[int]
    details: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True

class MatchResponseWithParticipations(MatchResponse):
    participation_a: ParticipationResponse
    participation_b: ParticipationResponse
