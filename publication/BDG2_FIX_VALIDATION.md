# MGCD: Data-Verification Fixes and Retest

Date: 26 October 2026.

## 1. What Was Fixed

These changes address the software issues exposed by the actual BDG2 verification. They do not change the original readings, certify sensors, establish meter boundaries or resolve dataset licensing. Local sample workbooks and the public-data subset were tested in isolated databases; production data was not replaced.

### Forecast Baseline and Occupancy

The old baseline averaged historical cycles and multiplied by assumed occupancy. That produced worse results than repeating the same weekday's previous-week value on the inspected BDG2 cases.

The corrected baseline is deliberately simple and explicit:

- Daily: use the observed value seven calendar days before the target when available.
- Monthly: use the previous year's same-month observation when available.
- Seasonal: use the same season in the previous annual cycle; yearly: use the previous observed year.
- For longer horizons, repeat an observed seasonal reference rather than reading future values. If a reference is absent, use up to eight recent observations from the same cycle; if none exist, use up to eight recent observations overall.
- Missing periods are not filled with zero. An observed zero remains zero. Records are sorted before identifying the last observation.
- Baseline predictions no longer change merely because an unverified activity factor changes. Assumed occupancy affects a separately labeled `occupancy_scenario_values` what-if series. Solar is not occupancy-adjusted.
- The occupancy scenario is a proportional assumption relative to the historical average factor, not learned attendance sensitivity. All-zero historical factors disable that adjustment rather than divide by zero.

This is a defensible seasonal baseline, not a new learned AI algorithm. Weather, verified occupancy regressors, model selection and separately held-out evaluation remain future work. Aggregating incomplete months does not reconstruct missing consumption; check the coverage panel before interpreting grouped forecasts.

### Forecast Spread and Risk Wording

Spreads now use the 90th empirical percentile of absolute seasonal-reference errors on up to 56 earlier prediction cases where enough history exists, with a heuristic square-root widening beyond one cycle. With insufficient error history, spread falls back to observed variation. Errors are calculated from strictly earlier history for each case, not in-sample fitted residuals.

The empirical percentile is an engineering spread rule, **not a claimed 90% confidence or prediction interval**. There is no asserted nominal coverage level. A single observation can have zero historical variation; that is insufficient uncertainty evidence, not certainty about the future.

API fields identify the method, spread type, historical error count and unverified occupancy assumptions. The UI places diagnostics in expandable explanations. Risk no longer attributes baseline changes or adds risk points to assumed occupancy when occupancy was not applied to that forecast. Risk remains a heuristic, not a probability.

### Missing Waste and Green Index

Missing waste was previously aggregated as numeric zero and received the same index benefit as a genuine zero-waste measurement. That is corrected:

1. Resource availability comes from the presence of scoped records, not whether the total is positive.
2. Missing resource components are excluded from the score; available weights are normalized to sum to one.
3. Unavailable component scores are null. No assessable weighted resource gives a null overall index.
4. `green_index_details` marks complete, partial or unavailable assessments and lists assessed/unavailable resources.
5. Summary, compliance and scenario calculations use the same availability-aware formula.

Example with default weights: electricity and water both reach their benchmark, but waste is missing. The old index was 20 because missing waste earned all its component points. The corrected partial index is 0: `(0.5 x 1 + 0.3 x 1) / (0.5 + 0.3) = 1` pressure, so `100 x (1 - 1) = 0`. If waste is actually measured as zero, the complete index remains 20. These are intentionally different cases.

Partial scores are not directly comparable to complete scores. Benchmarks still need to match the selected scope, reporting interval and campus context; they are not independently validated sustainability standards.

### Data Coverage and Readiness

The previous month-count readiness could reach 100% despite missing days. The corrected service:

- Infers hourly, daily or monthly cadence conservatively per building from scoped resource history. Calendar-aligned monthly totals are not treated as daily records. Ambiguous/insufficient cadence stays unknown.
- Reports unique observed and expected calendar intervals, missing interval count and longest gap per building, including explicit date-window boundary gaps.
- Uses at least four distinct timestamps and regular-step evidence for cadence inference. Unknown cadence is not silently assumed complete.
- Separates month-based `history_availability_percent` from `forecast_readiness`, which is capped by the lowest required-resource building coverage. Unknown required cadence or absent required data yields zero readiness.
- Incorporates known interval coverage in quality scoring and excludes absent optional resources from score credit.
- Explains that readiness is a data-sufficiency indicator, not prediction accuracy. Sampling cadence is inferred, not a configured sensor contract; subhourly/weekly/irregular series need further configuration support.

The service uses buildings observed in scoped history and expects them throughout the selected window. It cannot infer actual commissioning dates or unseen buildings; these assumptions are disclosed. Distinct observed slots do not prove physically calibrated readings, and long numeric-zero runs remain a review item.

### Clearer UI and Comparisons

The UI distinguishes unavailable waste from measured zero in principal KPI/resource/report views, labels partial Green Index results, replaces confidence-range claims with forecast-spread wording, and exposes interval diagnostics and occupancy scenario values.

Comparison deltas include `comparable` and a reason. The UI suppresses numeric-change/improvement claims when periods lack observations, waste/water are unavailable, Green Index assessed sets differ, or net-energy accounting switches between absent/present solar data. Existing arithmetic delta fields remain for backward API compatibility, but consumers should honor `comparable`.

Net-energy and report explanations now state that carbon/cost are configured-factor estimates using period-level electricity-minus-solar netting. They are not measured bills, imports or exports. Touched-month averages can understate a full-month bill when dates are incomplete.

## 2. Actual-Data Retest

