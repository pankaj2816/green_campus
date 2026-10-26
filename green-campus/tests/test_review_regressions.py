"""Run with: python -m unittest discover -s tests -v."""

import os
import unittest
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from tempfile import TemporaryDirectory
from pathlib import Path
from unittest.mock import patch

# Keep all test data and signing configuration separate from deployment data.
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["SECRET_KEY"] = "mgcd-regression-test-key-not-for-deployment"

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool

from app import models
from app.database import Base, get_db
from app.main import app
from app.services.auth import hash_password
from app.routers.auth import register, RegisterRequest
from fastapi import HTTPException


class DashboardRegressionTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
        )
        Base.metadata.create_all(self.engine)
        from sqlalchemy.orm import sessionmaker

        self.session_factory = sessionmaker(bind=self.engine)

        def test_db():
            with self.session_factory() as session:
                yield session

        app.dependency_overrides[get_db] = test_db
        self.client = TestClient(app)

    def tearDown(self):
        self.client.close()
        app.dependency_overrides.clear()
        self.engine.dispose()

    def admin_headers(self):
        response = self.client.post(
            "/auth/register", json={"username": " Admin ", "password": "test-password"}
        )
        self.assertEqual(response.status_code, 200, response.text)
        response = self.client.post(
            "/auth/login", data={"username": "ADMIN", "password": "test-password"}
        )
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json()["role"], "admin")
        return {"Authorization": "Bearer " + response.json()["access_token"]}

    def seed_resources(self):
        with self.session_factory() as session:
            for month in range(1, 7):
                for building in ("Admin Block", "Library"):
                    date = datetime(2025, month, 1)
                    session.add_all([
                        models.EnergyData(building=building, consumption_kwh=100, timestamp=date),
                        models.SolarData(building=building, solar_kwh=20, timestamp=date),
                        models.WaterData(building=building, consumption_kl=5, timestamp=date),
                        models.WasteData(building=building, quantity_kg=2, waste_type="recyclable", timestamp=date),
                    ])
            session.commit()

    def test_bootstrap_login_duplicate_and_closed_registration(self):
        headers = self.admin_headers()
        self.assertEqual(self.client.get("/auth/me", headers=headers).json()["username"], "admin")
        duplicate = self.client.post("/auth/register", json={"username": "ADMIN", "password": "other"})
        self.assertEqual(duplicate.status_code, 400)
        closed = self.client.post("/auth/register", json={"username": "new-user", "password": "other"})
        self.assertEqual(closed.status_code, 403)
        invalid = self.client.post("/auth/login", data={"username": "admin", "password": "incorrect"})
        self.assertEqual(invalid.status_code, 401)

    def test_reads_require_authentication(self):
        for path in ("/dashboard/bundle", "/energy/trend", "/water/", "/waste/", "/solar/", "/ai/forecast/resources", "/ai/risk/energy"):
            with self.subTest(path=path):
                self.assertEqual(self.client.get(path).status_code, 401)

    def test_simultaneous_bootstrap_creates_only_one_admin(self):
        with TemporaryDirectory() as directory:
            engine = create_engine("sqlite:///" + (Path(directory) / "bootstrap.db").as_posix())
            Base.metadata.create_all(engine)
            from sqlalchemy.orm import Session

            def attempt(username):
                with Session(engine) as session:
                    try:
                        register(RegisterRequest(username=username, password="test-password"), session)
                        return 200
                    except HTTPException as error:
                        return error.status_code

            with ThreadPoolExecutor(max_workers=2) as executor:
                results = list(executor.map(attempt, ["first", "second"]))
            self.assertEqual(sorted(results), [200, 403])
            with Session(engine) as session:
                self.assertEqual(session.query(models.User).count(), 1)
            engine.dispose()

    def test_admin_import_export_settings_audit_and_reset(self):
        headers = self.admin_headers()
        workbook = Path(__file__).resolve().parents[2] / "sample_data" / "college_campus_realistic_demo.xlsx"
        content = workbook.read_bytes()
        files = {"file": (workbook.name, content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
        validation = self.client.post("/admin/validate-campus-excel", files=files, headers=headers)
        self.assertEqual(validation.status_code, 200, validation.text)
        self.assertTrue(validation.json()["ready"])
        imported = self.client.post("/admin/upload-campus-excel", files=files, headers=headers)
        self.assertEqual(imported.status_code, 200, imported.text)
        exported = self.client.get("/admin/export-campus-excel", headers=headers)
        self.assertEqual(exported.status_code, 200)
        self.assertTrue(exported.content.startswith(b"PK"))
        updated = self.client.post("/meta/settings", json={"metric_overrides": {"energy_cost_per_kwh": 9}}, headers=headers)
        self.assertEqual(updated.status_code, 200, updated.text)
        summary = self.client.get("/dashboard/summary", headers=headers).json()
        self.assertEqual(summary["energy_cost_per_kwh"], 9)
        events = self.client.get("/meta/audit-trail", headers=headers).json()["records"]
        self.assertGreaterEqual(len(events), 2)
        self.assertEqual(self.client.post("/admin/reset-campus-data", headers=headers).status_code, 200)
        self.assertEqual(self.client.get("/dashboard/summary", headers=headers).json()["energy"], 0)

    def test_viewer_can_read_but_cannot_modify_data(self):
        self.admin_headers()
        with self.session_factory() as session:
            session.add(models.User(username="viewer", hashed_password=hash_password("viewer-password"), role="viewer"))
            session.commit()
        login = self.client.post("/auth/login", data={"username": "viewer", "password": "viewer-password"})
        headers = {"Authorization": "Bearer " + login.json()["access_token"]}
        self.assertEqual(self.client.get("/dashboard/bundle", headers=headers).status_code, 200)
        for path, body in (("/meta/settings", {}), ("/operations/devices", {"devices": []}), ("/admin/reset-campus-data", {})):
            with self.subTest(path=path):
                self.assertEqual(self.client.post(path, json=body, headers=headers).status_code, 403)
        self.assertEqual(self.client.get("/admin/export-campus-excel", headers=headers).status_code, 403)

    def test_bundle_matches_individual_endpoints_and_scope(self):
        headers = self.admin_headers()
        self.seed_resources()
        params = {"building": "Library", "date_from": "2025-04-01", "date_to": "2025-06-30"}
        response = self.client.get("/dashboard/bundle", params=params, headers=headers)
        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertEqual(payload["errors"], {})
        self.assertEqual(payload["summary"], self.client.get("/dashboard/summary", params=params, headers=headers).json())
        self.assertEqual(payload["comparison"], self.client.get("/dashboard/comparison", params=params, headers=headers).json())
        self.assertEqual(payload["summary"]["energy"], 300)
        self.assertEqual(payload["summary"]["waste_by_type"], {"recyclable": 6})
        self.assertEqual(len(payload["trend"]), 3)

    def test_all_forecast_modes_and_consistent_green_index(self):
        headers = self.admin_headers()
        self.seed_resources()
        for mode in ("daily", "monthly", "yearly", "seasonal"):
            payload = self.client.get("/dashboard/bundle", params={"granularity": mode}, headers=headers).json()
            self.assertEqual(payload["errors"], {}, mode)
        summary = self.client.get("/dashboard/summary", headers=headers).json()
        compliance = self.client.get("/compliance/score", headers=headers).json()
        self.assertEqual(summary["green_index"], compliance["green_index"])
        self.assertAlmostEqual(summary["carbon"], summary["net_energy"] * 0.82)

    def test_section_failure_does_not_hide_later_sections(self):
        headers = self.admin_headers()
        self.seed_resources()
        with patch("app.services.dashboard_bundle.energy_trend", side_effect=RuntimeError("test failure")):
            payload = self.client.get("/dashboard/bundle", headers=headers).json()
        self.assertEqual(set(payload["errors"]), {"trend"})
        self.assertIsNone(payload["trend"])
        self.assertIsNotNone(payload["forecast"])
        self.assertIsNotNone(payload["audit"])


if __name__ == "__main__":
    unittest.main()
