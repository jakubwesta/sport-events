# Sport Events Management Platform 

A comprehensive full-stack platform designed to manage sports events, handle team formations, track match results, and provide interactive location mapping.

## Features

- **Event Management**: Organizers can create and manage various sports events (both individual and team-based), set registration deadlines, and define event categories.
- **Team & Roster Management**: Participants can form teams, invite members, and register for team-based tournaments.
- **Complex Match & Results Tracking**:
  - **Team Matches (H2H)**: Track team-vs-team games with goals, scores, and advanced match statistics.
  - **Individual & Timed Events**: Support for marathons and sprint events where participants are tracked by time, splits, or points.
  - **Polymorphic Database Architecture**: Flexible database design allowing seamless handling of diverse result types.
- **Interactive Maps**: View event locations precisely using integrated interactive maps (Leaflet).
- **Role-Based Access Control**: Secure endpoints differentiating regular participants from event organizers.

## Tech Stack

### Backend
- **Python 3.11+**
- **FastAPI**: High-performance REST framework.
- **PostgreSQL**: Robust relational database.
- **SQLAlchemy & Alembic**: Advanced ORM features (including Single-Table Inheritance) and database migrations.
- **Pydantic**: Data validation and serialization.

### Frontend
- **React 19 & TypeScript**: Modern, type-safe UI development.
- **Vite**: Blazing fast frontend tooling.
- **Tailwind CSS & Shadcn UI**: Rapid and beautiful styling.
- **Zustand**: Lightweight global state management.
- **React Leaflet**: Interactive map rendering.

### Infrastructure
- **Docker & Docker Compose**: Fully containerized environment for seamless local development and deployment.

## Project Structure

```text
sport-events/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── modules/          # Business logic (auth, events, matches, results, teams, etc.)
│   │   ├── main.py           # Application entry point
│   │   └── seed.py           # Database seeder with sample data
│   ├── alembic/              # Database migration scripts
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React Application
│   ├── src/                  # React components, pages, stores, and utilities
│   ├── package.json          # Node dependencies
│   └── vite.config.ts        # Vite configuration
└── docker-compose.yml        # Multi-container orchestration setup
```

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.

### Installation & Running

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd sport-events
   ```

2. **Set up environment variables:**
   - In the `backend/` directory, copy `.env.example` to `.env` and fill in the required values (Database URL, Secret Key, etc.).
   - In the `frontend/` directory, copy `.env.example` to `.env` (API URL, Map configuration).

3. **Start the containers:**
   ```bash
   docker compose up -d --build
   ```

4. **Run Database Migrations:**
   Once the containers are up, apply the database schema using Alembic:
   ```bash
   docker compose exec backend alembic upgrade head
   ```

5. **(Optional) Seed the Database:**
   To populate the platform with sample users, events, teams, and matches:
   ```bash
   docker compose exec backend python -m app.seed
   ```

### Accessing the App
- **Frontend App**: `http://localhost:5173` (or the port defined in docker-compose)
- **Backend API Docs (Swagger)**: `http://localhost:8000/docs`



