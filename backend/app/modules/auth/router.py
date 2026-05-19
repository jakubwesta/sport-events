from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.users.models import User
from app.modules.users.schemas import UserResponse, UserRole
from app.modules.auth.schemas import RegisterRequest, LoginRequest, TokenResponse
from app.modules.auth.utils import hash_password, verify_password, create_access_token
from app.modules.auth.dependencies import get_current_user

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Użytkownik z tym adresem email już istnieje",
        )

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        role=UserRole.USER,
        first_name=data.first_name,
        last_name=data.last_name,
        birth_year=data.birth_year,
        phone_number=data.phone_number,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(
    data: OAuth2PasswordRequestForm = Depends(),  
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == data.username).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nieprawidłowy email lub hasło",
        )

    token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    
    return TokenResponse(access_token=token, token_type="bearer")


