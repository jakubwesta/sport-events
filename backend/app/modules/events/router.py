from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.modules.events import models, schemas
from app.modules.auth.dependencies import get_current_user
from app.modules.users.models import User, UserRole
from app.modules.categories.models import Category
from app.modules.locations.models import Location

router = APIRouter(prefix="/events", tags=["Events"])

@router.post("/", response_model=schemas.EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = db.query(Category).filter(Category.id == event.category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Kategoria o ID {event.category_id} nie istnieje.")
        
    if event.location_id is not None:
        location = db.query(Location).filter(Location.id == event.location_id).first()
        if not location:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Lokalizacja o ID {event.location_id} nie istnieje.")

    db_event = models.Event(**event.model_dump(), owner_id=current_user.id)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/", response_model=List[schemas.EventResponse])
def get_events(db: Session = Depends(get_db)):
    return db.query(models.Event).all()

@router.get("/{event_id}", response_model=schemas.EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Nie znaleziono wydarzenia.")
    return db_event

@router.patch("/{event_id}", response_model=schemas.EventResponse)
def update_event(
    event_id: int,
    event_update: schemas.EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Nie znaleziono wydarzenia.")

    if db_event.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Brak uprawnień do edycji tego wydarzenia.")

    update_data = event_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_event, key, value)
        
    db.commit()
    db.refresh(db_event)
    return db_event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Nie znaleziono wydarzenia.")

    if db_event.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Brak uprawnień do usunięcia tego wydarzenia.")

    db.delete(db_event)
    db.commit()
    return None
