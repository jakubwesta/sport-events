import enum
from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime, func, CheckConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class TeamMemberStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)

    owner = relationship("User", back_populates="managed_teams")
    event = relationship("Event", back_populates="teams")
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")


class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    status = Column(Enum(TeamMemberStatus), default=TeamMemberStatus.PENDING, nullable=False)
    joined_at = Column(DateTime, server_default=func.now())

    user = relationship("User")
    team = relationship("Team", back_populates="members")

    __table_args__ = (
        CheckConstraint(
            "(user_id IS NOT NULL) OR (first_name IS NOT NULL AND last_name IS NOT NULL)",
            name="check_user_or_ghost",
        ),
    )