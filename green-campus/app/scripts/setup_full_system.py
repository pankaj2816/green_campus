import os
import subprocess

print("🚀 Starting Full System Setup...\n")

# 1️⃣ Recreate Database
print("1️⃣ Recreating database...")
subprocess.run(["python", "-m", "app.scripts.recreate_database"])

# 2️⃣ Seed Campus Data
print("\n2️⃣ Seeding campus historical data...")
subprocess.run(["python", "-m", "app.scripts.seed_full_campus"])

# 3️⃣ Create Admin User
print("\n3️⃣ Creating admin user...")
subprocess.run(["python", "-m", "app.scripts.create_admin"])

print("\nFull system setup completed.")
print("If a new administrator was created, the credentials are in green-campus/.admin_password.")