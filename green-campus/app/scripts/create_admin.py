import os
import secrets
from pathlib import Path

from app.database import SessionLocal
from app.models import User
from app.services.auth import hash_password, normalize_username

db = SessionLocal()

username = normalize_username(os.getenv("ADMIN_USERNAME", "admin"))
password = os.getenv("ADMIN_PASSWORD")
generated_password = False

if not password:
    password = secrets.token_urlsafe(12)
    generated_password = True

existing = db.query(User).filter(User.username == username).first()

if existing:
    print("Admin already exists. Skipping creation.")
else:
    admin = User(
        username=username,
        hashed_password=hash_password(password),
        role="admin",
    )
    db.add(admin)
    db.commit()
    if generated_password:
        password_path = Path(__file__).resolve().parents[2] / ".admin_password"
        password_path.write_text(
            f"username={username}\npassword={password}\n",
            encoding="utf-8",
        )
        print(f"Admin user created. Credentials were saved to {password_path.name}.")
    else:
        print("Admin user created from ADMIN_USERNAME and ADMIN_PASSWORD.")

db.close()
