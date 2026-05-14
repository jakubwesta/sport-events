from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.modules.auth import models

router = APIRouter()

@router.get("/test-db")
def test_connection(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))        
        return {"status": "success", "message": "Połączono z bazą danych!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}