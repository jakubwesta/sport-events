from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.modules.teams import models, schemas
from app.modules.auth.dependencies import get_current_user
from app.modules.users.models import User
from app.modules.events import models as event_models

router = APIRouter(prefix="/teams", tags=["Teams"])


@router.post("/", response_model=schemas.TeamResponse, status_code=status.HTTP_201_CREATED)
def create_team(
    team: schemas.TeamCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if team.event_id:
        event = db.query(event_models.Event).filter(event_models.Event.id == team.event_id).first()
        
        if not event:
            raise HTTPException(status_code=404, detail="Wskazane wydarzenie nie istnieje.")
            
        if event.event_type != event_models.EventType.TEAM:
            raise HTTPException(
                status_code=400, 
                detail="Nie można przypisać drużyny do wydarzenia indywidualnego."
            )

    existing_team = db.query(models.Team).filter(
        models.Team.name == team.name,
        models.Team.event_id == team.event_id
    ).first()
    
    if existing_team:
        raise HTTPException(
            status_code=400, 
            detail="Drużyna o tej nazwie jest już zapisana na to wydarzenie."
        )

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

    # Inicjalizujemy zmienne dla imienia i nazwiska
    first_name = member_data.first_name
    last_name = member_data.last_name
    member_status = models.TeamMemberStatus.ACCEPTED

    # ŚCIEŻKA DLA REALNEGO UŻYTKOWNIKA
    if member_data.user_id:
        # 1. Sprawdzamy, czy użytkownik w ogóle istnieje w systemie
        invited_user = db.query(User).filter(User.id == member_data.user_id).first()
        if not invited_user:
            raise HTTPException(status_code=404, detail="Zapraszany użytkownik nie istnieje.")

        # 2. Sprawdzamy, czy już nie jest w tej drużynie
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

        # 3. NADPISUJEMY DANE: Bierzemy oficjalne imię i nazwisko z konta użytkownika
        first_name = invited_user.first_name
        last_name = invited_user.last_name
        member_status = models.TeamMemberStatus.PENDING

    # ŚCIEŻKA DLA GHOST MEMBERA (gdy user_id to None)
    else:
        # Walidacja, czy kapitan podał chociaż imię i nazwisko wirtualnego gracza
        if not first_name or not last_name:
            raise HTTPException(
                status_code=400,
                detail="Dla wirtualnego zawodnika musisz podać imię i nazwisko.",
            )

    # Zapis do bazy (jedna spójna operacja)
    db_member = models.TeamMember(
        team_id=team_id,
        user_id=member_data.user_id,
        first_name=first_name,
        last_name=last_name,
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
    db.commit()