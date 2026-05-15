from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.users.models import User, UserRole
from app.modules.auth.utils import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nieprawidłowy lub wygasły token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: int | None = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nieprawidłowy token — brak identyfikatora użytkownika",
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Użytkownik nie istnieje",
        )

    return user


def require_role(*roles: UserRole):
    """Dependency factory — zwraca dependency, które sprawdza
    czy zalogowany user ma jedną z podanych ról.

    Użycie:
        @router.get("/admin-only", dependencies=[Depends(require_role(UserRole.ADMIN))])
        def admin_endpoint(): ...

    Albo jako parametr:
        def endpoint(user: User = Depends(require_role(UserRole.ADMIN, UserRole.ORGANIZER))):
            ...
    """

    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Brak uprawnień do tego zasobu",
            )
        return current_user

    return role_checker


require_admin = require_role(UserRole.ADMIN)
require_organizer = require_role(UserRole.ADMIN, UserRole.ORGANIZER)
