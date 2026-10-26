# BDG2 Actual-Data Verification for MGCD

Review date: 26 October 2026.

**Historical pre-fix snapshot:** The findings below describe the implementation before the follow-up corrections. See [Post-Fix Validation](BDG2_FIX_VALIDATION.md) for current behavior and measured before/after results. The original evidence JSON is retained unchanged; new results are in `external_bdg2_postfix_results.json`.

## 1. Verdict

Actual published readings were downloaded, examined and tested through MGCD, not just checked by their column names. BDG2 is a **conditional three-resource retrospective test source**, not a verified four-resource campus deployment dataset.

The main findings are:

- Five building names occur in electricity, water and solar headers, but two have an entirely missing resource. Only three qualify for the matched test below.
- The three-building subset supplies 518 shared complete days and 4,662 daily resource records. Eighteen groups of isolated application checks passed.
- The current forecasting method loses to a simple previous-week baseline in all six measured resource/horizon comparisons. Successful calculation checks do not establish prediction accuracy.
- Waste is absent, physical meter boundaries are not independently established, and the previously identified license discrepancy still needs clarification.

No live service, existing user database or forecasting algorithm was modified. These results have not yet been inserted into the IEEE draft. No files were pushed for this verification request.

## 2. Source and Integrity

Source: [Building Data Genome Project 2](https://github.com/buds-lab/building-data-genome-project-2), pinned commit `9b97ccbe90096aff42ed4fd6493bf7ae692d7118`.

Four original files were downloaded, totaling 190,896,410 bytes. Every file matched its published SHA-256 content hash.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| electricity.csv | 174,239,039 | `039d909d8981e2d69eaeb366144e6ab7e84fa5e7e216aee42bddd95384a66418` |
| water.csv | 15,641,460 | `fa51cc382f3edc185bd6e232631c01b41ebd05adc51b5af5e5026d7beffdfd01` |
| solar.csv | 743,887 | `efa65f32b1661b733bd29818c097a2ddc2f36034bdce7bd757d87bfe13af0ead` |
| metadata.csv | 272,024 | `992d0b29f24f96ad4332bc4dbb534b7bdd7dd2689aad093f94e93068ecddca02` |

The files contain 1,578 electricity, 146 water and five solar identifier columns. This audit profiles **all hourly rows for the five shared candidates**, not every meter in the entire release.

Each resource file has 17,544 hourly timestamp labels, from 1 January 2016 00:00 to 31 December 2017 23:00. There are no duplicate or missing hourly labels in these files. However, a timestamp label does not guarantee a measured value.

The selected 15 series contain 43,000 missing/nonfinite cells out of 263,160 cells. There are no finite negative readings in these selected series. Publisher-released "raw" files have already undergone publisher processing; this is not independent instrument calibration.

## 3. Actual Reading Quality

Names below omit the common `Bobcat_` prefix. Each resource series has 17,544 positions.

| Building | Resource | Missing/nonfinite | Zero readings | Longest missing run, hours | Longest zero run, hours |
| --- | --- | ---: | ---: | ---: | ---: |
| education_Alissa | Electricity | 31 | 1,009 | 7 | 661 |
| education_Alissa | Water | 17,544 | 0 | 17,544 | 0 |
| education_Alissa | Solar | 48 | 9,738 | 20 | 661 |
| education_Coleman | Electricity | 1,366 | 20 | 662 | 11 |
| education_Coleman | Water | 22 | 2,986 | 8 | 661 |
| education_Coleman | Solar | 23 | 4,315 | 7 | 1,887 |
| education_Dylan | Electricity | 2,501 | 45 | 699 | 45 |
| education_Dylan | Water | 31 | 3,809 | 9 | 1,599 |
| education_Dylan | Solar | 21 | 6,199 | 8 | 699 |
| office_Justine | Electricity | 3,693 | 17 | 2,563 | 8 |
| office_Justine | Water | 27 | 11,379 | 9 | 668 |
| office_Justine | Solar | 17,544 | 0 | 17,544 | 0 |
| other_Timothy | Electricity | 25 | 1,045 | 8 | 661 |
| other_Timothy | Water | 104 | 14,893 | 7 | 677 |
| other_Timothy | Solar | 20 | 3,601 | 7 | 661 |

**Exclude Alissa from matched three-resource evaluation:** its water series is entirely empty. **Exclude Justine:** its solar series is entirely empty. There is no complete three-resource day shared by all five candidates.

Additional diagnostics require investigation, not automatic deletion:

- Coleman has 1,887 consecutive zero solar hours, approximately 79 days. Dylan has 1,599 consecutive zero water hours. These could reflect operational events, unavailable measurements encoded as zero, or other causes; the files alone do not prove the cause.
- Coleman water reaches 194,569.2401 liters in one hour on 11 July 2017 at 13:00. This is a flagged extreme, not a confirmed erroneous reading.
- Alissa assigns approximately one-third of its positive solar energy to local hours 22:00 through 04:00. Timestamp conventions and meter interpretation need checking before using this series physically.
- Timothy has 14,893 zero hourly water readings. Zero is retained as a number but is not certified as genuine zero use.

Full maxima, largest observations, zero runs, missing runs and diagnostic flags are recorded in `external_bdg2_results.json`.

## 4. Transparent Test-Data Preparation

Published meter documentation specifies energy in kWh and water volume in liters. Water was divided by 1,000 to obtain kl. See [meter definitions](https://github.com/buds-lab/building-data-genome-project-2/wiki/Meters-data-features). These published units were followed, not independently calibrated.

Preparation rules:

1. A building-day qualifies only when each of electricity, water and solar has 24 finite, nonnegative hourly readings.
2. Retain buildings with at least 180 such complete days. This is an engineering eligibility threshold, not proof of statistical sufficiency.
3. Keep only complete days shared by the eligible buildings; sum hourly interval quantities into daily quantities.
4. Do not interpolate, convert missing readings to zero, clip negative readings or remove flagged extremes. Retain numeric zeros and document them.
5. Import electricity, water and solar, leaving optional waste empty. Never invent waste observations.

| Eligible building | Individually complete three-resource days |
| --- | ---: |
| Bobcat_education_Coleman | 649 |
| Bobcat_education_Dylan | 600 |
| Bobcat_other_Timothy | 649 |

Their intersection contains **518 days, or 70.862% of the original 731 source days**. These are noncontiguous dates between 3 January 2016 and 10 December 2017, touching all 24 calendar months. They are not two complete years of observations. The 24-reading rule follows released timestamp labels and does not certify daylight-saving or timezone correctness.

Metadata identifies an anonymous Bobcat site with US/Mountain timezone; it does not establish a named university or MAHE origin. Occupant fields are zero in these candidate metadata rows and must not be treated as verified zero populations. Default MGCD student counts, floor area and academic activity factors are not measurements for this site.

## 5. Application Verification With These Readings

A workbook was generated in memory from the selected daily readings and passed through the actual validation, import and export APIs. Tests used an isolated in-memory SQLite database. Imported counts were 1,554 electricity, 1,554 water, 1,554 solar and zero waste records: **4,662 records total**.

All 18 verification groups passed:

1. Workbook validation with empty optional waste.
2. Actual API import and all resource counts.
3. Independently computed aggregate totals, carbon, cost and Green Index arithmetic.
4. Independently computed summaries for each eligible building.
5. Date filters, reversed-date validation and previous-period differences.
6. Every monthly electricity, solar and net-energy chart point.
7. Building rankings and relative-efficiency arithmetic.
8. Daily dashboard bundle: history, horizon, bounds, risk arithmetic and absent-waste handling.
9. Monthly bundle with the same structural/arithmetic checks.
10. Seasonal bundle with the same structural/arithmetic checks.
11. Yearly bundle with the same structural/arithmetic checks.
12. Independently calculated export-ready day count.
13. Data-quality counts and explicit optional-waste absence.
14. Scenarios at 0%, 25% and 100% against independently computed totals.
15. Actual Excel export, every preserved date/building/value, and re-import.
16. Settings/action persistence, recalculation, unchanged raw totals and audit events.
17. Duplicate input-row rejection without erasing the loaded dataset.
18. Reset and empty-data state in the isolated database.

Summary/bucket checks use a 0.011 rounding tolerance, selected derived differences 0.02, and exported readings 0.0000001. These are API and numerical checks, not a browser visual audit, device integration test or proof of every possible feature/corner case.

### Selected-Cohort Totals

| Quantity | Verified application result | Meaning/limitation |
| --- | ---: | --- |
| Electricity | 3,393,627.19 kWh | Sum over retained building-days only |
| Solar | 166,220.59 kWh | Sum over the same retained building-days |
| Water | 42,950.05 kl | Published liters converted to kl |
| Application net energy | 3,227,406.60 kWh | Implemented electricity-minus-solar accounting |
| Application carbon | 2,646,473.41 kg | Hypothetical default 0.82 kg/kWh factor |
| Application monthly energy cost | Rs 1,075,802.20 | Hypothetical Rs 8/kWh, divided over 24 touched months |
| Application Green Index | 20.00 | Default benchmark score, not validated site sustainability |
| Aggregate export-ready days | 0 | Daily aggregate solar does not exceed electricity |

Carbon and cost here test formulas, not actual US-campus emissions or bills. Missing days make touched-month averages different from full-month bills. Green Index reaches 20 under current default caps and missing-waste handling: energy/water pressure saturates while absent waste produces zero waste pressure. **Absent waste is not evidence of excellent waste performance.** Per-student, per-area and goal metrics similarly require site-specific metadata before physical interpretation.

Whole-period, daily-campus and hourly-campus net-energy results agree for this subset because hourly aggregate solar never exceeds aggregate electricity. However, Timothy has 1,950 retained hours with solar exceeding its own electricity. This demonstrates why building boundaries, time intervals and self-consumption assumptions matter. It does not independently establish whether electricity represents gross demand or grid imports.

## 6. Data-Quality Score Limitation

On the filtered imported subset, MGCD reports quality 97.6/100, trust "High", 24 history months and forecast readiness 100%. The checks correctly recognize waste as optional and missing.

These scores must not be interpreted as 97.6% sensor accuracy or 100% prediction accuracy. Month-level coverage can be complete while day-level coverage is incomplete. The filtered cohort retains only 70.862% of source days, and zeros remain. The score is a heuristic on imported records, not certification of the original source.

Recommended improvement: show expected-versus-observed daily/hourly coverage, longest gaps and per-resource missingness separately; label forecast readiness as a history-availability indicator. Missing waste should be shown as unavailable rather than silently interpreted as zero environmental impact.

## 7. Forecasts Tested Against Later Observations

This was a chronological expanding-window backtest of the three-building daily aggregate. The first 180 available complete days form warm-up history; origins occur every seventh available day. Targets are one and seven calendar days later. Only observations dated at or before the origin enter training. A case is included only when the target and previous-week reference observation exist, using identical cases for all compared methods. No parameters were tuned on these cases.

Comparators are the current MGCD method, its cycle-mean version with all occupancy factors set to 1, and a seasonal-naive method predicting the target from the same weekday one week earlier.

WAPE = 100 x sum(abs(prediction - observation)) / sum(abs(observation)). Lower is better. Coverage is the percentage of observed targets inside the current forecast spread band; no nominal statistical confidence level is asserted.

| Resource | Horizon | Paired cases | MGCD WAPE | No-occupancy cycle WAPE | Previous-week WAPE | Current band coverage |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Electricity | 1 day | 44 | 22.242% | 7.464% | 6.763% | 13.636% |
| Electricity | 7 days | 42 | 21.535% | 6.903% | 5.774% | 14.286% |
| Water | 1 day | 44 | 51.612% | 52.142% | 12.595% | 38.636% |
| Water | 7 days | 42 | 46.540% | 48.412% | 12.806% | 38.095% |
| Solar | 1 day | 44 | 44.243% | 44.243% | 34.132% | 54.545% |
| Solar | 7 days | 42 | 41.757% | 41.757% | 28.807% | 61.905% |

**The previous-week baseline is better in all six comparisons.** Default occupancy adjustment substantially worsens electricity prediction compared with neutral factors. This external site does not have verified MGCD academic occupancy factors. Water and solar also need improved modeling; switching off occupancy alone is not a general solution.

MAE and RMSE are retained in the evidence JSON. For example, one-day electricity MAE is 1,306.2318 kWh for MGCD versus 397.1591 kWh for the previous-week baseline.

Limitations: this is one anonymous-site aggregate, selected retrospectively for quality using the full time window. It is not a prospective availability test. Missing days are not imputed. Results do not establish significance or generalization to MAHE. Only daily 1-/7-day predictive accuracy was measured; monthly/seasonal/yearly checks above verify structure and arithmetic, not out-of-sample accuracy at those horizons.

## 8. Licensing and Publication Decision

The [repository license](https://github.com/buds-lab/building-data-genome-project-2/blob/9b97ccbe90096aff42ed4fd6493bf7ae692d7118/LICENSE) uses Attribution-ShareAlike wording, while [Zenodo archive metadata](https://zenodo.org/records/3887306) reports CC BY 4.0. Numeric verification does not resolve that discrepancy. Confirm the applicable license/version and attribution obligations before redistributing adapted records or bundling them with a paid service. The original dataset paper is [Miller et al., Scientific Data](https://doi.org/10.1038/s41597-020-00712-x).

Suitable claims after provenance/license review: a software workflow evaluation with a qualified public three-resource subset; explicit missing-data rules; transparent baseline comparisons; documented limitations.

Unsuitable claims: live MAHE validation, matched four-resource measurements, calibrated confidence intervals, demonstrated superiority of the present predictor, measured savings, or a verified full-campus carbon inventory.

Before a stronger forecasting claim, use a separate development/validation/test protocol, retain a seasonal-naive baseline, learn or disable unsupported occupancy assumptions, calibrate prediction intervals on held-out data and report day-level availability. Do not tune on these reported test cases and present the resulting score as untouched-test performance.

## 9. Evidence and Reproduction

- `verify_external_bdg2.py`: download/hash, profiling, isolated API and backtest stages.
- `external_bdg2_results.json`: exact measurements, checks and metrics.
- `OPEN_DATASET_ASSESSMENT.md`: comparison with other sources and licensing evidence.
- Original downloads and intermediate daily CSV files are local in `../tmp/external-data/bdg2/` relative to the repository root's publication directory; this ignored data directory is not intended for Git distribution.

From the repository root in PowerShell:

```powershell
$env:PYTHONPATH = 'D:\working_green_campus\.pydeps'
python publication/verify_external_bdg2.py download
python publication/verify_external_bdg2.py profile
python publication/verify_external_bdg2.py api
python publication/verify_external_bdg2.py backtest
```

The download stage rechecks cached files against the pinned hashes. Dependencies must be installed; this is a local verification harness, not a production deployment command. The API stage intentionally creates and resets only its isolated test database.
