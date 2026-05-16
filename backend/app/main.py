from fastapi import FastAPI
import time
from sqlalchemy.sql import text
from sqlalchemy.exc import OperationalError

from app.modules.users.models import User
from app.modules.categories.models import Category
from app.modules.locations.models import Location
from app.modules.events.models import Event
from app.modules.teams.models import Team, TeamMember, TeamMemberStatus

from app.modules.auth.router import router as auth_router
from app.modules.users.router import router as users_router
from app.modules.locations.router import router as location_router
from app.modules.categories.router import router as category_router
from app.modules.teams.router import router as teams_router
from app.modules.events.router import router as events_router
from app.database import SessionLocal  

app = FastAPI()

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(users_router)
app.include_router(location_router)
app.include_router(category_router)
app.include_router(teams_router)
app.include_router(events_router)

def wait_for_db(retries: int = 10, interval: int = 1):
    print("--- OCZEKIWANIE NA BAZĘ DANYCH ---", flush=True)
    for i in range(retries):
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
            print("--- BAZA DANYCH GOTOWA ---", flush=True)
            return True
        except OperationalError:
            print(f"Baza nieodpowiada (próba {i+1}/{retries})...", flush=True)
            time.sleep(interval)
        finally:
            db.close()
    return False

@app.on_event("startup")
def startup_event():
    if wait_for_db():
        from app.seed import seed_admin, seed_categories
        seed_admin()
        seed_categories()
    else:
        print("--- BŁĄD: NIE MOŻNA POŁĄCZYĆ SIĘ Z BAZĄ. SEEDING POMINIĘTY ---", flush=True)

@app.get("/")
def root():
    return {"message": "Backend działa!"}