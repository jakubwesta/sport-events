from pydantic import BaseModel, Field
from app.modules.users.models import UserRole


class RegisterRequest(BaseModel):
    email: str
    password: str
    first_name: str = Field(..., example="Jan")
    last_name: str = Field(..., example="Kowalski")
    birth_year: int = Field(..., example=1995, gt=1900, lt=2026)
    phone_number: str = Field(..., example="123456789", pattern="^[0-9]{9}$")


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
