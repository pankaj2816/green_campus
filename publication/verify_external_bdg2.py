"""Reproduce a local, read-only source review of five matched BDG2 buildings.

Downloaded source files and derived subsets stay under ignored tmp/. Results
describe data validity separately from MGCD's calculation correctness.
"""

import argparse
import hashlib
import json
import os
from pathlib import Path
import sys
import time
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / "tmp" / "external-data" / "bdg2"
RESULTS = Path(__file__).with_name("external_bdg2_results.json")
REF = "9b97ccbe90096aff42ed4fd6493bf7ae692d7118"
BUILDINGS = ["Bobcat_education_Alissa", "Bobcat_education_Coleman",
             "Bobcat_education_Dylan", "Bobcat_office_Justine", "Bobcat_other_Timothy"]
SOURCES = {
    "electricity": ("data/meters/raw/electricity.csv", 174239039, "039d909d8981e2d69eaeb366144e6ab7e84fa5e7e216aee42bddd95384a66418"),
    "water": ("data/meters/raw/water.csv", 15641460, "fa51cc382f3edc185bd6e232631c01b41ebd05adc51b5af5e5026d7beffdfd01"),
    "solar": ("data/meters/raw/solar.csv", 743887, "efa65f32b1661b733bd29818c097a2ddc2f36034bdce7bd757d87bfe13af0ead"),
    "metadata": ("data/metadata/metadata.csv", 272024, "992d0b29f24f96ad4332bc4dbb534b7bdd7dd2689aad093f94e93068ecddca02"),
}


def load_results():
    if RESULTS.exists():
        return json.loads(RESULTS.read_text())
    original = Path(__file__).with_name("external_bdg2_results.json")
    if original.exists():
        data = json.loads(original.read_text())
        data.pop("backtest", None)
        data.pop("api_verification", None)
        return data
    return {"source_commit": REF, "buildings": BUILDINGS}


def save_results(data):
    data["implementation_sha256"] = {
        relative: file_hash(ROOT / relative) for relative in (
            "green-campus/app/ai/forecast.py", "green-campus/app/ai/risk.py",
            "green-campus/app/services/data_quality.py", "green-campus/app/services/green_index.py",
            "green-campus/app/routers/dashboard.py", "green-campus/app/services/simulator.py",
            "publication/verify_external_bdg2.py")
    }
    RESULTS.write_text(json.dumps(data, indent=2, allow_nan=False, default=str) + "\n", encoding="utf-8")


def file_hash(path):
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def download():
    WORK.mkdir(parents=True, exist_ok=True)
    result = load_results()
    result["source_files"] = {}
    for name, (relative, size, expected_hash) in SOURCES.items():
        path = WORK / (name + ".csv")
        url = f"https://media.githubusercontent.com/media/buds-lab/building-data-genome-project-2/{REF}/{relative}"
        if not (path.exists() and path.stat().st_size == size and file_hash(path) == expected_hash):
            partial = path.with_suffix(".part")
            request = Request(url, headers={"User-Agent": "MGCD-local-data-verification"})
            digest = hashlib.sha256()
            count = 0
            with urlopen(request, timeout=90) as response, partial.open("wb") as output:
                while block := response.read(1024 * 1024):
                    count += len(block)
                    if count > size:
                        raise ValueError(f"Unexpected source size for {name}")
                    output.write(block)
                    digest.update(block)
                    if count // (20 * 1024 * 1024) != (count - len(block)) // (20 * 1024 * 1024):
                        print(f"{name}: {count / 1e6:.1f}/{size / 1e6:.1f} MB", flush=True)
            if count != size or digest.hexdigest() != expected_hash:
                raise ValueError(f"Published size/hash mismatch for {name}; source not accepted")
            partial.replace(path)
        result["source_files"][name] = {"url": url, "bytes": size, "sha256": expected_hash, "verified": True}
        print(f"Verified source: {name}, {size:,} bytes", flush=True)
    save_results(result)


def longest_true_run(mask):
    longest = current = 0
    for value in mask:
        current = current + 1 if value else 0
        longest = max(longest, current)
    return longest


