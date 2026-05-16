from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.modules.locations import models, schemas
from app.modules.auth.dependencies import get_current_user 

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.post("/", response_model=schemas.LocationResponse, status_code=status.HTTP_201_CREATED)
def create_location(
    location: schemas.LocationCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    existing_location = db.query(models.Location).filter(
        models.Location.latitude == location.latitude,
        models.Location.longitude == location.longitude
    ).first()
    
    if existing_location:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ta lokalizacja została już dodana do systemu."
        )

    db_location = models.Location(**location.model_dump())
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

@router.get("/", response_model=List[schemas.LocationResponse])
def get_locations(db: Session = Depends(get_db)):
    return db.query(models.Location).all()

@router.get("/{location_id}", response_model=schemas.LocationResponse)
def get_location(location_id: int, db: Session = Depends(get_db)):
    db_location = db.query(models.Location).filter(models.Location.id == location_id).first()
    if not db_location:
        raise HTTPException(status_code=404, detail="Location not found")
    return db_location


@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_location(
    location_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_location = db.query(models.Location).filter(models.Location.id == location_id).first()
    if not db_location:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nie znaleziono lokalizacji.")
    
    db.delete(db_location)
    db.commit()
    return None