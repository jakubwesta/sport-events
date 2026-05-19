from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.modules.auth.dependencies import require_organizer
from app.modules.participations.models import Participation, ParticipationStatus
from app.modules.users.models import User
from app.modules.participations.schemas import ParticipationResponse

router = APIRouter(prefix="/participations", tags=["Participations"])

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