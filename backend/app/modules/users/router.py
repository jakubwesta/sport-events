from app.modules.events.models import Event
from app.modules.events import schemas as event_schemas
from app.modules.teams.models import Team, TeamMember, TeamMemberStatus

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.modules.users.models import User, UserRole
from app.modules.participations.models import Participation, ParticipationStatus
from app.modules.users.schemas import UserCreate, UserUpdate, UserResponse
from app.modules.auth.dependencies import get_current_user, require_admin
from app.modules.auth.utils import hash_password

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """Pobiera dane aktualnie zalogowanego użytkownika na podstawie JWT."""
    return current_user

@router.get("/", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    """Pobiera listę wszystkich użytkowników (tylko dla ADMIN)."""
    return db.query(User).all()

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Pobiera konkretnego użytkownika (wymaga bycia tym użytkownikiem lub ADMIN)."""
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Brak uprawnień")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")
    return user


from sqlalchemy import or_

@router.get("/me/events", response_model=List[event_schemas.EventResponse])
def get_my_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    events = (
        db.query(Event)
        .join(Participation, Participation.event_id == Event.id)
        .outerjoin(TeamMember, TeamMember.team_id == Participation.team_id)
        .filter(
            Participation.status == ParticipationStatus.PENDING,
            or_(
                Participation.user_id == current_user.id,
                or_(
                    TeamMember.user_id == current_user.id,
                    TeamMember.status == TeamMemberStatus.PENDING
                )
            )
        )
        .distinct()
        .all()
    )
    
    return events

@router.patch("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Edycja danych użytkownika. Zmiana roli (jeśli jest w payloadzie) tylko dla ADMIN."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")
        
    if current_user.id != user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Brak uprawnień")
        
    update_data = user_update.model_dump(exclude_unset=True) if hasattr(user_update, "model_dump") else user_update.dict(exclude_unset=True)
    
    if "role" in update_data:
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Tylko administrator może zmieniać role")
        user.role = update_data.pop("role")

    if "password" in update_data:
        user.hashed_password = hash_password(update_data.pop("password"))
        
    for key, value in update_data.items():
        setattr(user, key, value)
            
    db.commit()
    db.refresh(user)
    return user

@router.patch("/{user_id}/role", response_model=UserResponse)
def change_user_role(user_id: int, role: UserRole, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    """Jawny endpoint do zmiany samej roli - widoczny przykład działania `require_admin`."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")
    user.role = role
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    """Usuwanie użytkownika - dostępne tylko dla administratora."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")
    db.delete(user)
    db.commit()
    return None