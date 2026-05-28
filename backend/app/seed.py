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
from app.modules.results.models import IndividualScoreResult, TimedResult
from app.modules.matches.models import Match, MatchStatus

load_dotenv()

# ─────────────────────────────────────────────────────────────────────────────
# SEED DATA — edit these lists to add/change seeded content
# ─────────────────────────────────────────────────────────────────────────────

SEED_USERS = [
    {
        "email": "admin@demo.com",
        "password": "demo1234",
        "role": "ADMIN",
        "first_name": "Admin",
        "last_name": "User",
    },
    {
        "email": "organizer@demo.com",
        "password": "demo1234",
        "role": "ORGANIZER",
        "first_name": "Alex",
        "last_name": "Morgan",
        "birth_year": 1985,
        "phone_number": "600100200",
    },
    {
        "email": "jan.kowalski@demo.com",
        "password": "demo1234",
        "role": "USER",
        "first_name": "Jan",
        "last_name": "Kowalski",
        "birth_year": 1992,
        "phone_number": "601100201",
    },
    {
        "email": "anna.nowak@demo.com",
        "password": "demo1234",
        "role": "USER",
        "first_name": "Anna",
        "last_name": "Nowak",
        "birth_year": 1995,
        "phone_number": "602100202",
    },
    {
        "email": "piotr.wisniewski@demo.com",
        "password": "demo1234",
        "role": "USER",
        "first_name": "Piotr",
        "last_name": "Wiśniewski",
        "birth_year": 1990,
        "phone_number": "603100203",
    },
    {
        "email": "maria.zielinska@demo.com",
        "password": "demo1234",
        "role": "USER",
        "first_name": "Maria",
        "last_name": "Zielińska",
        "birth_year": 1998,
        "phone_number": "604100204",
    },
    {
        "email": "tomasz.wrobel@demo.com",
        "password": "demo1234",
        "role": "USER",
        "first_name": "Tomasz",
        "last_name": "Wróbel",
        "birth_year": 1988,
        "phone_number": "605100205",
    },
    {
        "email": "karolina.duda@demo.com",
        "password": "demo1234",
        "role": "USER",
        "first_name": "Karolina",
        "last_name": "Duda",
        "birth_year": 2000,
        "phone_number": "606100206",
    },
]

# Locations — one per city used in events below
SEED_LOCATIONS = [
    {
        "name": "National Stadium",
        "address": "al. Ks. J. Poniatowskiego 1",
        "city": "Warszawa",
        "latitude": 52.2396,
        "longitude": 21.0447,
    },
    {
        "name": "Tauron Arena",
        "address": "ul. Stanisława Lema 7",
        "city": "Kraków",
        "latitude": 50.0682,
        "longitude": 20.0172,
    },
    {
        "name": "Atlas Arena",
        "address": "al. Unii Lubelskiej 2",
        "city": "Łódź",
        "latitude": 51.7769,
        "longitude": 19.4337,
    },
    {
        "name": "Tarczyński Arena",
        "address": "ul. Oporowska 62",
        "city": "Wrocław",
        "latitude": 51.1427,
        "longitude": 16.9416,
    },
    {
        "name": "Poznań Stadium",
        "address": "ul. Bułgarska 17",
        "city": "Poznań",
        "latitude": 52.3860,
        "longitude": 16.8979,
    },
]

