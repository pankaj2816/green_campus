# MGCD Data Verification Report

Verified on 26 October 2026 against the current local working tree.

**Follow-up:** The checks below describe the earlier local-workbook verification. Public BDG2 readings subsequently exposed gaps in readiness scoring, missing-resource interpretation and forecast accuracy. Those issues were corrected and retested; see [post-fix validation](publication/BDG2_FIX_VALIDATION.md). Earlier statements about the implementation's forecast/score rules are historical, not the current method.

## 1. Result and Scope

The tested source-to-API arithmetic reconciles with the workbooks under the application's existing calculation rules. This does not establish that every source value has the correct physical unit, that forecasts are accurate, or that planning estimates match utility bills.

This review used isolated SQLite databases, not the live Render database. It did not change any original workbook or production record. Git publication does not establish that Render has deployed or passed production checks.

Evidence:

- 28 backend regression tests passed, including five new numerical/workflow verification tests with many workbook, scope, metric, and forecast subcases.
- 15 frontend tests passed across seven suites.
- Frontend production build succeeded.
- Four compatible workbooks, containing 8,980 resource records in total, were imported, reconciled, exported, and imported again in isolated tests. This count includes related versions of the same underlying dataset; it is not 8,980 unique campus observations.
- Two additional source workbooks were inspected and correctly rejected as direct dashboard imports because they do not have the required sheet structure.

Automated checks demonstrate the specified cases, not exhaustive correctness for every possible input. Render availability, live PostgreSQL persistence, physical sensors, actual bills, and real forecast accuracy were not verified in this pass.

## 2. Important Findings

### 2.1 Older water values differ by 1,000 times

The original `sample_data/campus_resource_dataset.xlsx` contains **37,401,000** under `water_kl`. The prepared `sample_data/campus_resource_dataset_import_ready.xlsx` contains **37,401 kl** for the corresponding dataset. The backend-root copy also contains 37,401,000 under `water_kl`.

This strongly suggests a liters-versus-kl discrepancy, but the workbook header alone cannot prove which physical unit was originally recorded. Confirm against the original meter or utility records before using these numbers for management decisions.

The importer deliberately does not guess from the size of a number. A `water_kl` value is treated as kl. A `water_liters` value is explicitly divided by 1,000. No original file was silently corrected during this review.

### 2.2 Whole-period netting is not measured grid consumption

The summary uses `max(total energy - total solar, 0)` across the selected window. A monthly chart applies that operation separately to each month. These are not always additive.

For the realistic demo workbook:

| Calculation | Net-energy estimate |
| --- | ---: |
| Whole-year netting, as used by summary | 149,776.17 kWh |
| Sum of separately netted months | 151,841.91 kWh |
| Sum of separately netted days | 152,199.35 kWh |

The monthly calculation has 2,065.74 kWh of surplus in some months. Whole-year netting lets that surplus offset demand in other months. That explains the 2,065.74 kWh difference, rather than an addition error.

Even daily netting is only an estimate: daytime solar cannot necessarily meet nighttime demand without storage or a relevant net-metering arrangement. For a real deployment, collect interval-level grid import/export or explicitly agree on a billing/netting policy. Do not silently change the calculation basis and present it as the same measure.

### 2.3 Missing data must not appear to be good performance

Fixed in this pass:

- An empty selection previously assessed zero-water and zero-cost goals as achieved. All goals now return `no_data`, with zero completion, and the UI displays **No data / Not assessed**.
- An empty data-quality report previously retained 18 points from an optional-data allowance. Its score is now zero.
- Missing required energy/water data previously allowed a **System Stable** alert. It now produces **Insufficient Data** instead.
- An invalid sheet could be labeled **ready** even when the entire workbook was rejected. Invalid rows and duplicates now mark the affected sheet **needs_attention**.

Actual measured zero remains distinct from missing data: a genuinely measured zero-cost result can still meet a cost target.

## 3. Workbook Compatibility and Source Totals

