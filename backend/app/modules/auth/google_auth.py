import secrets
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.modules.auth.utils import hash_password
from app.modules.users.models import User, UserRole


def upsert_user_from_google(db: Session, payload: dict[str, Any]) -> User:
    email = payload.get("email")
    if not email or not payload.get("email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account must have a verified email",
        )

    google_sub = payload["sub"]
    user = (
        db.query(User)
        .filter(or_(User.email == email, User.google_sub == google_sub))
        .first()
    )

    if user:
        if user.google_sub and user.google_sub != google_sub:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already linked to another Google account",
            )
        if not user.google_sub:
            user.google_sub = google_sub
            db.commit()
        return user

    given = (payload.get("given_name") or "").strip()
    family = (payload.get("family_name") or "").strip()
    full_name = (payload.get("name") or "").strip()
    if not given and full_name:
        parts = full_name.split(maxsplit=1)
        given = parts[0]
        family = parts[1] if len(parts) > 1 else ""

    user = User(
        email=email,
        google_sub=google_sub,
        hashed_password=hash_password(secrets.token_urlsafe(32)),
        role=UserRole.USER,
        first_name=given or "User",
        last_name=family or "",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
