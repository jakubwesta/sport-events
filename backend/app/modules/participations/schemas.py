from pydantic import BaseModel, Field, model_validator
from datetime import datetime
from typing import Optional
from app.modules.participations.models import ParticipationStatus


class ParticipationUserInfo(BaseModel):
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str

    class Config:
        from_attributes = True


class ParticipationTeamInfo(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class ParticipationBase(BaseModel):
    user_id: Optional[int] = None
    team_id: Optional[int] = None


class ParticipationCreate(ParticipationBase):
    @model_validator(mode="after")
    def check_user_or_team(self):
        if not self.user_id and not self.team_id:
            raise ValueError("Musisz podać user_id lub team_id.")
        if self.user_id and self.team_id:
            raise ValueError("Nie można zapisać jednocześnie użytkownika i drużyny. Wybierz jedno.")
        return self


class ParticipationResponse(ParticipationBase):
    id: int
    status: ParticipationStatus
    created_at: datetime
    user: Optional[ParticipationUserInfo] = None
    team: Optional[ParticipationTeamInfo] = None

    class Config:
        from_attributes = True