The same qualified BDG2 cohort was retained: three buildings, 518 shared complete days, 1,554 records per electricity/water/solar resource and zero waste records, totaling 4,662 records. No source outliers or zeros were silently removed to improve scores.

All **18 actual-data application verification groups passed again**, including import, independent aggregate/building calculations, date filters, comparisons, chart buckets, rankings, all forecast-mode structures/bounds, scenarios, Excel export/reimport, settings, audit, duplicate rejection and reset.

| Indicator | Before | After | Interpretation |
| --- | ---: | ---: | --- |
| Imported records | 4,662 | 4,662 | No source-data replacement or filtering change |
| Heuristic quality score | 97.6 | 84.2 | Missing intervals now affect the score |
| Month-history availability | 100% equivalent | 100% | Records touch all 24 months |
| Readiness/data sufficiency | 100% | 73.2% | Capped by daily interval coverage |
| Green Index | 20.00 | 0.00, partial | Missing waste no longer earns points |

For each measured resource, observed building-days are 1,554 against 2,124 expected, leaving 570 missing building-days and a longest gap of 31 days. The expected window spans 708 days between the first and last retained date, multiplied by three buildings. **73.2% within that imported window differs from 70.862% against all 731 days of the original source release.** Neither number means sensor accuracy.

Energy, solar, water, carbon and cost totals still reconcile to the independently calculated source totals under the disclosed accounting assumptions. Changes to the Green Index are intentional formula corrections, not changed readings.

## 3. Forecast Before/After

The chronological protocol and paired cases match the pre-fix benchmark: 180 available-day warm-up, origins every seventh available day, observed targets at one and seven calendar days, identical cases for comparators. Lower WAPE is better.

| Resource | Horizon | Cases | Pre-fix WAPE | Corrected WAPE | Previous-week baseline WAPE |
| --- | --- | ---: | ---: | ---: | ---: |
| Electricity | 1 day | 44 | 22.242% | 6.763% | 6.763% |
| Electricity | 7 days | 42 | 21.535% | 5.774% | 5.774% |
| Water | 1 day | 44 | 51.612% | 12.596% | 12.595% |
| Water | 7 days | 42 | 46.540% | 12.807% | 12.806% |
| Solar | 1 day | 44 | 44.243% | 34.132% | 34.132% |
| Solar | 7 days | 42 | 41.757% | 28.807% | 28.807% |

The corrected method intentionally matches the seasonal-naive baseline where that observation exists. Tiny water differences arise from two-decimal forecast aggregation/output rounding. This is **not evidence of superiority over the baseline**.

Current spread empirical coverage on these cases is 88.636% for each one-day resource, 95.238% for seven-day electricity/water and 92.857% for seven-day solar. These measurements do not certify future coverage or a nominal confidence level. Monthly, seasonal and yearly modes passed arithmetic/structural checks, not an independent predictive-accuracy study at those horizons.

Crucially, this is a **post-fix regression benchmark on previously inspected observations**, not a fresh untouched test. No parameter search was performed, but the method change was informed by earlier results. A publication claiming generalization needs a new, frozen evaluation protocol and separately held-out site/time data.

## 4. Verification and Reproduction

- Complete backend suite: **55 tests passed**, including local workbook reconciliation, cadence corner cases, missing-versus-zero handling, calendars/gaps/zeros, occupancy separation, partial comparisons and empty states.
- Frontend: **28 tests passed**; production build succeeded.
- BDG2 actual-data API verification: **18 groups passed** on the corrected implementation.
- Chronological forecast regression benchmark completed with all six resource/horizon comparisons.
- Tests use isolated SQLite databases. No live PostgreSQL, Render deployment or physical device was tested in this pass. Automated component tests and build checks are not a full browser visual audit.

The backend suite prints existing SQLAlchemy UTC-deprecation warnings and a shutdown SQLite resource warning; these did not fail tests. The intentionally injected dashboard-section exception is a passing fault-isolation test, not an unexpected production error.

Original evidence is retained in `external_bdg2_results.json`. New evidence is `external_bdg2_postfix_results.json`, including implementation file hashes. A subsequent manuscript revision updates the IEEE TeX/PDF to these methods and results, while retaining the warning that the repeated-data benchmark is not an untouched external evaluation. Author and venue review remain required.

From `D:\working_green_campus`:

```powershell
$env:PYTHONPATH = 'D:\working_green_campus\.pydeps'
python publication/verify_external_bdg2.py api --results publication/external_bdg2_postfix_results.json
python publication/verify_external_bdg2.py backtest --results publication/external_bdg2_postfix_results.json
```

Run stages sequentially because they update the same evidence file. The original downloaded files remain under ignored `tmp/external-data/bdg2/` and are not intended for redistribution through Git.

## 5. Remaining External Constraints

The following cannot honestly be declared fixed by software changes:

- BDG2 repository/archive license discrepancy: obtain applicable-version/license clarification before redistributing derived records or bundling data with a paid service.
- Waste measurements are absent from this cohort; do not fabricate campus waste data.
- Meter gross-versus-grid boundaries, water-unit calibration, zero runs, extreme readings and timestamp conventions still require source/provider confirmation.
- Population, floor area, emission factors, tariffs and academic occupancy assumptions must be configured for the actual evaluated site. Default values are not external-campus measurements.
- Benchmark validation, interval-level self-consumption accounting, truly calibrated prediction intervals and unseen-site evaluation need additional evidence and/or scoped implementation.

The original workbook's reported water-unit discrepancy is not automatically corrected: changing source values without an authoritative unit declaration would risk corrupting valid data. Use explicit `water_liters` or correctly labeled `water_kl` inputs and obtain source confirmation.
