from pydantic import BaseModel, EmailStr
from app.modules.users.models import UserRole



class UserCreate(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    birth_year: int | None = None
    phone_number: str | None = None


class UserUpdate(BaseModel):
    email: str | None = None
    password: str | None = None
    role: UserRole | None = None
    first_name: str | None = None
    last_name: str | None = None
    birth_year: int | None = None
    phone_number: str | None = None


class UserResponse(BaseModel):
    id: int
    email: str
    role: UserRole
    first_name: str | None = None
    last_name: str | None = None
    birth_year: int | None = None
    phone_number: str | None = None

    class Config:
        from_attributes = True
