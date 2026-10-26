"""Isolated in-memory tests for cadence-aware data quality reporting."""

import os
import unittest
from datetime import datetime, timedelta

os.environ["DATABASE_URL"] = "sqlite://"

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app import models
from app.database import Base
from app.services.data_quality import build_data_quality_report


class DataQualityCoverageTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://")
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)

    def tearDown(self):
        self.db.close()
        self.engine.dispose()

    def seed(self, timestamps, building="Lab", resources=("energy", "water"), value=10):
        configs = {
            "energy": (models.EnergyData, "consumption_kwh"),
            "water": (models.WaterData, "consumption_kl"),
            "solar": (models.SolarData, "solar_kwh"),
            "waste": (models.WasteData, "quantity_kg"),
        }
        for resource in resources:
            model, attr = configs[resource]
            self.db.add_all(model(building=building, timestamp=stamp, **{attr: value}) for stamp in timestamps)
        self.db.commit()

    def report(self, **kwargs):
        return build_data_quality_report(self.db, **kwargs)

    def resource(self, report, name="energy"):
        return next(item for item in report["resources"] if item["resource"] == name)

    def test_monthly_records_are_not_mistaken_for_missing_daily_readings(self):
        self.seed([datetime(2025, month, 1) for month in range(1, 13)])
        report = self.report()
        item = self.resource(report)
        self.assertEqual(item["cadence"], "monthly")
        self.assertEqual(item["expected_intervals"], 12)
        self.assertEqual(item["observed_intervals"], 12)
        self.assertEqual(item["coverage_percent"], 100)
        self.assertEqual(item["missing_interval_count"], 0)
        self.assertEqual(report["history_availability_percent"], 100)
        self.assertEqual(report["forecast_readiness"], 100)
        self.assertIn("not prediction accuracy", report["forecast_readiness_explanation"])

    def test_month_end_monthly_series_with_gap(self):
        self.seed([datetime(2024, 1, 31), datetime(2024, 2, 29), datetime(2024, 3, 31),
                   datetime(2024, 5, 31), datetime(2024, 6, 30)])
        item = self.resource(self.report())
        self.assertEqual(item["cadence"], "monthly")
        self.assertEqual(item["expected_intervals"], 6)
        self.assertEqual(item["missing_interval_count"], 1)
        self.assertEqual(item["longest_gap_intervals"], 1)

    def test_twelve_covered_months_with_daily_gaps_do_not_mean_full_readiness(self):
        stamps = [datetime(2025, month, day) for month in range(1, 13) for day in range(1, 6)]
        self.seed(stamps)
        report = self.report(date_from="2025-01-01", date_to="2025-12-31")
        item = self.resource(report)
        self.assertEqual(item["cadence"], "daily")
        self.assertEqual(item["covered_months"], 12)
        self.assertEqual(item["observed_intervals"], 60)
        self.assertEqual(item["expected_intervals"], 365)
        self.assertEqual(item["missing_interval_count"], 305)
        self.assertEqual(item["longest_gap_intervals"], 26)
        self.assertEqual(report["history_availability_percent"], 100)
        self.assertEqual(report["forecast_readiness"], item["coverage_percent"])
        self.assertLess(report["overall_score"], 65)
        self.assertGreater(report["issue_count"], 0)

    def test_hourly_gaps_and_duplicates_count_unique_slots(self):
        start = datetime(2025, 1, 1)
        self.seed([start + timedelta(hours=i) for i in (0, 1, 2, 3, 7, 8, 9)])
        self.seed([start], resources=("energy",))
        item = self.resource(self.report())
        self.assertEqual(item["cadence"], "hourly")
        self.assertEqual(item["observed_intervals"], 7)
        self.assertEqual(item["expected_intervals"], 10)
        self.assertEqual(item["missing_interval_count"], 3)
        self.assertEqual(item["longest_gap_intervals"], 3)
        self.assertEqual(item["duplicate_readings"], 1)
        self.assertLess(item["score"], 85)

    def test_hourly_selected_day_includes_all_24_slots(self):
        start = datetime(2025, 1, 1, 0, 30)
        self.seed([start + timedelta(hours=i) for i in range(10)])
        item = self.resource(self.report(date_from="2025-01-01", date_to="2025-01-01"))
        self.assertEqual(item["expected_intervals"], 24)
        self.assertEqual(item["missing_interval_count"], 14)
        self.assertEqual(item["longest_gap_intervals"], 14)

    def test_rounding_never_turns_incomplete_coverage_into_100_percent(self):
        start = datetime(2025, 1, 1)
        self.seed([start + timedelta(hours=i) for i in range(2500) if i != 1000])
        item = self.resource(self.report())
        self.assertEqual(item["expected_intervals"], 2500)
        self.assertEqual(item["missing_interval_count"], 1)
        self.assertEqual(item["coverage_percent"], 99.9)

    def test_building_gaps_cannot_be_hidden_by_other_buildings(self):
        stamps = [datetime(2025, 1, 1) + timedelta(days=i) for i in range(10)]
        self.seed(stamps, building="Full")
        self.seed(stamps[:4], building="Short")
        report = self.report()
        item = self.resource(report)
        self.assertEqual(item["expected_intervals"], 20)
        self.assertEqual(item["observed_intervals"], 14)
        self.assertEqual(item["coverage_percent"], 70)
        details = {row["building"]: row for row in item["building_coverage"]}
        self.assertEqual(details["Short"]["longest_gap_intervals"], 6)
        self.assertEqual(report["forecast_readiness_coverage_cap"], 40)

    def test_building_absent_from_selected_range_keeps_cadence_and_gaps(self):
        stamps = [datetime(2025, 1, 1) + timedelta(days=i) for i in range(10)]
        self.seed(stamps, building="Full")
        self.seed(stamps[:4], building="Short")
        report = self.report(date_from="2025-01-07", date_to="2025-01-10")
        details = {row["building"]: row for row in self.resource(report)["building_coverage"]}
        self.assertEqual(details["Short"]["cadence"], "daily")
        self.assertEqual(details["Short"]["observed_intervals"], 0)
        self.assertEqual(details["Short"]["missing_interval_count"], 4)
        self.assertEqual(self.resource(report)["missing_building_month_count"], 1)
        self.assertEqual(report["forecast_readiness"], 0)
        scoped = self.resource(self.report(building="Full", date_from="2025-01-07", date_to="2025-01-10"))
        self.assertEqual(len(scoped["building_coverage"]), 1)
        self.assertEqual(scoped["coverage_percent"], 100)

    def test_building_without_resource_history_is_explicitly_unknown(self):
        stamps = [datetime(2025, 1, 1) + timedelta(days=i) for i in range(5)]
        self.seed(stamps)
        self.seed(stamps, building="Water only", resources=("water",))
        report = self.report()
        item = self.resource(report)
        self.assertEqual(item["coverage_status"], "partial")
        unknown = next(row for row in item["building_coverage"] if row["building"] == "Water only")
        self.assertEqual(unknown["cadence"], "unknown")
        self.assertIsNone(unknown["expected_intervals"])
        self.assertEqual(report["forecast_readiness"], 0)

    def test_irregular_weekly_and_insufficient_series_are_unknown(self):
        for offsets in ((0, 1, 8, 20, 27), (0, 7, 14, 21), (0, 1, 2)):
            with self.subTest(offsets=offsets):
                self.db.query(models.EnergyData).delete()
                self.db.query(models.WaterData).delete()
                self.seed([datetime(2025, 1, 1) + timedelta(days=i) for i in offsets])
                report = self.report()
                item = self.resource(report)
                self.assertEqual(item["cadence"], "unknown")
                self.assertEqual(item["coverage_status"], "unknown")
                self.assertIsNone(item["coverage_percent"])
                self.assertIsNone(item["missing_interval_count"])
                self.assertEqual(report["forecast_readiness"], 0)
                self.assertTrue(any("cadence" in message for message in report["recommendations"]))

    def test_selected_single_day_uses_history_and_reversed_range_matches(self):
        self.seed([datetime(2025, 1, 1) + timedelta(days=i) for i in range(10)])
        item = self.resource(self.report(date_from="2025-01-05", date_to="2025-01-05"))
        self.assertEqual(item["cadence"], "daily")
        self.assertEqual(item["expected_intervals"], 1)
        self.assertEqual(item["coverage_percent"], 100)
        normal = self.report(date_from="2024-12-30", date_to="2025-01-12")
        reverse = self.report(date_from="2025-01-12", date_to="2024-12-30")
        self.assertEqual(normal["resources"], reverse["resources"])
        item = self.resource(normal)
        self.assertEqual(item["expected_intervals"], 14)
        self.assertEqual(item["missing_interval_count"], 4)
        self.assertEqual(item["longest_gap_intervals"], 2)

    def test_empty_database_and_empty_selected_window(self):
        for kwargs in ({}, {"date_from": "2025-01-01", "date_to": "2025-12-31"}):
            report = self.report(**kwargs)
            self.assertEqual(report["overall_score"], 0)
            self.assertEqual(report["forecast_readiness"], 0)
            self.assertEqual(report["history_availability_percent"], 0)
            self.assertEqual(report["history_months"], 12 if kwargs else 0)
        self.seed([datetime(2025, 1, 1) + timedelta(days=i) for i in range(5)])
        report = self.report(date_from="2025-02-01", date_to="2025-02-28")
        item = self.resource(report)
        self.assertEqual(item["observed_intervals"], 0)
        self.assertEqual(item["expected_intervals"], 28)
        self.assertEqual(item["longest_gap_intervals"], 28)
        self.assertEqual(item["coverage_percent"], 0)
        self.assertEqual(report["forecast_readiness"], 0)

    def test_optional_missing_resources_do_not_add_score_credit(self):
        stamps = [datetime(2025, 1, 1) + timedelta(days=i) for i in range(5)]
        self.seed(stamps, value=0)
        report = self.report()
        self.assertEqual(report["overall_score"], 70)
        self.assertEqual(self.resource(report, "solar")["score"], 0)
        self.assertEqual(self.resource(report, "solar")["status"], "optional_missing")

    def test_one_sided_empty_range_and_unknown_building(self):
        self.seed([datetime(2025, 1, 1) + timedelta(hours=i) for i in range(5)])
        for kwargs in ({"date_from": "2025-02-01"}, {"date_to": "2024-12-31"}):
            item = self.resource(self.report(**kwargs))
            self.assertEqual(item["cadence"], "hourly")
            self.assertEqual(item["expected_intervals"], 24)
            self.assertEqual(item["missing_interval_count"], 24)
        report = self.report(building="Unknown", date_from="2025-01-01", date_to="2025-01-05")
        self.assertEqual(report["overall_score"], 0)
        self.assertEqual(report["forecast_readiness"], 0)
        self.assertEqual(self.resource(report)["unknown_cadence_building_count"], 1)

    def test_sparse_monthly_readings_have_monthly_not_daily_gaps(self):
        self.seed([datetime(2025, month, 15) for month in (1, 2, 3, 5, 6)])
        item = self.resource(self.report(date_from="2025-01-01", date_to="2025-08-31"))
        self.assertEqual(item["cadence"], "monthly")
        self.assertEqual(item["expected_intervals"], 8)
        self.assertEqual(item["observed_intervals"], 5)
        self.assertEqual(item["missing_interval_count"], 3)
        self.assertEqual(item["longest_gap_intervals"], 2)

    def test_mixed_cadences_and_maximum_date_do_not_expand_slot_arrays(self):
        self.seed([datetime(2025, month, 1) for month in range(1, 5)], building="Monthly")
        self.seed([datetime(2025, 1, 1) + timedelta(hours=i) for i in range(5)], building="Hourly")
        item = self.resource(self.report(date_to="9999-12-31"))
        self.assertEqual(item["cadence"], "mixed")
        self.assertEqual(item["coverage_status"], "known")
        self.assertGreater(item["expected_intervals"], 1000000)


if __name__ == "__main__":
    unittest.main()
