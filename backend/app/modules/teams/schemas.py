from pydantic import BaseModel, model_validator, computed_field
from typing import Optional
from enum import Enum


class TeamMemberStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class TeamMemberCreate(BaseModel):
    user_id: Optional[int] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    @model_validator(mode="after")
    def check_either_user_or_ghost(self):
        if not self.user_id and not (self.first_name and self.last_name):
            raise ValueError(
                "Musisz podać ID zarejestrowanego użytkownika lub kompletne imię i nazwisko zawodnika."
            )
        return self


class TeamMemberResponse(BaseModel):
    id: int
    status: TeamMemberStatus
    user_id: Optional[int] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    @computed_field
    @property
    def is_ghost(self) -> bool:
        return self.user_id is None

    class Config:
        from_attributes = True


class TeamCreate(BaseModel):
    name: str


class TeamResponse(BaseModel):
    id: int
    name: str
    owner_id: int

    class Config:
        from_attributes = True