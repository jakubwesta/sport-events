import os
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.database import SessionLocal
from app.modules.users.models import User, UserRole
from app.modules.auth.utils import hash_password
from app.modules.categories.models import Category


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

def seed_categories():
    initial_categories = [
        {"name": "Piłka nożna", "slug": "pilka-nozna"},
        {"name": "Koszykówka", "slug": "koszykowka"},
        {"name": "Bieganie", "slug": "bieganie"},
        {"name": "Pływanie", "slug": "plywanie"},
        {"name": "Kolarstwo", "slug": "kolarstwo"},
        {"name": "Triathlon", "slug": "triathlon"},
        {"name": "Inne", "slug": "inne"}
    ]

    db = SessionLocal()
    try:
        for cat_data in initial_categories:
            # Sprawdzamy czy kategoria już jest w bazie (żeby nie dublować)
            exists = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
            if not exists:
                new_cat = Category(**cat_data)
                db.add(new_cat)
                print(f"Dodano kategorię: {cat_data['name']}")
        
        db.commit()
        print("Seedowanie zakończone pomyślnie!")
    except Exception as e:
        print(f"Błąd podczas seedowania: {e}")
        db.rollback()
    finally:
        db.close()
