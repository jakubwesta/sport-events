from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.modules.auth.dependencies import require_organizer, get_current_user
from app.modules.participations.models import Participation, ParticipationStatus
from app.modules.users.models import User, UserRole
from app.modules.participations.schemas import ParticipationResponse
from app.modules.teams.models import TeamMember

router = APIRouter(prefix="/participations", tags=["Participations"])


@router.delete("/{participation_id}", status_code=status.HTTP_204_NO_CONTENT)
def withdraw_participation(
    participation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    participation = db.query(Participation).filter(Participation.id == participation_id).first()
    if not participation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participation not found.")

    # Individual participation: must be the participant
    if participation.user_id is not None:
        if participation.user_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed.")
    # Team participation: must be the team owner
    elif participation.team_id is not None:
        member = db.query(TeamMember).filter(
            TeamMember.team_id == participation.team_id,
            TeamMember.user_id == current_user.id,
        ).first()
        from app.modules.teams.models import Team
        team = db.query(Team).filter(Team.id == participation.team_id).first()
        if (not team or team.owner_id != current_user.id) and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the team captain can withdraw.")

    db.delete(participation)
    db.commit()


@router.patch("/{participation_id}/pay", response_model=ParticipationResponse)
def mark_participation_as_paid(
    participation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    participation = db.query(Participation).filter(Participation.id == participation_id).first()
    
    if not participation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Nie znaleziono zgłoszenia."
        )
        
    if participation.status == ParticipationStatus.ACCEPTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="To zgłoszenie zostało już wcześniej opłacone i potwierdzone."
        )

    participation.status = ParticipationStatus.ACCEPTED
    db.commit()
    db.refresh(participation)
    
    return participation