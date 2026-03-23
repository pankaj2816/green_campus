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

print("\n✅ Full system setup completed successfully!")
print("\nLogin credentials:")
print("Username: admin")
print("Password: admin123")