| Workbook | Direct import | Energy rows | Water rows | Solar rows | Waste rows |
| --- | --- | ---: | ---: | ---: | ---: |
| `sample_data/college_campus_realistic_demo.xlsx` | Yes | 2,190 | 2,190 | 2,190 | 2,190 |
| `sample_data/campus_resource_dataset_import_ready.xlsx` | Yes | 22 | 22 | 22 | 0 |
| `sample_data/campus_resource_dataset.xlsx` | Yes; water unit needs confirmation | 22 | 22 | 22 | Missing optional sheet |
| `green-campus/campus_resource_dataset.xlsx` | Yes; water unit needs confirmation | 22 | 22 | 22 | 22 |
| `green-campus/AB5_water and energy.xlsx` | No; original presentation-style layout | Not applicable | Not applicable | Not applicable | Not applicable |
| `green-campus/solar_data.xlsx` | No; standalone solar source | Not applicable | Not applicable | 22 source rows | Not applicable |

The last two files need an explicit transformation into the supported import format, not a simple file rename. Backup-directory copies were not included in the six-file inventory above.

Independently calculated totals, reconciled against the API:

| Metric | Realistic demo | Prepared import-ready dataset |
| --- | ---: | ---: |
| Date coverage | 2025-01-01 to 2025-12-31 | 2024-04-01 to 2026-01-01 |
| Gross energy | 359,526.80 kWh | 4,196,128.00 kWh |
| Solar generation | 209,750.63 kWh | 348,087.00 kWh |
| Net energy, whole-window basis | 149,776.17 kWh | 3,848,041.00 kWh |
| Water | 25,391.75 kl | 37,401.00 kl |
| Waste | 20,332.68 kg | No waste readings; arithmetic total 0 |
| Gross carbon | 294,811.98 kg | 3,440,824.96 kg |
| Solar-avoided carbon | 171,995.52 kg | 285,431.34 kg |
| Net carbon | 122,816.46 kg | 3,155,393.62 kg |
| Average monthly energy cost | Rs 99,850.78 | Rs 1,399,287.64 |
| Green Index under existing rules | 6.44 | 20.00 |

Default factors used: 0.82 kg carbon per kWh and Rs 8 per kWh. Carbon divided by 1,000 gives tonnes. These are configurable model assumptions, not factors independently validated for the university in this review.

## 4. Feature-by-Feature Verification

| Area / feature | Verification performed | Result or qualification |
| --- | --- | --- |
| Excel validation | Required/optional sheets, explicit water units, negative/invalid values, duplicate keys, malformed input, empty sheets | Regression tests pass; sheet-level status corrected |
| Excel import | Valid workbook replaces resource data; invalid input preserves existing records; failed audit rolls back import | Pass in isolated tests |
| Overview KPIs | Independent source-cell totals, net energy, carbon, avoided carbon, cost, Green Index | Reconciled for all four compatible workbooks |
| Building selection | Every available building's summary compared with independently filtered rows | Pass |
| Date selection | Inclusive date boundaries, selected second-half windows, reversed dates, invalid dates and maximum date | Pass in tested cases |
| Comparison Analytics | Equal-length immediately preceding date window; previous totals and metric changes | Reconciled; missing baseline cannot establish an improvement percentage |
| Resource charts | Each monthly energy/solar/net point checked against independently grouped source rows | Pass; monthly net need not sum to whole-window net |
| Ranking | Building totals, ordinal ranks, weighted relative efficiency score | Reconciled; score is relative resource pressure, not area-normalized efficiency |
| Forecast modes | Daily 14, monthly 12, seasonal 8, yearly 5 future points; history conservation; finite ordered bounds | Pass for the realistic demo |
| Monthly forecast formula | Cycle-month source mean and saved occupancy multiplier independently recomputed | Reconciled for all four resources |
| Forecast risk | Matching-label projected net energy, cost and carbon checked in every mode | Reconciled; classification is rule-based |
| Seasonal outlook | Included in each bundle with no section exceptions; prior regressions check seasonal boundaries and settings propagation | Additional cases with differently dated resource histories still need dedicated validation |
| Export-ready days | Count recalculated from independently aggregated daily energy and solar | Reconciled for realistic demo; not a grid-export permission |
| Data quality | Source row counts, duplicate count, covered/missing months checked; partial histories and building gaps covered by regressions | Pass for tested cases; quality score does not prove physical accuracy |
| Anomalies and insights | Peer scope and daily aggregation regression checks; successful bundle generation for each forecast mode | Rule execution tested; individual recommendations are not proven causes or guaranteed savings |
| Scenario simulator | 0%, 25%, 100% reductions; independent resource totals, carbon and cost-savings arithmetic | Reconciled; valid-input bounds also tested |
| Settings | Tariff 8 to 12; carbon factor .82 to .5; uniform occupancy .2; original readings unchanged | Recalculation and persistence pass |
| Occupancy | Saved .2 reflected in summary; demand forecast changes; solar forecast unchanged | Pass; activity multiplier is not a measured headcount |
| Strategic goals | Missing data distinguished from a real measured zero; goal display checked in frontend | Corrected and tested |
| Action Board | Action status saved and visible in summary; exactly one new audit event for tested change | Pass; completing an action does not automatically modify meter readings |
| Audit trail | Import/settings/action events; actor-aware service paths; transactional failure regression | Pass locally; not an external tamper-proof audit system |
| Device readiness | Empty registry behavior, UTC timestamps, unknown IDs, missing sync, healthy counts and clear operation | Existing regressions pass; no real sensor traffic tested |
| Access control | Login, duplicate registration, bootstrap concurrency, anonymous denial, viewer write denial | Existing regressions pass locally |
| Excel export | Original date/building/value records compared after export; export re-import restores identical summaries | Pass for all four compatible workbooks |
| Reset | Admin-only reset and zero resource totals checked by regressions | Pass; do not test against production without an approved backup |
| Executive/print/screenshot | Existing UI reviewed in preceding audit; current frontend tests and production build pass | No new physical print/PDF or live Render screenshot check in this numerical pass |

