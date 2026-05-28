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


class TeamMemberUserInfo(BaseModel):
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str

    class Config:
        from_attributes = True


class TeamMemberResponse(BaseModel):
    id: int
    status: TeamMemberStatus
    user_id: Optional[int] = None
    # Stored on the row for ghost members
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    # Populated from the ORM relationship when user_id is set
    user: Optional[TeamMemberUserInfo] = None

    @computed_field
    @property
    def is_ghost(self) -> bool:
        return self.user_id is None

    @computed_field
    @property
    def display_first_name(self) -> Optional[str]:
        return self.first_name or (self.user.first_name if self.user else None)

    @computed_field
    @property
    def display_last_name(self) -> Optional[str]:
        return self.last_name or (self.user.last_name if self.user else None)

    @computed_field
    @property
    def display_email(self) -> Optional[str]:
        return self.user.email if self.user else None

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