def selected_frames():
    import pandas as pd
    frames = {}
    for resource in ("electricity", "water", "solar"):
        frame = pd.read_csv(WORK / (resource + ".csv"), usecols=["timestamp", *BUILDINGS])
        frame["timestamp"] = pd.to_datetime(frame["timestamp"], errors="raise")
        frames[resource] = frame.set_index("timestamp").sort_index()
    return frames


def profile():
    import numpy as np
    import pandas as pd
    from datetime import timezone, datetime
    result = load_results()
    frames = selected_frames()
    result["reviewed_at_utc"] = datetime.now(timezone.utc).isoformat()
    result["profiles"] = {}
    for resource, frame in frames.items():
        expected = pd.date_range(frame.index.min(), frame.index.max(), freq="h")
        readings = {}
        for building in BUILDINGS:
            values = pd.to_numeric(frame[building], errors="coerce")
            finite = np.isfinite(values)
            valid = finite & (values >= 0)
            available = values[finite]
            q1, q3 = available.quantile([.25, .75]) if len(available) else (0, 0)
            extreme = values > q3 + 3 * (q3 - q1)
            readings[building] = {
                "rows": len(values), "missing_or_nonfinite": int((~finite).sum()),
                "negative": int((finite & (values < 0)).sum()), "zero": int((values == 0).sum()),
                "valid_nonnegative_percent": round(float(valid.mean()) * 100, 3),
                "longest_missing_run_hours": longest_true_run(~finite),
                "longest_zero_run_hours": longest_true_run(values == 0),
                "minimum": float(available.min()) if len(available) else None,
                "maximum": float(available.max()) if len(available) else None,
                "sum_valid_nonnegative": float(values[valid].sum()),
                "extreme_high_3iqr_flags": int(extreme.sum()),
                "first_valid": str(values[valid].index.min()) if valid.any() else None,
                "last_valid": str(values[valid].index.max()) if valid.any() else None,
                "largest_three_readings": [{"timestamp": str(date), "value": float(value)} for date, value in available.nlargest(3).items()],
            }
            if resource == "solar":
                positive_total = float(values[valid].sum())
                night = (frame.index.hour >= 22) | (frame.index.hour <= 4)
                readings[building]["local_22_to_04_positive_energy_share_percent"] = round(float(values[valid & night].sum()) / positive_total * 100, 3) if positive_total else None
                readings[building]["local_22_to_04_positive_readings"] = int((valid & night & (values > 0)).sum())
                grouped_days = values.groupby(values.index.normalize())
                readings[building]["complete_nonzero_constant_days"] = int(((grouped_days.count() == 24) & (grouped_days.nunique() == 1) & (grouped_days.first() > 0)).sum())
        result["profiles"][resource] = {
            "rows": len(frame), "start": str(frame.index.min()), "end": str(frame.index.max()),
            "duplicate_timestamps": int(frame.index.duplicated().sum()),
            "missing_timestamp_count": len(expected.difference(frame.index)),
            "expected_hour_count": len(expected), "buildings": readings,
        }
        frame.to_csv(WORK / (resource + "_selected.csv"))
    metadata = pd.read_csv(WORK / "metadata.csv")
    result["metadata_columns"] = list(metadata.columns)
    result["building_metadata"] = metadata[metadata["building_id"].isin(BUILDINGS)].replace({np.nan: None}).to_dict("records")
    complete_days = {}
    all_timestamps = sorted(set.union(*(set(frame.index) for frame in frames.values())))
    joint_index = pd.DatetimeIndex(all_timestamps)
    all_valid_daily = {}
    for building in BUILDINGS:
        joint = pd.DataFrame({resource: frame[building].reindex(joint_index) for resource, frame in frames.items()})
        valid = np.isfinite(joint).all(axis=1) & (joint >= 0).all(axis=1)
        counts = valid.resample("D").sum()
        good_dates = counts[counts == 24].index
        complete_days[building] = {"joint_valid_hours": int(valid.sum()), "complete_24h_days": len(good_dates),
                                   "candidate_days": len(counts), "days_by_month": good_dates.to_series().groupby(good_dates.strftime("%Y-%m")).size().to_dict()}
        daily = joint[valid].resample("D").sum(min_count=1).reindex(good_dates)
        daily["water"] /= 1000
        daily.index.name = "date"
        daily.to_csv(WORK / (building + "_complete_daily.csv"))
        all_valid_daily[building] = daily
    result["joint_coverage"] = complete_days
    common_days = sorted(set.intersection(*(set(frame.index) for frame in all_valid_daily.values())))
    result["complete_days_shared_by_all_five"] = len(common_days)
    result["common_day_start"] = str(min(common_days)) if common_days else None
    result["common_day_end"] = str(max(common_days)) if common_days else None
    eligible = [building for building in BUILDINGS if complete_days[building]["complete_24h_days"] >= 180]
    result["evaluation_buildings"] = eligible
    result["excluded_buildings"] = {building: "Fewer than 180 complete three-resource days; no complete three-resource day exists for this candidate" for building in BUILDINGS if building not in eligible}
    cohort_days = sorted(set.intersection(*(set(all_valid_daily[building].index) for building in eligible))) if eligible else []
    result["evaluation_common_days"] = len(cohort_days)
    result["evaluation_common_day_start"] = str(min(cohort_days)) if cohort_days else None
    result["evaluation_common_day_end"] = str(max(cohort_days)) if cohort_days else None
    result["evaluation_fraction_of_731_source_days_percent"] = round(len(cohort_days) / 731 * 100, 3)
    if cohort_days:
        selected_hours = frames["electricity"].index.normalize().isin(cohort_days)
        demand = frames["electricity"].loc[selected_hours, eligible]
        solar = frames["solar"].loc[selected_hours, eligible]
        daily_demand = demand.sum(axis=1).resample("D").sum().reindex(cohort_days)
        daily_solar = solar.sum(axis=1).resample("D").sum().reindex(cohort_days)
        result["netting_sensitivity"] = {
            "whole_selected_window_kwh": float(max(demand.to_numpy().sum() - solar.to_numpy().sum(), 0)),
            "sum_day_netted_cohort_kwh": float((daily_demand - daily_solar).clip(lower=0).sum()),
            "sum_hour_netted_cohort_kwh": float((demand.sum(axis=1) - solar.sum(axis=1)).clip(lower=0).sum()),
            "hours_cohort_solar_exceeds_electricity": int((solar.sum(axis=1) > demand.sum(axis=1)).sum()),
            "per_building_solar_exceeds_electricity_hours": {building: int((solar[building] > demand[building]).sum()) for building in eligible},
            "meaning": "Arithmetic sensitivity only; no gross/grid meter-boundary certification, storage model or tariff/net-metering assumption is established.",
        }
    result["limitations"] = [
        "No waste readings exist in these source files.",
        "24-hour local-calendar completeness is an explicit selection rule, not a timezone/DST certification.",
        "Positive values and complete timestamps do not prove calibration or gross/grid-import semantics.",
        "Extreme-high flags are diagnostics only; no flagged reading was silently removed.",
        "Raw files and selected measurement subsets are local only; licensing discrepancies remain unresolved.",
    ]
    save_results(result)
    print(json.dumps({"profiles": {key: {"rows": value["rows"], "duplicate_timestamps": value["duplicate_timestamps"], "missing_timestamp_count": value["missing_timestamp_count"]} for key, value in result["profiles"].items()}, "complete_days_by_building": {key: value["complete_24h_days"] for key, value in complete_days.items()}, "all_five_common_days": len(common_days), "evaluation_buildings": eligible, "evaluation_common_days": len(cohort_days)}, indent=2))


