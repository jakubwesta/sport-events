from pydantic import BaseModel, EmailStr, model_validator
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
    has_google_login: bool = False

    @model_validator(mode="wrap")
    @classmethod
    def set_google_login_flag(cls, value, handler):
        result = handler(value)
        if hasattr(value, "google_sub"):
            result.has_google_login = value.google_sub is not None
        return result

    class Config:
        from_attributes = True
