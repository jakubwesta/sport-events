import os
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.database import SessionLocal
from app.modules.users.models import User, UserRole
from app.modules.auth.utils import hash_password

load_dotenv()


def seed_admin():
    print("--- SEEDING ADMIN ---", flush=True)

    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")

    if not admin_email or not admin_password:
        print("ADMIN_EMAIL / ADMIN_PASSWORD nie ustawione w .env — pomijam seed admina", flush=True)
        return

    db: Session = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == admin_email).first()
        if existing:
            print(f"Admin już istnieje: {admin_email}", flush=True)
            return

        admin = User(
            email=admin_email,
            hashed_password=hash_password(admin_password),
            role=UserRole.ADMIN,
        )
        db.add(admin)
        db.commit()
        print(f"Utworzono admina: {admin_email}", flush=True)
    finally:
        db.close()