## 5. Calculation Examples

### Net energy, carbon and cost

For a selected period with energy 10,000 kWh and solar 2,000 kWh:

1. Net energy = max(10,000 - 2,000, 0) = **8,000 kWh**.
2. Gross carbon = 10,000 x 0.82 = **8,200 kg**.
3. Solar-avoided carbon = min(10,000, 2,000) x 0.82 = **1,640 kg**.
4. Net carbon = 8,000 x 0.82 = **6,560 kg**, or **6.56 tonnes**.
5. Period electricity cost = 8,000 x Rs 8 = **Rs 64,000**.
6. If the readings span two distinct covered calendar months, displayed monthly average cost = Rs 64,000 / 2 = **Rs 32,000**.

The monthly average uses covered calendar-month buckets, not a prorated utility-billing month. Two days straddling a month boundary can count as two months.

### Green Index

Default benchmarks: net energy 100,000 kWh; water 20,000 kl; waste 30,000 kg. Default weights: energy 50%, water 30%, waste 20%.

For net energy 50,000 kWh, water 10,000 kl, waste 15,000 kg:

1. Each resource is at 50% of its benchmark.
2. Weighted resource pressure = 0.5 x 0.5 + 0.3 x 0.5 + 0.2 x 0.5 = **0.5**.
3. Green Index = 100 x (1 - 0.5) = **50**.

Each resource ratio is capped at 1. Consuming twice the benchmark does not reduce that component further. Missing optional waste is currently included as zero waste pressure, so the resulting score is not evidence that waste is actually zero.

### Comparison

For a ten-day selection, the application compares the previous ten calendar days. A baseline of 1,000 kWh and current value of 1,200 kWh gives a change of **+200 kWh / +20%**. With no baseline readings, a numeric difference from zero is not proof of deterioration or an efficiency change.

### Scenario

Starting with 10,000 kWh energy and 2,000 kWh solar, apply 20% energy reduction and 50% solar increase:

1. Projected energy = 8,000 kWh.
2. Projected solar = 3,000 kWh.
3. Projected net = 5,000 kWh, versus baseline 8,000 kWh.
4. Estimated savings = 3,000 x Rs 8 = **Rs 24,000** for the selected period.
5. Estimated carbon reduction = 3,000 x 0.82 = **2,460 kg**.

