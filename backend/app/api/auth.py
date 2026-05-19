from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, HTTPException, status
from jose import jwt
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from typing import Optional

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = "dev-secret-change-me"
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

_fake_users: dict[str, dict[str, str]] = {}


class AuthPayload(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: EmailStr


class UserProfile(BaseModel):
    email: EmailStr
    name: Optional[str] = None


def _create_access_token(email: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {"sub": email, "exp": expires_at}
    return jwt.encode(token_data, JWT_SECRET, algorithm=JWT_ALGORITHM)


@router.post("/register", response_model=AuthResponse)
def register_user(payload: AuthPayload) -> AuthResponse:
    if payload.email in _fake_users:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")

    _fake_users[payload.email] = {
        "email": payload.email,
        "name": payload.name or payload.email.split("@")[0],
        "password_hash": pwd_context.hash(payload.password),
    }
    return AuthResponse(access_token=_create_access_token(payload.email), email=payload.email)


@router.post("/login", response_model=AuthResponse)
def login_user(payload: AuthPayload) -> AuthResponse:
    user = _fake_users.get(payload.email)
    if not user or not pwd_context.verify(payload.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    return AuthResponse(access_token=_create_access_token(payload.email), email=payload.email)


@router.get("/me", response_model=UserProfile)
def get_current_user_profile(email: str) -> UserProfile:
    user = _fake_users.get(email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserProfile(email=user["email"], name=user.get("name"))
