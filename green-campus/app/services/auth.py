import logging
import os
import secrets
from datetime import datetime, timedelta
from pathlib import Path

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

logger = logging.getLogger(__name__)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
_LOCAL_SECRET_PATH = Path(__file__).resolve().parents[2] / ".local_secret"

pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def _resolve_secret_key() -> str:
    configured = (os.getenv("SECRET_KEY") or "").strip()
    if configured and configured != "supersecretkey":
        return configured

    if os.getenv("RENDER"):
        raise RuntimeError("Set SECRET_KEY in the environment before starting the hosted API.")

    if _LOCAL_SECRET_PATH.exists():
        existing = _LOCAL_SECRET_PATH.read_text(encoding="utf-8").strip()
        if existing:
            return existing

    generated = secrets.token_urlsafe(48)
    _LOCAL_SECRET_PATH.write_text(generated, encoding="utf-8")
    logger.warning(
        "SECRET_KEY is not set. A local signing key was written to %s.",
        _LOCAL_SECRET_PATH.name,
    )
    return generated


SECRET_KEY = _resolve_secret_key()


def normalize_username(username: str) -> str:
    return (username or "").strip().lower()


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        return username
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
