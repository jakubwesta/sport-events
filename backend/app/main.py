from pathlib import Path

from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import time
from sqlalchemy.sql import text
from sqlalchemy.exc import OperationalError

from app.modules.users.models import User
from app.modules.categories.models import Category
from app.modules.locations.models import Location
from app.modules.events.models import Event
from app.modules.teams.models import Team, TeamMember, TeamMemberStatus
from app.modules.participations.models import Participation
from app.modules.results.models import Result, IndividualScoreResult, TimedResult
from app.modules.matches.models import Match

from app.modules.auth.router import router as auth_router
from app.modules.users.router import router as users_router
from app.modules.locations.router import router as location_router
from app.modules.categories.router import router as category_router
from app.modules.teams.router import router as teams_router
from app.modules.events.router import router as events_router
from app.modules.participations.router import router as participations_router
from app.modules.results.router import router as results_router
from app.modules.matches.router import router as matches_router
from app.database import SessionLocal  

app = FastAPI()

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(users_router)
app.include_router(location_router)
app.include_router(category_router)
app.include_router(teams_router)
app.include_router(events_router)
app.include_router(participations_router)
app.include_router(results_router)
app.include_router(matches_router)

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

def run_migrations():
    print("--- URUCHAMIANIE MIGRACJI ---", flush=True)
    root = Path(__file__).resolve().parent.parent
    alembic_cfg = Config(str(root / "alembic.ini"))
    command.upgrade(alembic_cfg, "head")
    print("--- MIGRACJE ZAKOŃCZONE ---", flush=True)

@app.on_event("startup")
def startup_event():
    if not wait_for_db():
        print("--- BŁĄD: NIE MOŻNA POŁĄCZYĆ SIĘ Z BAZĄ. SEEDING POMINIĘTY ---", flush=True)
        return

    try:
        run_migrations()
    except Exception as exc:
        print(f"--- BŁĄD MIGRACJI: {exc} ---", flush=True)
        return

    from app.seed import seed_admin, seed_categories, seed_sample_results
    seed_admin()
    seed_categories()
    seed_sample_results()

@app.get("/")
def root():
    return {"message": "Backend działa!"}
