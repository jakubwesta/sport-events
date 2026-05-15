from fastapi import FastAPI
import time
from sqlalchemy.sql import text
from sqlalchemy.exc import OperationalError

from app.modules.auth.router import router as auth_router
from app.modules.users.router import router as users_router
from app.database import SessionLocal  

app = FastAPI()

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(users_router)

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
        from app.seed import seed_admin
        seed_admin()
    else:
        print("--- BŁĄD: NIE MOŻNA POŁĄCZYĆ SIĘ Z BAZĄ. SEEDING POMINIĘTY ---", flush=True)

@app.get("/")
def root():
    return {"message": "Backend działa!"}