def evaluation_rows():
    import pandas as pd
    from decimal import Decimal
    from datetime import datetime
    selected = load_results().get("evaluation_buildings", [])
    if not selected:
        raise ValueError("No eligible cohort; profile source data first")
    frames = {building: pd.read_csv(WORK / (building + "_complete_daily.csv"), parse_dates=["date"]).set_index("date") for building in selected}
    common = sorted(set.intersection(*(set(frame.index) for frame in frames.values())))
    if not common:
        raise ValueError("No complete days shared by the eligible buildings; do not manufacture a matched cohort")
    rows = {resource: [] for resource in ("energy", "water", "solar", "waste")}
    for building, frame in frames.items():
        for date, values in frame.loc[common].iterrows():
            for source, target in (("electricity", "energy"), ("water", "water"), ("solar", "solar")):
                rows[target].append((date.to_pydatetime(), building, Decimal(str(values[source]))))
    for resource in rows:
        rows[resource].sort(key=lambda row: (row[0], row[1]))
    return rows


def verify_api():
    import pandas as pd
    from collections import defaultdict
    from datetime import timedelta
    from decimal import Decimal
    from io import BytesIO
    import openpyxl

    # These test fixtures override the application database with a new in-memory
    # engine. No user's local or hosted database is connected or replaced.
    os.environ["DATABASE_URL"] = "sqlite://"
    os.environ["SECRET_KEY"] = "external-bdg2-test-only-key"
    sys.path.insert(0, str(ROOT / "green-campus"))
    sys.path.insert(0, str(ROOT / "green-campus" / "tests"))
    import test_review_regressions as fixtures
    from test_data_verification import expected_summary, source_rows

    rows = evaluation_rows()
    case = fixtures.DashboardRegressionTests("test_reads_require_authentication")
    case.setUp()
    checks = []
    result = load_results()
    resource_columns = {"energy": "energy_kwh", "water": "water_kl", "solar": "solar_kwh", "waste": "waste_kg"}

    def record(name):
        checks.append(name)
        print(f"PASS: {name}", flush=True)

    def close(actual, expected, tolerance=.011):
        case.assertAlmostEqual(float(actual), float(expected), delta=tolerance)

    def check_summary(actual, expected):
        for key, expected_value in expected.items():
            if expected_value is None:
                case.assertIsNone(actual[key])
            else:
                close(actual[key], expected_value)

    try:
        headers = case.admin_headers()

        def get(path, params=None):
            response = case.client.get(path, params=params, headers=headers)
            case.assertEqual(response.status_code, 200, response.text)
            return response.json()

        workbook = openpyxl.Workbook()
        workbook.remove(workbook.active)
        for resource, column in resource_columns.items():
            sheet = workbook.create_sheet(resource)
            sheet.append(["date", "building", column])
            for date, building, value in rows[resource]:
                sheet.append([date, building, float(value)])
        buffer = BytesIO()
        workbook.save(buffer)
        workbook.close()
        content = buffer.getvalue()
        files = {"file": ("bdg2_local_verification.xlsx", content)}
        validation = case.client.post("/admin/validate-campus-excel", files=files, headers=headers)
        case.assertEqual(validation.status_code, 200, validation.text)
        case.assertTrue(validation.json()["ready"], validation.text)
        record("Actual derived-data workbook validation, with empty optional waste")
        imported = case.client.post("/admin/upload-campus-excel", files=files, headers=headers)
        case.assertEqual(imported.status_code, 200, imported.text)
        for resource in rows:
            case.assertEqual(imported.json()["imported_rows"][resource], len(rows[resource]))
        record("Actual API workbook import and all resource row counts")

        summary = get("/dashboard/summary")
        check_summary(summary, expected_summary(rows))
        record("Independent campus totals, carbon, cost and Green Index arithmetic")
        evaluation_buildings = sorted({building for _, building, _ in rows["energy"]})
        for building in evaluation_buildings:
            check_summary(get("/dashboard/summary", {"building": building}), expected_summary(rows, building))
        record(f"Independent totals and derived calculations for each of {len(evaluation_buildings)} eligible buildings")

        dates = sorted({date.date() for date, _, _ in rows["energy"]})
        start, end = dates[len(dates) // 2], dates[-1]
        params = {"date_from": start.isoformat(), "date_to": end.isoformat()}
        check_summary(get("/dashboard/summary", params), expected_summary(rows, start=start, end=end))
        check_summary(get("/dashboard/summary", {"date_from": end.isoformat(), "date_to": start.isoformat()}), expected_summary(rows, start=start, end=end))
        previous_end = start - timedelta(days=1)
        previous_start = start - timedelta(days=(end - start).days + 1)
        comparison = get("/dashboard/comparison", params)
        check_summary(comparison["previous"], expected_summary(rows, start=previous_start, end=previous_end))
        current_expected = expected_summary(rows, start=start, end=end)
        prior_expected = expected_summary(rows, start=previous_start, end=previous_end)
        for key, delta in comparison["delta"].items():
            close(delta["change"], round(float(current_expected[key] or 0), 2) - round(float(prior_expected[key] or 0), 2), .02)
        record("Date filters, reversed dates and independently calculated previous-period comparison")

        monthly = {resource: defaultdict(Decimal) for resource in rows}
        for resource, records in rows.items():
            for date, _, value in records:
                monthly[resource][(date.year, date.month)] += value
        for point in get("/energy/trend"):
            month, year = map(int, point["month"].split("-"))
            energy, solar = monthly["energy"][(year, month)], monthly["solar"][(year, month)]
            close(point["energy"], energy)
            close(point["solar"], solar)
            close(point["net"], max(energy - solar, 0))
        record("Every monthly energy, solar and net-energy chart point")

        ranking = get("/dashboard/building-performance")
        maxima = {key: max(item[key] for item in ranking) or 1 for key in ("net_energy", "water", "waste")}
        for rank, item in enumerate(ranking, 1):
            case.assertEqual(item["rank"], rank)
            expected = expected_summary(rows, item["building"])
            for key in ("energy", "solar", "net_energy", "water", "waste", "carbon"):
                close(item[key], expected[key])
            score = sum(weight * item[key] / maxima[key] for key, weight in (("net_energy", .5), ("water", .3), ("waste", .2)))
            close(item["efficiency_score"], score, .001)
        record("Building ranks and independent relative-efficiency formula")

        for mode, horizon in (("daily", 14), ("monthly", 12), ("seasonal", 8), ("yearly", 5)):
            bundle = get("/dashboard/bundle", {"granularity": mode})
            case.assertEqual(bundle["errors"], {})
            for resource in ("energy", "water", "solar"):
                series = bundle["forecast"][resource]
                grouped = defaultdict(Decimal)
                for date, _, value in rows[resource]:
                    if mode == "daily":
                        key = (date.year, date.month, date.day)
                    elif mode == "monthly":
                        key = (date.year, date.month)
                    elif mode == "yearly":
                        key = (date.year,)
                    else:
                        season = 0 if date.month in (12, 1, 2) else 1 if date.month <= 5 else 2 if date.month <= 9 else 3
                        key = (date.year + (date.month == 12), season)
                    grouped[key] += value
                case.assertEqual(len(series["historical_values"]), len(grouped))
                for actual, key in zip(series["historical_values"], sorted(grouped)):
                    close(actual, grouped[key])
                case.assertEqual(len(series["forecast_values"]), horizon)
                for low, estimate, high in zip(series["forecast_lower"], series["forecast_values"], series["forecast_upper"]):
                    case.assertTrue(0 <= low <= estimate <= high)
            case.assertEqual(bundle["forecast"]["waste"]["forecast_values"], [])
            risk = bundle["risk"][0]
            energy = bundle["forecast"]["energy"]
            solar = bundle["forecast"]["solar"]
            solar_by_label = dict(zip(solar["forecast_labels"], solar["forecast_values"]))
            net = max(energy["forecast_values"][-1] - solar_by_label.get(energy["forecast_labels"][-1], 0), 0)
            close(risk["projected_net_energy"], net)
            close(risk["projected_cost"], net * 8)
            close(risk["projected_carbon"], net * .82)
            record(f"{mode.title()} bundle: all sections, history, horizon, bounds, absent-waste forecast and risk arithmetic")

        daily_totals = {resource: defaultdict(Decimal) for resource in ("energy", "solar")}
        for resource in daily_totals:
            for date, _, value in rows[resource]:
                daily_totals[resource][date] += value
        expected_surplus_days = sum(daily_totals["solar"][date] > value for date, value in daily_totals["energy"].items())
        case.assertEqual(bundle["alerts"]["export_ready_day_count"], expected_surplus_days)
        record("Export-ready day count independently calculated from matched daily readings")
        for resource in bundle["data_quality"]["resources"]:
            case.assertEqual(resource["row_count"], len(rows[resource["resource"]]))
        record("Data-quality resource counts and explicit absent optional waste")

        for reduction in (0, 25, 100):
            response = case.client.post("/ai/simulate/impact", headers=headers, json={
                "energy_reduction_pct": reduction, "water_reduction_pct": reduction,
                "waste_reduction_pct": reduction, "solar_increase_pct": reduction})
            case.assertEqual(response.status_code, 200, response.text)
            scenario = response.json()
            expected = expected_summary(rows)
            for resource in rows:
                factor = 1 + reduction / 100 if resource == "solar" else 1 - reduction / 100
                close(scenario["projected"][resource], float(expected[resource]) * factor)
            close(scenario["projected"]["carbon"], scenario["projected"]["net_energy"] * .82, .02)
        record("0%, 25% and 100% scenarios checked against independent source totals")

        exported = case.client.get("/admin/export-campus-excel", headers=headers)
        case.assertEqual(exported.status_code, 200)
        exported_rows = source_rows(exported.content)
        for resource in rows:
            case.assertEqual(len(exported_rows[resource]), len(rows[resource]))
            for actual, expected in zip(sorted(exported_rows[resource]), rows[resource]):
                case.assertEqual(actual[:2], expected[:2])
                close(actual[2], expected[2], 1e-7)
        reimported = case.client.post("/admin/upload-campus-excel", headers=headers, files={"file": ("roundtrip.xlsx", exported.content)})
        case.assertEqual(reimported.status_code, 200, reimported.text)
        check_summary(get("/dashboard/summary"), expected_summary(rows))
        record("Actual Excel export, every preserved date/building/value, and re-import")

        before = get("/dashboard/summary")
        changed = case.client.post("/meta/settings", headers=headers, json={"metric_overrides": {"energy_cost_per_kwh": 12, "emission_factor_kg_per_kwh": .5}, "action_tracker": {"external-data-check": "completed"}})
        case.assertEqual(changed.status_code, 200, changed.text)
        after = get("/dashboard/summary")
        close(after["energy"], before["energy"])
        close(after["carbon"], after["net_energy"] * .5, .02)
        close(after["monthly_energy_cost_rs"], before["monthly_energy_cost_rs"] * 1.5, .02)
        case.assertEqual(after["action_tracker"]["external-data-check"], "completed")
        events = get("/meta/audit-trail")["records"]
        case.assertGreaterEqual(len(events), 3)
        record("Settings and action persistence, recalculation, unchanged raw totals and audit events")

        invalid = openpyxl.load_workbook(BytesIO(content))
        invalid["energy"].append([cell.value for cell in invalid["energy"][2]])
        bad_buffer = BytesIO()
        invalid.save(bad_buffer)
        invalid.close()
        rejected = case.client.post("/admin/upload-campus-excel", headers=headers, files={"file": ("duplicate.xlsx", bad_buffer.getvalue())})
        case.assertEqual(rejected.status_code, 400)
        case.assertEqual(get("/dashboard/summary"), after)
        record("Duplicate actual-data row rejected without erasing the loaded dataset")

        result["api_verification"] = {
            "status": "passed", "checks": checks,
            "cohort": "Only local calendar days with 24 finite nonnegative readings per resource, shared across the eligible buildings; all-zero runs and spikes are flagged, not silently removed",
            "evaluation_buildings": evaluation_buildings,
            "imported_rows": imported.json()["imported_rows"],
            "baseline_summary": summary, "comparison_window": params,
            "first_evaluation_day": dates[0].isoformat(), "last_evaluation_day": dates[-1].isoformat(),
            "distinct_evaluation_days": len(dates), "export_ready_day_count": expected_surplus_days,
            "data_quality": bundle["data_quality"],
            "rounding_note": "Each independently aggregated historical bucket and summary uses tolerance .011; selected rounded derived differences use .02. Exported reading values use 1e-7.",
            "note": "These checks establish implemented arithmetic, not gross-demand semantics, applicable tariffs/emission factors, calibrated sensors or field performance.",
        }
        reset = case.client.post("/admin/reset-campus-data", headers=headers)
        case.assertEqual(reset.status_code, 200)
        case.assertFalse(get("/dashboard/summary")["has_data"])
        record("Reset in the isolated database and unassessed empty state")
        save_results(result)
    except Exception as error:
        result["api_verification"] = {"status": "failed", "passed_checks": checks, "error": repr(error)}
        save_results(result)
        raise
    finally:
        case.tearDown()


def backtest():
    from collections import defaultdict
    from datetime import timedelta
    from math import sqrt
    from types import SimpleNamespace
    os.environ["DATABASE_URL"] = "sqlite://"
    os.environ["SECRET_KEY"] = "external-bdg2-test-only-key"
    sys.path.insert(0, str(ROOT / "green-campus"))
    from app.ai.forecast import build_resource_payload
    from app.services.metrics_config import ACADEMIC_OCCUPANCY_FACTORS
    rows = evaluation_rows()
    result = load_results()
    outcomes = {}
    for resource in ("energy", "water", "solar"):
        totals = defaultdict(float)
        for date, _, value in rows[resource]:
            totals[date] += float(value)
        dates = sorted(totals)
        for horizon in (1, 7):
            errors = defaultdict(list)
            truths = []
            covered = 0
            for origin in dates[180::7]:
                target = origin + timedelta(days=horizon)
                seasonal_day = target - timedelta(days=7)
                if target not in totals or seasonal_day not in totals or seasonal_day > origin:
                    continue
                history = [SimpleNamespace(timestamp=date, value=totals[date]) for date in dates if date <= origin]
                forecast = build_resource_payload(history, "value", "daily", 7, ACADEMIC_OCCUPANCY_FACTORS, occupancy_sensitive=resource != "solar")
                without_occupancy = build_resource_payload(history, "value", "daily", 7, {month: 1 for month in range(1, 13)}, occupancy_sensitive=resource != "solar")
                truth = totals[target]
                truths.append(truth)
                for name, prediction in (("mgcd_current", forecast["forecast_values"][horizon - 1]),
                                         ("neutral_occupancy_control", without_occupancy["forecast_values"][horizon - 1]),
                                         ("seasonal_naive_7day", totals[seasonal_day])):
                    errors[name].append(prediction - truth)
                covered += forecast["forecast_lower"][horizon - 1] <= truth <= forecast["forecast_upper"][horizon - 1]
            outcomes[f"{resource}_{horizon}day"] = {
                "paired_test_cases": len(truths),
                "models": {name: {"mae": round(sum(abs(value) for value in values) / len(values), 4),
                                  "rmse": round(sqrt(sum(value * value for value in values) / len(values)), 4),
                                  "wape_percent": round(100 * sum(abs(value) for value in values) / sum(abs(value) for value in truths), 3) if sum(abs(value) for value in truths) else None}
                           for name, values in errors.items()},
                "current_spread_band_empirical_coverage_percent": round(100 * covered / len(truths), 3) if truths else None,
            }
    result["backtest"] = {
        "protocol": "Expanding-window campus aggregate; first 180 available complete days are warm-up; origins every seventh available day; matched observed targets at 1 and 7 calendar days; only observations <= origin used. Identical cases for all models. Post-fix regression benchmark on previously inspected data, not an untouched external test. No parameter search performed.",
        "selection_limit": "Complete-day cohort is selected using coverage across the full source window. This is retrospective quality-conditioned evaluation, not prospective operational availability. Missing days are not imputed.",
        "interpretation": "Default occupancy factors are not measured for this external site. Bands have no nominal confidence level. Units are kWh for energy/solar and kl for water.",
        "results": outcomes,
    }
    save_results(result)
    print(json.dumps(result["backtest"], indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("stage", choices=["download", "profile", "api", "backtest"])
    parser.add_argument("--results", type=Path, help="Separate output snapshot; preserves the original pre-fix evidence")
    args = parser.parse_args()
    if args.results:
        RESULTS = args.results.resolve()
    {"download": download, "profile": profile, "api": verify_api, "backtest": backtest}[args.stage]()