# Events — owner_idx and player_idxs refer to indices in SEED_USERS above.
# start_days_ago / deadline_days_ago are relative to today (negative = future).
SEED_EVENTS = [
    # ── 1. Completed team football tournament ────────────────────────────────
    {
        "title": "Spring Football Cup 2026",
        "description": "A team tournament to kick off the season. Four teams battle for the trophy.",
        "event_type": "TEAM",
        "status": "COMPLETED",
        "category_slug": "pilka-nozna",
        "location_idx": 0,       # Warszawa
        "owner_idx": 1,          # organizer
        "max_participants": 8,
        "min_team_size": 2,
        "max_team_size": 5,
        "price": 0.0,
        "start_days_ago": 7,
        "duration": 120,
        "deadline_days_ago": 14,
        # Teams: list of {name, owner_idx, member_idxs}
        "teams": [
            {"name": "Warsaw Eagles",  "owner_idx": 2, "member_idxs": [2, 3]},
            {"name": "Kraków Dragons", "owner_idx": 4, "member_idxs": [4, 5]},
        ],
        # Matches between team indices (0-based into the teams list above)
        "matches": [
            {"team_a": 0, "team_b": 1, "score_a": 3, "score_b": 1, "status": "COMPLETED"},
        ],
    },

    # ── 2. Completed individual marathon ────────────────────────────────────
    {
        "title": "Spring Marathon 2026",
        "description": "42 km run through the historic city centre. Open to all fitness levels.",
        "event_type": "INDIVIDUAL",
        "status": "COMPLETED",
        "category_slug": "bieganie",
        "location_idx": 1,       # Kraków
        "owner_idx": 1,
        "max_participants": 100,
        "price": 50.0,
        "start_days_ago": 3,
        "duration": 360,
        "deadline_days_ago": 10,
        # Participants: list of user indices from SEED_USERS
        "participants": [2, 3],
        # Timed results: {user_idx, total_time_ms, place}
        "timed_results": [
            {"user_idx": 2, "total_time_ms": 12_600_000, "place": 1},  # 3h 30min
            {"user_idx": 3, "total_time_ms": 14_400_000, "place": 2},  # 4h 00min
        ],
    },

    # ── 3. Completed swimming — individual score ─────────────────────────────
    {
        "title": "Swimming Championships 2026",
        "description": "50 m freestyle sprint. Fastest time wins.",
        "event_type": "INDIVIDUAL",
        "status": "COMPLETED",
        "category_slug": "plywanie",
        "location_idx": 2,       # Łódź
        "owner_idx": 1,
        "max_participants": 50,
        "price": 30.0,
        "start_days_ago": 1,
        "duration": 60,
        "deadline_days_ago": 5,
        "participants": [4, 5],
        # Individual score results: {user_idx, score, unit, place}
        "score_results": [
            {"user_idx": 4, "score": 24.87, "unit": "s", "place": 1},
            {"user_idx": 5, "score": 26.13, "unit": "s", "place": 2},
        ],
    },

    # ── 4. Upcoming running event (open registration) ────────────────────────
    {
        "title": "Summer 10K Run",
        "description": "A relaxed 10 km run around the city park. Perfect for beginners.",
        "event_type": "INDIVIDUAL",
        "status": "REGISTRATION",
        "category_slug": "bieganie",
        "location_idx": 3,       # Wrocław
        "owner_idx": 1,
        "max_participants": 200,
        "price": 20.0,
        "start_days_ago": -14,   # 14 days in the future
        "duration": 90,
        "deadline_days_ago": -7,
        "participants": [6, 7],
    },

    # ── 5. Upcoming cycling event (planning) ─────────────────────────────────
    {
        "title": "City Cycling Gran Fondo",
        "description": "80 km scenic route through the city and countryside.",
        "event_type": "INDIVIDUAL",
        "status": "PLANNING",
        "category_slug": "kolarstwo",
        "location_idx": 4,       # Poznań
        "owner_idx": 1,
        "max_participants": 150,
        "price": 40.0,
        "start_days_ago": -30,
        "duration": 240,
        "deadline_days_ago": -21,
    },

    # ── 6. Registration open team volleyball ─────────────────────────────────
    {
        "title": "Volleyball Open Cup 2026",
        "description": "Team volleyball tournament — register your team now. Six-player sides.",
        "event_type": "TEAM",
        "status": "REGISTRATION",
        "category_slug": "inne",
        "location_idx": 2,       # Łódź
        "owner_idx": 1,
        "max_participants": 16,
        "min_team_size": 5,
        "max_team_size": 8,
        "price": 0.0,
        "start_days_ago": -21,   # 3 weeks in the future
        "duration": 180,
        "deadline_days_ago": -7,
        # One team already registered (pending payment)
        "teams": [
            {"name": "Smash & Serve", "owner_idx": 6, "member_idxs": [6, 7]},
        ],
    },

    # ── 7. In-progress team basketball ───────────────────────────────────────
    {
        "title": "3x3 Basketball League",
        "description": "Street basketball league — short games, fast pace.",
        "event_type": "TEAM",
        "status": "IN_PROGRESS",
        "category_slug": "koszykowka",
        "location_idx": 0,       # Warszawa
        "owner_idx": 1,
        "max_participants": 16,
        "min_team_size": 3,
        "max_team_size": 4,
        "price": 0.0,
        "start_days_ago": 2,
        "duration": 60,
        "deadline_days_ago": 7,
        "teams": [
            {"name": "Hoopers",    "owner_idx": 6, "member_idxs": [6, 7]},
            {"name": "Ballers",    "owner_idx": 2, "member_idxs": [2, 4]},
        ],
        "matches": [
            {"team_a": 0, "team_b": 1, "score_a": 21, "score_b": 18, "status": "COMPLETED"},
        ],
    },
]

