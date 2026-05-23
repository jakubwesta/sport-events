from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from typing import List, Optional
from app.database import get_db
from app.modules.events import models, schemas
from app.modules.auth.dependencies import get_current_user, require_organizer
from app.modules.users.models import User, UserRole
from app.modules.categories.models import Category
from app.modules.locations.models import Location
from app.modules.events.models import EventStatus, EventType
from fastapi import APIRouter, Depends, Query
from app.modules.events import models as event_models
from app.modules.participations import models as part_models
from app.modules.participations import schemas as part_schemas

router = APIRouter(prefix="/events", tags=["Events"])

@router.post("/", response_model=schemas.EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
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
def get_events(
    status: Optional[EventStatus] = Query(None, description="Filtruj po statusie"),
    category_id: Optional[int] = Query(None, description="Filtruj po ID kategorii"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Event)
    
    if status:
        query = query.filter(models.Event.status == status)
        
    if category_id is not None:
        query = query.filter(models.Event.category_id == category_id)
        
    return query.all()

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
    current_user: User = Depends(require_organizer),
):
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Nie znaleziono wydarzenia.")

    if db_event.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Brak uprawnień do edycji tego wydarzenia.")

    update_data = event_update.model_dump(exclude_unset=True)

    if "location_id" in update_data and update_data["location_id"] is not None:
        location = db.query(Location).filter(Location.id == update_data["location_id"]).first()
        if not location:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Lokalizacja o ID {update_data['location_id']} nie istnieje.",
            )

    for key, value in update_data.items():
        setattr(db_event, key, value)
        
    db.commit()
    db.refresh(db_event)
    return db_event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Nie znaleziono wydarzenia.")

    if db_event.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Brak uprawnień do usunięcia tego wydarzenia.")

    db.delete(db_event)
    db.commit()
    return None

@router.post("/{event_id}/participate", response_model=part_schemas.ParticipationResponse, status_code=status.HTTP_201_CREATED)
def join_event(
    event_id: int,
    participation_data: part_schemas.ParticipationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    event = db.query(event_models.Event).filter(event_models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Wydarzenie nie istnieje.")

    if event.event_type == event_models.EventType.INDIVIDUAL and participation_data.team_id:
        raise HTTPException(status_code=400, detail="To jest wydarzenie indywidualne, nie możesz zapisać drużyny.")
        
    if event.event_type == event_models.EventType.TEAM and participation_data.user_id:
        raise HTTPException(status_code=400, detail="To jest wydarzenie drużynowe, musisz podać team_id.")

    db_participation = part_models.Participation(
        event_id=event_id,
        user_id=participation_data.user_id if event.event_type == event_models.EventType.INDIVIDUAL else None,
        team_id=participation_data.team_id if event.event_type == event_models.EventType.TEAM else None,
        status=part_models.ParticipationStatus.PENDING
    )
    
    db.add(db_participation)
    db.commit()
    db.refresh(db_participation)
    return db_participation

@router.get("/{event_id}/participations", response_model=List[part_schemas.ParticipationResponse])
def get_event_participations(event_id: int, db: Session = Depends(get_db)):
    event = db.query(event_models.Event).filter(event_models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Wydarzenie nie istnieje.")
        
    return db.query(part_models.Participation).filter(part_models.Participation.event_id == event_id).all()