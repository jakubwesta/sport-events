from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.modules.results import models, schemas
from app.modules.auth.dependencies import require_organizer
from app.modules.users.models import User
from app.modules.participations.models import Participation

router = APIRouter(prefix="/results", tags=["Results"])


def _get_participation_or_404(participation_id: int, db: Session) -> Participation:
    participation = db.query(Participation).filter(Participation.id == participation_id).first()
    if not participation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Uczestnictwo o ID {participation_id} nie istnieje.",
        )
    return participation


def _check_no_existing_result(participation_id: int, db: Session):
    existing = db.query(models.Result).filter(
        models.Result.participation_id == participation_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Wynik dla uczestnictwa o ID {participation_id} już istnieje.",
        )


@router.post("/team-score", response_model=schemas.TeamScoreResultResponse, status_code=status.HTTP_201_CREATED)
def create_team_score_result(
    result_in: schemas.TeamScoreResultCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    _get_participation_or_404(result_in.participation_id, db)
    _check_no_existing_result(result_in.participation_id, db)

    db_result = models.TeamScoreResult(**result_in.model_dump())
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result


@router.post("/individual-score", response_model=schemas.IndividualScoreResultResponse, status_code=status.HTTP_201_CREATED)
def create_individual_score_result(
    result_in: schemas.IndividualScoreResultCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    _get_participation_or_404(result_in.participation_id, db)
    _check_no_existing_result(result_in.participation_id, db)

    db_result = models.IndividualScoreResult(**result_in.model_dump())
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result


@router.post("/timed", response_model=schemas.TimedResultResponse, status_code=status.HTTP_201_CREATED)
def create_timed_result(
    result_in: schemas.TimedResultCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    _get_participation_or_404(result_in.participation_id, db)
    _check_no_existing_result(result_in.participation_id, db)

    db_result = models.TimedResult(**result_in.model_dump())
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result


@router.get("/{result_id}", response_model=schemas.AnyResultResponse)
def get_result(result_id: int, db: Session = Depends(get_db)):
    db_result = db.query(models.Result).filter(models.Result.id == result_id).first()
    if not db_result:
        raise HTTPException(status_code=404, detail="Wynik nie istnieje.")
    return db_result


@router.get("/event/{event_id}", response_model=List[schemas.AnyResultResponse])
def get_results_for_event(event_id: int, db: Session = Depends(get_db)):
    results = db.query(models.Result)\
            .join(Participation)\
            .filter(Participation.event_id == event_id)\
            .all()
    return results


@router.delete("/{result_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_result(
    result_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    db_result = db.query(models.Result).filter(models.Result.id == result_id).first()
    if not db_result:
        raise HTTPException(status_code=404, detail="Wynik nie istnieje.")
    db.delete(db_result)
    db.commit()
    return None