# ─────────────────────────────────────────────────────────────────────────────


def seed_admin():
    print("--- SEEDING ADMIN ---", flush=True)
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")

    if not admin_email or not admin_password:
        print("ADMIN_EMAIL / ADMIN_PASSWORD not set in .env — skipping admin seed", flush=True)
        return

    db: Session = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == admin_email).first()
        if existing:
            print(f"Admin already exists: {admin_email}", flush=True)
            return

        db.add(User(
            email=admin_email,
            hashed_password=hash_password(admin_password),
            role=UserRole.ADMIN,
        ))
        db.commit()
        print(f"Created admin: {admin_email}", flush=True)
    finally:
        db.close()


def seed_categories():
    initial_categories = [
        {"name": "Football",    "slug": "pilka-nozna"},
        {"name": "Basketball",  "slug": "koszykowka"},
        {"name": "Running",     "slug": "bieganie"},
        {"name": "Swimming",    "slug": "plywanie"},
        {"name": "Cycling",     "slug": "kolarstwo"},
        {"name": "Triathlon",   "slug": "triathlon"},
        {"name": "Other",       "slug": "inne"},
    ]

    db = SessionLocal()
    try:
        for cat_data in initial_categories:
            existing = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
            if existing:
                if existing.name != cat_data["name"]:
                    existing.name = cat_data["name"]
                    print(f"Updated category: {cat_data['name']}", flush=True)
            else:
                db.add(Category(**cat_data))
                print(f"Added category: {cat_data['name']}", flush=True)

        db.commit()
        print("Category seeding complete.", flush=True)
    except Exception as e:
        print(f"Error seeding categories: {e}", flush=True)
        db.rollback()
    finally:
        db.close()


