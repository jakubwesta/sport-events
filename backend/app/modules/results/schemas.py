from pydantic import BaseModel, Field
from typing import Annotated, Optional, Dict, Any, List, Union, Literal

class ResultBase(BaseModel):
    participation_id: int
    place: Optional[int] = None

class ResultResponseBase(ResultBase):
    id: int
    type: str

    class Config:
        from_attributes = True

# --- Team Score ---
class TeamScoreResultCreate(ResultBase):
    goals_scored: int
    goals_conceded: int
    result: str  # "win" / "loss" / "draw"
    details: Optional[Dict[str, Any]] = {}

class TeamScoreResultResponse(ResultResponseBase):
    type: Literal["team_score"] = "team_score"
    goals_scored: int
    goals_conceded: int
    result: str
    details: Optional[Dict[str, Any]] = {}

# --- Individual Score ---
class IndividualScoreResultCreate(ResultBase):
    score: float
    unit: str

class IndividualScoreResultResponse(ResultResponseBase):
    type: Literal["individual_score"] = "individual_score"
    score: float
    unit: str

# --- Timed Result ---
class TimedResultCreate(ResultBase):
    total_time_ms: int
    splits: Optional[List[Dict[str, Any]]] = []

class TimedResultResponse(ResultResponseBase):
    type: Literal["timed"] = "timed"
    total_time_ms: int
    splits: List[Dict[str, Any]]

# Discriminated union — FastAPI poprawnie dobierze response schema po polu "type"
AnyResultResponse = Annotated[
    Union[
        TeamScoreResultResponse,
        IndividualScoreResultResponse,
        TimedResultResponse,
    ],
    Field(discriminator="type"),
]
