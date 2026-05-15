from pydantic import BaseModel, model_validator
from typing import Optional
from app.modules.teams.models import TeamMemberStatus

class TeamMemberCreate(BaseModel):
    user_id: Optional[int] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    @model_validator(mode='after')
    def check_either_user_or_ghost(self):
        if not self.user_id and not (self.first_name and self.last_name):
            raise ValueError('Musisz podać ID użytkownika lub imię i nazwisko ghost usera.')
        return self

class TeamMemberResponse(BaseModel):
    id: int
    status: TeamMemberStatus
    user_id: Optional[int] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    
    is_ghost: bool = False 

    @model_validator(mode='after')
    def set_ghost_flag(self):
        self.is_ghost = self.user_id is None
        return self