def seed_sample_data():
    """
    Creates demo users, locations, events, teams, participations and results
    from the SEED_USERS / SEED_LOCATIONS / SEED_EVENTS lists above.

    Guard: skips entirely if any of the demo user emails already exist.
    """
    print("--- SEEDING SAMPLE DATA ---", flush=True)

    db: Session = SessionLocal()
    try:
        # ── Guard: already seeded? ───────────────────────────────────────────
        first_demo_email = SEED_USERS[0]["email"]
        if db.query(User).filter(User.email == first_demo_email).first():
            print("Demo data already exists — skipping.", flush=True)
            return

        now = datetime.utcnow()

        # ── 1. Users ─────────────────────────────────────────────────────────
        role_map = {"ADMIN": UserRole.ADMIN, "ORGANIZER": UserRole.ORGANIZER, "USER": UserRole.USER}
        users: list[User] = []
        for u in SEED_USERS:
            user = User(
                email=u["email"],
                hashed_password=hash_password(u["password"]),
                role=role_map[u["role"]],
                first_name=u.get("first_name"),
                last_name=u.get("last_name"),
                birth_year=u.get("birth_year"),
                phone_number=u.get("phone_number"),
            )
            db.add(user)
            users.append(user)
        db.flush()
        print(f"  Created {len(users)} users", flush=True)

        # ── 2. Locations ──────────────────────────────────────────────────────
        locations: list[Location] = []
        for loc in SEED_LOCATIONS:
            existing = db.query(Location).filter(
                Location.latitude == loc["latitude"],
                Location.longitude == loc["longitude"],
            ).first()
            if existing:
                locations.append(existing)
            else:
                location = Location(**loc)
                db.add(location)
                locations.append(location)
        db.flush()
        print(f"  Created/found {len(locations)} locations", flush=True)

        # ── 3. Events ─────────────────────────────────────────────────────────
        type_map   = {"INDIVIDUAL": EventType.INDIVIDUAL, "TEAM": EventType.TEAM}
        status_map = {
            "PLANNING": EventStatus.PLANNING, "REGISTRATION": EventStatus.REGISTRATION,
            "IN_PROGRESS": EventStatus.IN_PROGRESS, "COMPLETED": EventStatus.COMPLETED,
            "CANCELLED": EventStatus.CANCELLED, "POSTPONED": EventStatus.POSTPONED,
        }
        match_status_map = {
            "SCHEDULED": MatchStatus.SCHEDULED, "IN_PROGRESS": MatchStatus.IN_PROGRESS,
            "COMPLETED": MatchStatus.COMPLETED, "CANCELLED": MatchStatus.CANCELLED,
        }

        for ev in SEED_EVENTS:
            category = db.query(Category).filter(Category.slug == ev["category_slug"]).first()
            if not category:
                print(f"  WARNING: category '{ev['category_slug']}' not found — skipping event '{ev['title']}'", flush=True)
                continue

            start_date = now - timedelta(days=ev.get("start_days_ago", 0))
            deadline   = now - timedelta(days=ev.get("deadline_days_ago", 0))

            event = Event(
                title=ev["title"],
                description=ev.get("description", ""),
                event_type=type_map[ev["event_type"]],
                status=status_map[ev["status"]],
                category_id=category.id,
                location_id=locations[ev["location_idx"]].id if "location_idx" in ev else None,
                owner_id=users[ev["owner_idx"]].id,
                max_participants=ev.get("max_participants"),
                min_team_size=ev.get("min_team_size", 1),
                max_team_size=ev.get("max_team_size", 1),
                price=ev.get("price", 0.0),
                start_date=start_date,
                duration=ev.get("duration"),
                registration_deadline=deadline,
                is_active=True,
                is_published=True,
            )
            db.add(event)
            db.flush()

            # ── Teams (TEAM events) ───────────────────────────────────────────
            team_participations: list[Participation] = []

            if ev.get("teams"):
                for team_def in ev["teams"]:
                    existing_team = db.query(Team).filter(Team.name == team_def["name"]).first()
                    if existing_team:
                        team = existing_team
                    else:
                        team = Team(name=team_def["name"], owner_id=users[team_def["owner_idx"]].id)
                        db.add(team)
                    db.flush()

                    for member_idx in team_def.get("member_idxs", []):
                        db.add(TeamMember(
                            team_id=team.id,
                            user_id=users[member_idx].id,
                            status=TeamMemberStatus.ACCEPTED,
                        ))

                    participation = Participation(
                        event_id=event.id,
                        team_id=team.id,
                        status=ParticipationStatus.ACCEPTED,
                    )
                    db.add(participation)
                    team_participations.append(participation)
                db.flush()

                # ── Matches ───────────────────────────────────────────────────
                for m in ev.get("matches", []):
                    db.add(Match(
                        event_id=event.id,
                        participation_a_id=team_participations[m["team_a"]].id,
                        participation_b_id=team_participations[m["team_b"]].id,
                        status=match_status_map[m.get("status", "COMPLETED")],
                        team_a_score=m.get("score_a"),
                        team_b_score=m.get("score_b"),
                        start_time=start_date,
                    ))

            # ── Individual participants ───────────────────────────────────────
            user_participations: dict[int, Participation] = {}

            for user_idx in ev.get("participants", []):
                participation = Participation(
                    event_id=event.id,
                    user_id=users[user_idx].id,
                    status=ParticipationStatus.ACCEPTED,
                )
                db.add(participation)
                user_participations[user_idx] = participation
            db.flush()

            # ── Timed results ─────────────────────────────────────────────────
            for r in ev.get("timed_results", []):
                part = user_participations.get(r["user_idx"])
                if part:
                    db.add(TimedResult(
                        participation_id=part.id,
                        total_time_ms=r["total_time_ms"],
                        place=r.get("place"),
                    ))

            # ── Individual score results ───────────────────────────────────────
            for r in ev.get("score_results", []):
                part = user_participations.get(r["user_idx"])
                if part:
                    db.add(IndividualScoreResult(
                        participation_id=part.id,
                        score=r["score"],
                        unit=r["unit"],
                        place=r.get("place"),
                    ))

            db.flush()
            print(f"  Created event: {ev['title']}", flush=True)

        db.commit()
        print("--- SAMPLE DATA SEEDING COMPLETE ---", flush=True)

    except Exception as e:
        print(f"Error seeding sample data: {e}", flush=True)
        db.rollback()
        raise
    finally:
        db.close()
