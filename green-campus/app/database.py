from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = (os.getenv("DATABASE_URL") or "").strip()
if not DATABASE_URL:
    if os.getenv("RENDER"):
        raise RuntimeError("Set DATABASE_URL before starting the hosted API.")
    DATABASE_URL = "sqlite:///./green_campus_local.db"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = "postgresql://" + DATABASE_URL[len("postgres://"):]

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {"connect_timeout": 10}
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True, pool_recycle=300)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
