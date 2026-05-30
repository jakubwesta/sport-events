from pydantic import BaseModel, Field, field_validator
from app.modules.users.models import UserRole


class RegisterRequest(BaseModel):
    email: str
    password: str
    first_name: str = Field(..., example="Jan")
    last_name: str = Field(..., example="Kowalski")
    birth_year: int = Field(..., example=1995, gt=1900, lt=2026)
    phone_number: str = Field(..., example="123456789", pattern="^[0-9]{9}$")
    role: UserRole = UserRole.USER

    @field_validator("role")
    @classmethod
    def validate_register_role(cls, value: UserRole) -> UserRole:
        if value not in (UserRole.USER, UserRole.ORGANIZER):
            raise ValueError("Role must be USER or ORGANIZER")
        return value


class LoginRequest(BaseModel):
    email: str
    password: str


class GoogleLoginRequest(BaseModel):
    id_token: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
