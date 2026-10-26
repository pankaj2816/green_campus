import logging
import os
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path

from jose import jwt
from passlib.context import CryptContext

logger = logging.getLogger(__name__)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
_LOCAL_SECRET_PATH = Path(__file__).resolve().parents[2] / ".local_secret"

pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")


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
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except (TypeError, ValueError):
        return False


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
