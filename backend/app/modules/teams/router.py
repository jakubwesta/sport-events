from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.modules.teams import models, schemas
from app.modules.auth.dependencies import get_current_user

router = APIRouter(prefix="/teams", tags=["Teams"])


@router.post("/", response_model=schemas.TeamResponse, status_code=status.HTTP_201_CREATED)
def create_team(
    team: schemas.TeamCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    existing_team = db.query(models.Team).filter(models.Team.name == team.name).first()
    if existing_team:
        raise HTTPException(status_code=400, detail="Drużyna o tej nazwie już istnieje.")

    db_team = models.Team(
        name=team.name, 
        owner_id=current_user.id,
        event_id=team.event_id
    )
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team


@router.get("/", response_model=List[schemas.TeamResponse])
def get_teams(db: Session = Depends(get_db)):
    return db.query(models.Team).all()


@router.post(
    "/{team_id}/members",
    response_model=schemas.TeamMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_team_member(
    team_id: int,
    member_data: schemas.TeamMemberCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Nie znaleziono drużyny.")

    if team.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Tylko kapitan może dodawać zawodników do tej drużyny.",
        )

    if member_data.user_id:
        existing_member = (
            db.query(models.TeamMember)
            .filter(
                models.TeamMember.team_id == team_id,
                models.TeamMember.user_id == member_data.user_id,
            )
            .first()
        )
        if existing_member:
            raise HTTPException(
                status_code=400,
                detail="Ten użytkownik jest już przypisany do tej drużyny.",
            )

    # ghost = brak user_id → od razu accepted; zaproszenie → pending
    member_status = (
        models.TeamMemberStatus.ACCEPTED
        if member_data.user_id is None
        else models.TeamMemberStatus.PENDING
    )

    db_member = models.TeamMember(
        team_id=team_id,
        user_id=member_data.user_id,
        first_name=member_data.first_name,
        last_name=member_data.last_name,
        status=member_status,
    )
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member


@router.get("/{team_id}/members", response_model=List[schemas.TeamMemberResponse])
def get_team_members(team_id: int, db: Session = Depends(get_db)):
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Nie znaleziono drużyny.")

    return db.query(models.TeamMember).filter(models.TeamMember.team_id == team_id).all()


@router.delete("/{team_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_team_member(
    team_id: int,
    member_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Nie znaleziono drużyny.")

    if team.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Tylko kapitan może usuwać zawodników z tej drużyny.",
        )

    member = (
        db.query(models.TeamMember)
        .filter(
            models.TeamMember.id == member_id,
            models.TeamMember.team_id == team_id,
        )
        .first()
    )
    if not member:
        raise HTTPException(status_code=404, detail="Nie znaleziono zawodnika.")

    db.delete(member)
    db.commit().all()