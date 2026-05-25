import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.database import SessionLocal
from app.modules.users.models import User, UserRole
from app.modules.auth.utils import hash_password
from app.modules.categories.models import Category
from app.modules.locations.models import Location
from app.modules.events.models import Event, EventType, EventStatus
from app.modules.teams.models import Team, TeamMember, TeamMemberStatus
from app.modules.participations.models import Participation, ParticipationStatus
from app.modules.results.models import (
    Result, IndividualScoreResult, TimedResult,
)


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
            exists = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
            if not exists:
                new_cat = Category(**cat_data)
                db.add(new_cat)
                print(f"Dodano kategorię: {cat_data['name']}", flush=True)
        
        db.commit()
        print("Seedowanie kategorii zakończone pomyślnie!", flush=True)
    except Exception as e:
        print(f"Błąd podczas seedowania kategorii: {e}", flush=True)
        db.rollback()
    finally:
        db.close()


def seed_sample_results():
    """Tworzy przykładowe dane: użytkowników, zespoły, eventy, uczestnictwa i wyniki."""
    print("--- SEEDING SAMPLE RESULTS ---", flush=True)

    db: Session = SessionLocal()
    try:
        # Sprawdź czy dane przykładowe już istnieją
        if db.query(Result).first():
            print("Przykładowe wyniki już istnieją — pomijam.", flush=True)
            return

        # --- 1. Użytkownicy (organizator + gracze) ---
        organizer = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if not organizer:
            organizer = db.query(User).filter(User.role == UserRole.ORGANIZER).first()
        if not organizer:
            print("Brak organizatora/admina w bazie — pomijam seed wyników.", flush=True)
            return

        # Tworzenie graczy
        players = []
        player_data = [
            {"email": "jan.kowalski@example.com", "first_name": "Jan", "last_name": "Kowalski"},
            {"email": "anna.nowak@example.com", "first_name": "Anna", "last_name": "Nowak"},
            {"email": "piotr.wisniewski@example.com", "first_name": "Piotr", "last_name": "Wiśniewski"},
            {"email": "maria.zielinska@example.com", "first_name": "Maria", "last_name": "Zielińska"},
        ]
        for pd in player_data:
            user = db.query(User).filter(User.email == pd["email"]).first()
            if not user:
                user = User(
                    email=pd["email"],
                    hashed_password=hash_password("haslo123"),
                    role=UserRole.USER,
                    first_name=pd["first_name"],
                    last_name=pd["last_name"],
                )
                db.add(user)
            players.append(user)
        db.flush()

        # --- 2. Lokalizacja ---
        location = db.query(Location).first()
        if not location:
            location = Location(
                name="Stadion Miejski",
                address="ul. Sportowa 1",
                city="Warszawa",
                latitude=52.2297,
                longitude=21.0122,
            )
            db.add(location)
            db.flush()

        # --- 3. Kategorie ---
        cat_pilka = db.query(Category).filter(Category.slug == "pilka-nozna").first()
        cat_bieganie = db.query(Category).filter(Category.slug == "bieganie").first()
        cat_plywanie = db.query(Category).filter(Category.slug == "plywanie").first()

        if not cat_pilka or not cat_bieganie or not cat_plywanie:
            print("Brak wymaganych kategorii — uruchom najpierw seed_categories().", flush=True)
            return

        now = datetime.utcnow()

        # ============================================================
        # PRZYKŁAD 1: Mecz drużynowy (piłka nożna) — TeamScoreResult
        # ============================================================
        team_event = Event(
            title="Turniej Piłki Nożnej — Wiosna 2026",
            description="Drużynowy turniej piłkarski",
            event_type=EventType.TEAM,
            status=EventStatus.COMPLETED,
            max_participants=8,
            min_team_size=2,
            max_team_size=5,
            price=0.0,
            start_date=now - timedelta(days=7),
            duration=120,
            registration_deadline=now - timedelta(days=14),
            is_active=True,
            is_published=True,
            category_id=cat_pilka.id,
            location_id=location.id,
            owner_id=organizer.id,
        )
        db.add(team_event)
        db.flush()

        # Drużyny
        team_a = Team(name="Orły Warszawy", owner_id=players[0].id)
        team_b = Team(name="Smoki Krakowa", owner_id=players[2].id)
        db.add_all([team_a, team_b])
        db.flush()

        # Członkowie drużyn
        db.add_all([
            TeamMember(team_id=team_a.id, user_id=players[0].id, status=TeamMemberStatus.ACCEPTED),
            TeamMember(team_id=team_a.id, user_id=players[1].id, status=TeamMemberStatus.ACCEPTED),
            TeamMember(team_id=team_b.id, user_id=players[2].id, status=TeamMemberStatus.ACCEPTED),
            TeamMember(team_id=team_b.id, user_id=players[3].id, status=TeamMemberStatus.ACCEPTED),
        ])
        db.flush()

        # Uczestnictwa drużyn w turnieju
        part_team_a = Participation(
            event_id=team_event.id, team_id=team_a.id,
            status=ParticipationStatus.ACCEPTED,
        )
        part_team_b = Participation(
            event_id=team_event.id, team_id=team_b.id,
            status=ParticipationStatus.ACCEPTED,
        )
        db.add_all([part_team_a, part_team_b])
        db.flush()

        from app.modules.matches.models import Match, MatchStatus
        
        # Tworzenie meczu Orły Warszawy vs Smoki Krakowa
        match1 = Match(
            event_id=team_event.id,
            participation_a_id=part_team_a.id,
            participation_b_id=part_team_b.id,
            start_time=team_event.start_date + timedelta(days=1),
            status=MatchStatus.COMPLETED,
            team_a_score=3,
            team_b_score=1,
            details={
                "yellow_cards_a": 1,
                "yellow_cards_b": 2,
                "possession_a_pct": 58,
                "possession_b_pct": 42
            }
        )
        db.add(match1)
        print("  ✔ Dodano mecz: Orły Warszawy 3:1 Smoki Krakowa", flush=True)

        # ============================================================
        # PRZYKŁAD 2: Bieg indywidualny — TimedResult
        # ============================================================
        run_event = Event(
            title="Maraton Wiosenny 2026",
            description="Bieg na 42 km",
            event_type=EventType.INDIVIDUAL,
            status=EventStatus.COMPLETED,
            max_participants=100,
            price=50.0,
            start_date=now - timedelta(days=3),
            duration=360,
            registration_deadline=now - timedelta(days=10),
            is_active=True,
            is_published=True,
            category_id=cat_bieganie.id,
            location_id=location.id,
            owner_id=organizer.id,
        )
        db.add(run_event)
        db.flush()

        part_runner1 = Participation(
            event_id=run_event.id, user_id=players[0].id,
            status=ParticipationStatus.ACCEPTED,
        )
        part_runner2 = Participation(
            event_id=run_event.id, user_id=players[1].id,
            status=ParticipationStatus.ACCEPTED,
        )
        db.add_all([part_runner1, part_runner2])
        db.flush()

        # Wyniki czasowe ze splitami
        db.add(TimedResult(
            participation_id=part_runner1.id,
            total_time_ms=12_600_000,  # 3h 30min
            splits=[
                {"km": 10, "time_ms": 2_940_000},
                {"km": 21, "time_ms": 6_180_000},
                {"km": 30, "time_ms": 9_000_000},
                {"km": 42, "time_ms": 12_600_000},
            ],
        ))
        db.add(TimedResult(
            participation_id=part_runner2.id,
            total_time_ms=14_400_000,  # 4h 00min
            splits=[
                {"km": 10, "time_ms": 3_300_000},
                {"km": 21, "time_ms": 7_020_000},
                {"km": 30, "time_ms": 10_200_000},
                {"km": 42, "time_ms": 14_400_000},
            ],
        ))
        print("  ✔ Dodano wyniki czasowe (maraton)", flush=True)

        # ============================================================
        # PRZYKŁAD 3: Pływanie indywidualne — IndividualScoreResult
        # ============================================================
        swim_event = Event(
            title="Zawody Pływackie 2026",
            description="50m stylem dowolnym",
            event_type=EventType.INDIVIDUAL,
            status=EventStatus.COMPLETED,
            max_participants=50,
            price=30.0,
            start_date=now - timedelta(days=1),
            duration=60,
            registration_deadline=now - timedelta(days=5),
            is_active=True,
            is_published=True,
            category_id=cat_plywanie.id,
            location_id=location.id,
            owner_id=organizer.id,
        )
        db.add(swim_event)
        db.flush()

        part_swimmer1 = Participation(
            event_id=swim_event.id, user_id=players[2].id,
            status=ParticipationStatus.ACCEPTED,
        )
        part_swimmer2 = Participation(
            event_id=swim_event.id, user_id=players[3].id,
            status=ParticipationStatus.ACCEPTED,
        )
        db.add_all([part_swimmer1, part_swimmer2])
        db.flush()

        # Wyniki punktowe/dystansowe
        db.add(IndividualScoreResult(
            participation_id=part_swimmer1.id,
            score=24.87,
            unit="sekundy",
        ))
        db.add(IndividualScoreResult(
            participation_id=part_swimmer2.id,
            score=26.13,
            unit="sekundy",
        ))
        print("  ✔ Dodano wyniki indywidualne (pływanie)", flush=True)

        db.commit()
        print("--- SEEDING SAMPLE RESULTS ZAKOŃCZONE ---", flush=True)

    except Exception as e:
        print(f"Błąd podczas seedowania wyników: {e}", flush=True)
        db.rollback()
        raise
    finally:
        db.close()

