import enum

from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from app.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    GUEST = "GUEST"
    USER = "USER"
    ORGANIZER = "ORGANIZER"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    google_sub = Column(String, unique=True, nullable=True, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.USER)

    first_name = Column(String, nullable=False, server_default="Admin")
    last_name = Column(String, nullable=False, server_default="Admin")
    birth_year = Column(Integer, nullable=True, server_default=None) 
    phone_number = Column(String, nullable=True, server_default=None)

    events = relationship("Event", back_populates="owner", cascade="all, delete-orphan")
    managed_teams = relationship("Team", back_populates="owner", cascade="all, delete-orphan")