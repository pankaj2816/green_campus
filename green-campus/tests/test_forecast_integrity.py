"""Forecast and missing-resource regressions independent of external data files."""

import unittest
from datetime import datetime, timedelta
from types import SimpleNamespace

import test_review_regressions as fixtures
from app.ai.forecast import build_resource_payload
from app.services.green_index import calculate_green_index
from app.services.metrics_config import get_runtime_constants


class ForecastIntegrityTests(unittest.TestCase):
    def rows(self, values, start=datetime(2025, 1, 1)):
        return [SimpleNamespace(timestamp=start + timedelta(days=day), value=value)
                for day, value in enumerate(values)]

    def forecast(self, rows, factors=None, mode="daily", periods=14):
        return build_resource_payload(rows, "value", mode, periods, factors or {month: 1 for month in range(1, 13)})

    def test_exact_weekly_pattern_and_long_horizon(self):
        values = [10, 20, 0, 40, 50, 60, 70] * 12
        result = self.forecast(self.rows(values))
        self.assertEqual(result["forecast_values"], values[:14])
        self.assertFalse(result["occupancy_adjustment_applied"])
        self.assertIsNone(result["nominal_coverage_percent"])
        self.assertGreater(result["spread_backtest_cases"], 0)

    def test_measured_zero_is_not_replaced_by_global_mean(self):
        result = self.forecast(self.rows([100] * 7 + [0] * 7), periods=7)
        self.assertEqual(result["forecast_values"], [0] * 7)

    def test_gaps_use_calendar_cycles_not_array_offsets(self):
        rows = self.rows([10, 20, 30, 40, 50, 60, 70] * 4)
        rows = [row for row in rows if row.timestamp != datetime(2025, 1, 22)]
        result = self.forecast(rows, periods=1)
        self.assertEqual(result["forecast_values"], [10])

    def test_unsorted_input_and_zero_activity_factors(self):
        rows = self.rows([5] * 28)
        self.assertEqual(self.forecast(rows), self.forecast(list(reversed(rows))))
        zero = self.forecast(rows, {month: 0 for month in range(1, 13)})
        self.assertEqual(zero["forecast_values"], [5] * 14)
        self.assertEqual(zero["occupancy_scenario_values"], [5] * 14)

    def test_assumptions_change_scenario_not_baseline(self):
        rows = self.rows([100] * 28)
        factors = {month: 1 for month in range(1, 13)}
        changed = self.forecast(rows, {**factors, 2: .2})
        baseline = self.forecast(rows, factors)
        self.assertEqual(changed["forecast_values"], baseline["forecast_values"])
        self.assertNotEqual(changed["occupancy_scenario_values"], baseline["occupancy_scenario_values"])

    def test_prefix_forecast_does_not_mutate_or_read_future(self):
        rows = self.rows([100] * 60 + [99999] * 7)
        before = self.forecast(rows[:60])
        rows[-1].value = 1e9
        self.assertEqual(before, self.forecast(rows[:60]))
        self.assertEqual(before["forecast_values"], [100] * 14)

    def test_single_record_empty_and_year_rollover(self):
        self.assertEqual(self.forecast([])["forecast_values"], [])
        result = self.forecast(self.rows([0], datetime(2025, 12, 31)))
        self.assertEqual(result["forecast_labels"][0], "01 Jan")
        self.assertEqual(result["forecast_values"], [0] * 14)
        self.assertEqual(result["spread_type"], "historical_variation_only")

    def test_monthly_previous_year_reference(self):
        rows = [SimpleNamespace(timestamp=datetime(year, month, 1), value=month * 10)
                for year in (2024, 2025) for month in range(1, 13)]
        result = self.forecast(rows, mode="monthly", periods=12)
        self.assertEqual(result["forecast_values"], [month * 10 for month in range(1, 13)])

    def test_missing_waste_is_not_zero_waste(self):
        constants = get_runtime_constants()
        absent = calculate_green_index(100000, 20000, None, constants)
        measured_zero = calculate_green_index(100000, 20000, 0, constants)
        self.assertEqual(absent["green_index"], 0)
        self.assertEqual(absent["assessment"], "partial")
        self.assertIsNone(absent["waste_score"])
        self.assertEqual(measured_zero["green_index"], 20)
        self.assertEqual(measured_zero["assessment"], "complete")
        self.assertIsNone(calculate_green_index(None, None, None, constants)["green_index"])


class MissingResourceApiTests(unittest.TestCase):
    setUp = fixtures.DashboardRegressionTests.setUp
    tearDown = fixtures.DashboardRegressionTests.tearDown
    admin_headers = fixtures.DashboardRegressionTests.admin_headers
    workbook_bytes = fixtures.DashboardRegressionTests.workbook_bytes
    upload = fixtures.DashboardRegressionTests.upload

    def test_comparison_marks_missing_and_different_resource_sets(self):
        from app import models
        headers = self.admin_headers()
        with self.session_factory() as session:
            for month in (1, 2):
                session.add_all([
                    models.EnergyData(building="Lab", consumption_kwh=100, timestamp=datetime(2025, month, 15)),
                    models.WaterData(building="Lab", consumption_kl=5, timestamp=datetime(2025, month, 15)),
                ])
            session.add(models.WasteData(building="Lab", quantity_kg=2, waste_type="general", timestamp=datetime(2025, 1, 15)))
            session.commit()
        response = self.client.get("/dashboard/comparison", headers=headers,
                                   params={"date_from": "2025-02-01", "date_to": "2025-02-28"})
        self.assertEqual(response.status_code, 200, response.text)
        delta = response.json()["delta"]
        self.assertTrue(delta["net_energy"]["comparable"])
        self.assertFalse(delta["waste"]["comparable"])
        self.assertFalse(delta["green_index"]["comparable"])
        self.assertIn("Not comparable", delta["green_index"]["comparison_note"])

    def test_missing_waste_consistent_in_summary_compliance_simulation(self):
        headers = self.admin_headers()
        self.assertEqual(self.upload(headers, self.workbook_bytes()).status_code, 200)
        summary = self.client.get("/dashboard/summary", headers=headers).json()
        self.assertFalse(summary["resource_availability"]["waste"])
        self.assertEqual(summary["green_index_details"]["assessment"], "partial")
        compliance = self.client.get("/compliance/score", headers=headers).json()
        scenario = self.client.post("/ai/simulate/impact", json={}, headers=headers).json()
        self.assertEqual(summary["green_index"], compliance["green_index"])
        self.assertEqual(summary["green_index"], scenario["baseline"]["green_index"])
        self.assertEqual(scenario["impact"]["green_index_gain"], 0)
        self.client.post("/admin/reset-campus-data", headers=headers)
        empty = self.client.post("/ai/simulate/impact", json={}, headers=headers)
        self.assertEqual(empty.status_code, 200, empty.text)
        self.assertIsNone(empty.json()["impact"]["green_index_gain"])
