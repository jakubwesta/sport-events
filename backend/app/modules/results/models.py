from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Result(Base):
    __tablename__ = "results"
    
    id = Column(Integer, primary_key=True, index=True)
    participation_id = Column(Integer, ForeignKey("participations.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50))
    place = Column(Integer, nullable=True)  # miejsce w rankingu (1 = zwycięzca)
    
    participation = relationship("Participation", back_populates="results")

    __mapper_args__ = {
        "polymorphic_identity": "result",
        "polymorphic_on": type,
    }


class TeamScoreResult(Result):
    __tablename__ = "team_score_results"
    
    id = Column(Integer, ForeignKey("results.id", ondelete="CASCADE"), primary_key=True)
    result = Column(String(10), nullable=False)
    details = Column(JSON, nullable=True, default=lambda: {})

    __mapper_args__ = {
        "polymorphic_identity": "team_score",
    }



class IndividualScoreResult(Result):
    __tablename__ = "individual_score_results"
    
    id = Column(Integer, ForeignKey("results.id", ondelete="CASCADE"), primary_key=True)
    score = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": "individual_score",
    }


class TimedResult(Result):
    __tablename__ = "timed_results"
    
    id = Column(Integer, ForeignKey("results.id", ondelete="CASCADE"), primary_key=True)
    total_time_ms = Column(Integer, nullable=False)
    splits = Column(JSON, nullable=False, default=lambda: [])

    __mapper_args__ = {
        "polymorphic_identity": "timed",
    }
