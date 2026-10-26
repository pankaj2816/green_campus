"""Run with: python -m unittest discover -s tests -v."""

import os
import unittest
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from tempfile import TemporaryDirectory
from pathlib import Path
from io import BytesIO
from types import SimpleNamespace
import pandas as pd
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

    def workbook_bytes(self, energy=None, water=None, waste=None):
        output = BytesIO()
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            (energy if energy is not None else pd.DataFrame({"date": ["2025-01-01"], "building": ["Lab"], "energy_kwh": [100]})).to_excel(writer, sheet_name="energy", index=False)
            (water if water is not None else pd.DataFrame({"date": ["2025-01-01"], "building": ["Lab"], "water_kl": [5]})).to_excel(writer, sheet_name="water", index=False)
            if waste is not None:
                waste.to_excel(writer, sheet_name="waste", index=False)
        return output.getvalue()

    def upload(self, headers, content, path="/admin/upload-campus-excel"):
        return self.client.post(path, headers=headers, files={"file": ("test.xlsx", content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")})

    def test_invalid_workbooks_do_not_erase_data(self):
        headers = self.admin_headers()
        self.seed_resources()
        for content in (
            b"not an Excel file",
            self.workbook_bytes(energy=pd.DataFrame(columns=["date", "building", "energy_kwh"])),
            self.workbook_bytes(energy=pd.DataFrame({"date": ["bad-date"], "building": ["Lab"], "energy_kwh": [1]})),
            self.workbook_bytes(energy=pd.DataFrame({"date": ["2025-01-01"], "building": ["Lab"], "energy_kwh": [-1]})),
            self.workbook_bytes(energy=pd.DataFrame({"date": ["2025-01-01"], "building": ["Lab"], "energy_kwh": [float("inf")]})),
        ):
            self.assertEqual(self.upload(headers, content).status_code, 400)
            self.assertEqual(self.client.get("/dashboard/summary", headers=headers).json()["energy"], 1200)

    def test_water_units_are_explicit_and_optional_sheets_can_be_empty(self):
        headers = self.admin_headers()
        waste = pd.DataFrame(columns=["date", "building", "waste_kg"])
        water = pd.DataFrame({"date": ["2025-01-01"], "building": ["Lab"], "water_kl": [20000]})
        self.assertEqual(self.upload(headers, self.workbook_bytes(water=water, waste=waste)).status_code, 200)
        self.assertEqual(self.client.get("/dashboard/summary", headers=headers).json()["water"], 20000)
        water = water.rename(columns={"water_kl": "water_liters"})
        self.assertEqual(self.upload(headers, self.workbook_bytes(water=water)).status_code, 200)
        self.assertEqual(self.client.get("/dashboard/summary", headers=headers).json()["water"], 20)

    def test_import_and_audit_are_atomic(self):
        headers = self.admin_headers()
        self.seed_resources()
        with patch("app.routers.data_import.log_audit_event", side_effect=RuntimeError("audit failure")):
            with self.assertRaises(RuntimeError):
                self.upload(headers, self.workbook_bytes())
        self.assertEqual(self.client.get("/dashboard/summary", headers=headers).json()["energy"], 1200)

    def test_empty_export_keeps_headers_and_timestamps_survive_roundtrip(self):
        headers = self.admin_headers()
        exported = self.client.get("/admin/export-campus-excel", headers=headers)
        workbook = pd.read_excel(BytesIO(exported.content), sheet_name=None)
        self.assertEqual(list(workbook["energy"].columns), ["date", "building", "energy_kwh"])
        self.assertIn("water_kl", workbook["water"].columns)
        energy = pd.DataFrame({"date": ["2025-01-01T12:30:00", "2025-01-01T13:30:00"], "building": ["Lab", "Lab"], "energy_kwh": [5, 6]})
        self.assertEqual(self.upload(headers, self.workbook_bytes(energy=energy)).status_code, 200)
        exported = self.client.get("/admin/export-campus-excel", headers=headers)
        self.assertEqual(self.upload(headers, exported.content).status_code, 200)
        rows = self.client.get("/energy/", headers=headers).json()["records"]
        self.assertTrue(any("12:30:00" in row["timestamp"] for row in rows))

    def test_invalid_settings_cannot_poison_dashboard(self):
        headers = self.admin_headers()
        invalid = [
            {"academic_occupancy_factors": {"13": 1}},
            {"academic_occupancy_factors": {"6": -0.1}},
            {"metric_overrides": {"weights": {"energy": 5}}},
            {"metric_overrides": {"weights": []}},
            {"metric_overrides": {"energy_benchmark": 0}},
            {"metric_overrides": {"energy_cost_per_kwh": "NaN"}},
            {"metric_overrides": {"energy_cost_per_kwh": -1}},
            {"campus_context": {"student_population": 0}},
            {"action_tracker": {"some_action": []}},
            {"metric_overrides": {"unexpected": 1}},
        ]
        for body in invalid:
            with self.subTest(body=body):
                response = self.client.post("/meta/settings", json=body, headers=headers)
                self.assertEqual(response.status_code, 422, response.text)
        self.assertEqual(self.client.get("/dashboard/bundle", headers=headers).json()["errors"], {})

    def test_invalid_dates_and_simulation_ranges_return_validation_errors(self):
        headers = self.admin_headers()
        for path in ("/dashboard/bundle", "/dashboard/summary", "/energy/trend", "/ai/data-quality"):
            self.assertEqual(self.client.get(path, params={"date_from": "2025-02-30"}, headers=headers).status_code, 422)
        for body in ({"energy_reduction_pct": 101}, {"water_reduction_pct": -1}, {"solar_increase_pct": "NaN"}):
            self.assertEqual(self.client.post("/ai/simulate/impact", json=body, headers=headers).status_code, 422)
        self.assertEqual(self.client.post("/energy/", json={"building": " ", "consumption_kwh": 3}, headers=headers).status_code, 422)
        self.assertEqual(self.client.post("/energy/", json={"building": "Lab", "consumption_kwh": -3}, headers=headers).status_code, 422)

    def test_registry_timezone_validation_and_clear(self):
        headers = self.admin_headers()
        self.assertEqual(self.client.get("/operations/devices", headers=headers).json()["devices"], [])
        device = {"name": "Lab meter", "category": "Energy Meter", "building": "Lab", "source_type": "smart_meter", "status": "healthy", "expected_frequency_minutes": 60, "last_sync_at": "2025-01-01T12:00:00+05:30"}
        response = self.client.post("/operations/devices", json={"devices": [device]}, headers=headers)
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json()["devices"][0]["last_sync_at"], "2025-01-01T06:30:00+00:00")
        for bad in ([device, device], [{**device, "status": "typo"}], [{**device, "last_sync_at": "not-a-date"}], [{**device, "id": 999}],[{**device, "last_sync_at": "9999-01-01T00:00:00"}]):
            self.assertEqual(self.client.post("/operations/devices", json={"devices": bad}, headers=headers).status_code, 422)
        self.assertEqual(len(self.client.get("/operations/devices", headers=headers).json()["devices"]), 1)
        cleared = self.client.post("/operations/devices", json={"devices": []}, headers=headers)
        self.assertEqual(cleared.status_code, 200)
        self.assertEqual(self.client.get("/operations/devices", headers=headers).json()["devices"], [])

    def test_forecast_boundaries_and_empty_history(self):
        from app.ai.forecast import _future_points, aggregate_records, build_resource_payload
        factors = {month: 1.0 for month in range(1, 13)}
        winter_records = [SimpleNamespace(timestamp=datetime(2024, 12, 1), value=10), SimpleNamespace(timestamp=datetime(2025, 1, 1), value=20)]
        labels, values, _, _ = aggregate_records(winter_records, "value", "seasonal")
        self.assertEqual((labels, values), (["Winter 2025"], [30]))
        self.assertEqual(_future_points(datetime(2024, 12, 31), "seasonal", 1, factors)[0]["label"], "Summer 2025")
        self.assertEqual(build_resource_payload([], "value", "monthly", 12, factors)["forecast_values"], [])
        solar = build_resource_payload(winter_records, "value", "monthly", 12, {**factors, 6: 0}, occupancy_sensitive=False)
        self.assertTrue(all(value > 0 for value in solar["forecast_values"]))

    def test_saved_occupancy_and_cost_factors_reach_forecasts(self):
        headers = self.admin_headers()
        self.seed_resources()
        self.client.post("/meta/settings", json={"academic_occupancy_factors": {"7": 0.2}, "metric_overrides": {"energy_cost_per_kwh": 10, "emission_factor_kg_per_kwh": 1}}, headers=headers)
        payload = self.client.get("/dashboard/bundle", headers=headers).json()
        self.assertEqual(payload["errors"], {})
        self.assertEqual(payload["seasonal"]["next_month"], "July")
        self.assertEqual(payload["seasonal"]["next_occupancy_factor"], 0.2)
        self.assertEqual(payload["seasonal"]["forecast_period"], "Jul 2025")
        risk = payload["risk"][0]
        self.assertAlmostEqual(risk["projected_cost"], round(risk["projected_net_energy"] * 10, 2))
        self.assertAlmostEqual(risk["projected_carbon"], risk["projected_net_energy"])

    def test_missing_months_and_intraday_waste_types(self):
        headers = self.admin_headers()
        self.seed_resources()
        with self.session_factory() as session:
            session.add(models.WasteData(building="Library", quantity_kg=1, waste_type="organic", timestamp=datetime(2025, 1, 1)))
            session.commit()
        payload = self.client.get("/ai/data-quality", params={"date_from": "2025-01-01", "date_to": "2025-12-31"}, headers=headers).json()
        self.assertEqual(payload["forecast_readiness"], 50)
        energy = next(item for item in payload["resources"] if item["resource"] == "energy")
        waste = next(item for item in payload["resources"] if item["resource"] == "waste")
        self.assertEqual(energy["missing_month_count"], 6)
        self.assertEqual(waste["duplicate_readings"], 0)

    def test_peer_context_and_anomaly_daily_aggregation(self):
        from app.services.insights_service import _resource_totals
        headers = self.admin_headers()
        self.seed_resources()
        bundle = self.client.get("/dashboard/bundle", params={"building": "Library"}, headers=headers).json()
        self.assertIsNotNone(bundle["insights"]["peer_context"])
        with self.session_factory() as session:
            self.assertEqual(_resource_totals(session, None)["energy"], [200] * 6)

    def test_empty_data_is_not_reported_as_perfect_performance(self):
        headers = self.admin_headers()
        bundle = self.client.get("/dashboard/bundle", headers=headers).json()
        self.assertFalse(bundle["summary"]["has_data"])
        self.assertIsNone(bundle["summary"]["green_index"])
        self.assertEqual(bundle["forecast"]["energy"]["forecast_values"], [])
        self.assertEqual(bundle["devices"]["summary"]["total_devices"], 0)
        self.assertIsNone(self.client.get("/compliance/score", headers=headers).json()["green_index"])

    def test_export_labels_are_not_formulas(self):
        import openpyxl
        headers = self.admin_headers()
        with self.session_factory() as session:
            session.add(models.EnergyData(building="=1+1", consumption_kwh=1, timestamp=datetime(2025, 1, 1)))
            session.commit()
        exported = self.client.get("/admin/export-campus-excel", headers=headers)
        workbook = openpyxl.load_workbook(BytesIO(exported.content))
        self.assertEqual(workbook["energy"]["B2"].value, "=1+1")
        self.assertEqual(workbook["energy"]["B2"].data_type, "s")

    def test_reversed_dates_and_maximum_date(self):
        headers = self.admin_headers()
        self.seed_resources()
        normal = self.client.get("/dashboard/summary", headers=headers, params={"date_from": "2025-01-01", "date_to": "2025-06-30"}).json()
        reversed_range = self.client.get("/dashboard/summary", headers=headers, params={"date_from": "2025-06-30", "date_to": "2025-01-01"}).json()
        self.assertEqual(normal["energy"], reversed_range["energy"])
        response = self.client.get("/dashboard/bundle", headers=headers, params={"date_to": "9999-12-31"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["errors"], {})

    def test_device_without_sync_is_not_counted_as_healthy(self):
        from app.services.device_readiness import build_device_readiness_payload
        device = models.DeviceRegistry(name="Unsynced", category="Energy", building="Lab", source_type="smart_meter", status="healthy", expected_frequency_minutes=60)
        result = build_device_readiness_payload([device])
        self.assertEqual(result["summary"]["healthy_devices"], 0)
        self.assertEqual(result["devices"][0]["sync_state"], "missing")

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