This predicts a scenario's arithmetic effect. It does not prove an intervention can deliver those reductions.

## 6. Model Limitations That Need Attention Before Campus Rollout

### High priority

1. **Confirm physical units and reading meaning.** Record whether each value is interval consumption or a cumulative meter counter. Summing cumulative readings would overstate usage. Confirm the water discrepancy against original records.
2. **Choose a consistent energy accounting policy.** Separate gross consumption, self-consumed solar, grid imports, grid exports and storage. Use timestamps aligned to the same interval. Label estimates and measured readings separately.
3. **Separate missing optional readings from measured zero.** Blank waste is allowed but should not earn full waste-performance credit without a visible coverage warning. Likewise, absent solar data is not proof of no solar generation.
4. **Validate forecast accuracy before calling it predictive AI.** Current forecasts use cycle averages, occupancy multipliers and heuristic spread bands. Their arithmetic can be correct while their predictions are poor. Run time-ordered backtests and report MAE/WAPE and interval coverage against a seasonal baseline.

### Medium priority

5. **Normalize benchmarks for the selected period and scope.** Fixed thresholds applied to a whole year and a single month make their Green Index values unsuitable for direct comparison. Define benchmark periods, building areas and relevant occupants.
6. **Use building-specific denominators.** Current per-student and per-area calculations use campus context even when one building is selected. Building rankings compare absolute consumption and do not account for size or function.
7. **Handle sparse and partial histories explicitly.** A monthly reading on the first day is not a complete daily history. Seasonal/yearly buckets can be incomplete. Do not extrapolate partial totals as full seasons or years without coverage rules.
8. **Align resource forecast dates.** Each resource forecasts from its own latest reading. Seasonal outlook requires a dedicated policy/test when solar and energy histories end in different months; risk already matches forecast labels.
9. **Calibrate recommendation savings.** Water and waste recommendations use simple hardcoded savings multipliers, not approved water tariffs or waste-contract rates. Different recommendations may overlap; their savings must not be added as independent guaranteed benefits.
10. **Label risk horizons.** Risk uses the last future forecast point, which differs across daily, monthly, seasonal and yearly modes. This is not necessarily next month's risk.
11. **Improve quality scoring meaning.** The current score measures structural coverage and simple anomalies. It does not establish calibration, accuracy, complete building inventory, continuous sensor uptime, or agreement with bills. Real zeros can also be flagged for review without being invalid.

### Operational improvements

12. Add import preview with source unit confirmation, source file hash, dataset version and recoverable rollback.
13. Add a completeness warning to comparisons when either period lacks equivalent coverage; preserve unavailable values instead of presenting a missing baseline as measured zero.
14. Add configurable warning thresholds consistently across alerts and insights; some alert thresholds currently remain fixed rules.
15. Keep device readiness separate from actual telemetry ingestion. A manually entered last-sync time is not proof that an authenticated device sent a valid reading.
16. Add scheduled backups, restore tests, database migration checks and Render health monitoring. None was verified against production here.
17. Assess audit retention and administrator access. Database audit records are useful history, but privileged database access can alter them unless an external immutable store is added.

## 7. Reproducible Verification

Backend: run `python -m unittest discover -s tests -q` from `green-campus`, with the project's Python dependencies available. Test modules explicitly use isolated database configuration.

Frontend: run `node node_modules/react-scripts/scripts/test.js --watchAll=false --runInBand --no-cache` and `node node_modules/react-scripts/scripts/build.js` from `frontend_green_campus/green-campus-frontend`.

The new independent numerical checks are in `green-campus/tests/test_data_verification.py`. They read original workbook cells and calculate expected sums with Decimal, separately from the application's pandas importer and calculation services. Comparisons allow small display-rounding tolerances. Forecast-bound checks establish internal consistency, not prediction accuracy.

The test run also emitted existing naive-UTC deprecation warnings and a SQLite connection resource warning. The intentional section-failure regression logs an exception while verifying that later dashboard sections still load. These are recorded rather than described as a completely warning-free test run.
