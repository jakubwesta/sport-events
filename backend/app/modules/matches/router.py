from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.modules.matches import models, schemas
from app.modules.auth.dependencies import require_organizer
from app.modules.users.models import User
from app.modules.events.models import Event
from app.modules.participations.models import Participation

router = APIRouter(prefix="/matches", tags=["Matches"])

@router.post("/", response_model=schemas.MatchResponse, status_code=status.HTTP_201_CREATED)
def create_match(
    match_in: schemas.MatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    event = db.query(Event).filter(Event.id == match_in.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Wydarzenie nie istnieje.")

    part_a = db.query(Participation).filter(Participation.id == match_in.participation_a_id).first()
    part_b = db.query(Participation).filter(Participation.id == match_in.participation_b_id).first()

    if not part_a or not part_b:
        raise HTTPException(status_code=400, detail="Przynajmniej jedno uczestnictwo nie istnieje.")
        
    if part_a.event_id != match_in.event_id or part_b.event_id != match_in.event_id:
         raise HTTPException(status_code=400, detail="Obie drużyny muszą być zapisane na ten sam event.")

    db_match = models.Match(**match_in.model_dump())
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

@router.patch("/{match_id}/score", response_model=schemas.MatchResponse)
def update_match_score(
    match_id: int,
    score_update: schemas.MatchUpdateScore,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    db_match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not db_match:
        raise HTTPException(status_code=404, detail="Mecz nie istnieje.")

    update_data = score_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_match, key, value)
        
    db.commit()
    db.refresh(db_match)
    return db_match

@router.get("/event/{event_id}", response_model=List[schemas.MatchResponseWithParticipations])
def get_matches_for_event(event_id: int, db: Session = Depends(get_db)):
    matches = db.query(models.Match).filter(models.Match.event_id == event_id).all()
    return matches

@router.delete("/{match_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    db_match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not db_match:
        raise HTTPException(status_code=404, detail="Mecz nie istnieje.")
    db.delete(db_match)
    db.commit()
    return None
