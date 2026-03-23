from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel

class RegisterRequest(BaseModel):
    username: str
    password: str

from app.database import get_db
from app.services.auth import (
    hash_password,
    verify_password,
    create_access_token,
    SECRET_KEY,
    ALGORITHM
)
from app import models

router = APIRouter(prefix="/auth", tags=["Auth"])

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# =========================
# REGISTER
# =========================
@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):

    existing_user = db.query(models.User).filter(
        models.User.username == request.username
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    user = models.User(
        username=request.username,
        hashed_password=hash_password(request.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "User created successfully"}


# =========================
# LOGIN
# =========================
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    user = db.query(models.User).filter(
        models.User.username == form_data.username
    ).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    access_token = create_access_token(
        data={"sub": user.username}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# =========================
# GET CURRENT USER (PROTECT ROUTES)
# =========================
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")

        if username is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(
        models.User.username == username
    ).first()

    if user is None:
        raise credentials_exception

    return user