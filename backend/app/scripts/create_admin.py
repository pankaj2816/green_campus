from app.database import SessionLocal
from app.models import User
from app.services.auth import hash_password

db = SessionLocal()

username = "admin"
password = "admin123"

existing = db.query(User).filter(User.username == username).first()

if existing:
    print("⚠ Admin already exists. Skipping creation.")
else:
    admin = User(
        username=username,
        hashed_password=hash_password(password),
        role="admin"
    )
    db.add(admin)
    db.commit()
    print("✅ Admin user created successfully!")

db.close()