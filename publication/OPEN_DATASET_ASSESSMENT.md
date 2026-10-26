# Public Dataset Assessment for MGCD

Review date: 26 October 2026.

**Actual-data follow-up:** The metadata assessment below has now been followed by downloading the pinned BDG2 files and testing actual readings. See [BDG2 Actual-Data Verification](BDG2_ACTUAL_DATA_VERIFICATION.md) and `external_bdg2_results.json`. Two of the five header-matched candidates have an entirely empty resource; the qualified cohort has three buildings and 518 shared complete days. Eighteen isolated application verification groups passed, but the current predictor lost to a previous-week baseline in all six daily backtest comparisons. Licensing and physical-meter interpretation remain conditional.

## 1. Decision Summary

Public measured data can strengthen the paper without a live MAHE deployment. However, neither a public download link nor the words "open dataset" establish unrestricted reuse. The data license must be checked separately from the paper and software licenses.

The revised recommendation is:

1. **BDG2 is the best technical candidate for matched electricity, water and solar evaluation**, subject to resolving a license discrepancy and checking actual overlapping valid readings.
2. **Kitakyushu is the clearest CC BY 4.0 campus electricity/solar candidate** among the sources reviewed, but does not establish potable-water consumption or waste coverage.
3. **HKUST is a strong CC0 electricity-only candidate**, not a complete multi-resource dataset.
4. **UNICON is useful for electricity/water research, but its publisher API reports CC BY-NC-SA 4.0.** It should not be the default data packaged with a later paid university service without an appropriate permission review.
5. **Waste remains a separate evidence gap.** A reusable municipal weight dataset can test waste processing separately, but cannot be relabeled as waste measured at a BDG2 or MAHE building.

No single source with verified, matched electricity, water, solar and waste records for the same buildings and dates has been established in this review. This does not prove that no such source exists.

At the metadata-assessment stage, public datasets had not been imported. The follow-up imported a derived BDG2 subset into an isolated in-memory MGCD test database only. No existing user data or application calculation was changed.

## 2. What Was Actually Checked

- Original dataset/research pages and repository documentation.
- Publisher API metadata for UNICON, BDG2's Zenodo archive, HKUST, Kitakyushu and Dublin waste.
- BDG2's actual GitHub license file, including its hash.
- The first CSV line from each BDG2 raw electricity, water and solar file.
- Exact building-identifier intersections between those headers.
- File sizes and licensing/access limitations where available.

This section describes the original metadata/header review, not a row-level audit. The linked actual-data follow-up now covers date overlap, missing/negative readings, documented unit conversion, application arithmetic and preliminary forecast performance for the five selected candidates. Physical calibration and meter boundaries remain unverified.

Reproducible evidence is saved in `dataset_metadata_review.json`. The script `inspect_open_dataset_metadata.py` reads public metadata and bounded CSV headers, not complete meter datasets. Re-running it may report a newer source revision or changed metadata; keep the current evidence snapshot with any resulting experiment.

## 3. Comparison

| Source | Electricity | Water consumption volume | Solar generation | Waste mass | License evidence | Overall role |
| --- | --- | --- | --- | --- | --- | --- |
| Building Data Genome 2 | Yes | Yes, selected volume meters | Yes, five solar identifiers found | No | Zenodo metadata: CC BY 4.0; GitHub license: ShareAlike wording. Needs clarification/version discipline | Best conditional three-resource candidate |
| UNICON | Yes | Yes | Not established in published resource list | No | Kaggle data metadata: CC BY-NC-SA 4.0 | Noncommercial electricity/water benchmark, subject to terms |
| Kitakyushu campus energy station | Yes, load/import and generation categories | No potable-water volume verified; hot-water load is not equivalent | Yes | No | Original Figshare v2 metadata: CC BY 4.0 | Campus energy accounting and PV study |
| HKUST campus smart meters | Yes | Not part of the inspected electricity dataset | Not established | No | Dryad API: CC0-1.0, current metadata version 5 | Electricity forecasting/anomaly benchmark |
| Dublin City Council AES green waste | No | No | No | Yes, dated green-waste weights | Publisher CKAN metadata: Creative Commons Attribution; generic license link does not establish version | Separate municipal waste-module case study |

"Not established" is not a claim that the institution has no such resource. It means that coverage has not been verified for the specific released dataset.

### A. Building Data Genome 2: Best Technical Match, Conditional License Approval

The published resource covers 2016--2017 at hourly resolution. Its repository documents energy meters in kWh and volume meters in liters. Heating/cooling-water energy must not be confused with water-volume consumption. The source also distinguishes raw, cleaned and competition data, which do not have interchangeable unit and missing-value conventions.

Primary documentation: [BDG2 repository](https://github.com/buds-lab/building-data-genome-project-2), [meter definitions](https://github.com/buds-lab/building-data-genome-project-2/wiki/Meters-data-features).

**Actual raw-header inspection** at repository commit `9b97ccbe90096aff42ed4fd6493bf7ae692d7118` found:

| File | Meter/building identifier columns |
| --- | ---: |
| Electricity | 1,578 |
| Water | 146 |
| Solar | 5 |
| Electricity and water intersection | 124 |
| Electricity, water and solar intersection | 5 |

The five three-resource candidates are:

- `Bobcat_education_Alissa`
- `Bobcat_education_Coleman`
- `Bobcat_education_Dylan`
- `Bobcat_office_Justine`
- `Bobcat_other_Timothy`

This is an independently computed header match, not proof that all three resources have complete simultaneous readings. The next check must measure overlapping valid intervals and confirm that electricity is gross demand rather than an already-netted import quantity. Matching names alone do not establish the physical meter boundary.

**License discrepancy:** the archived release metadata reports `cc-by-4.0`, while the inspected repository license begins "Attribution-ShareAlike 4.0 Unported." The latter is unusual wording and should not be silently normalized into a different license. Preserve both notices and seek clarification from the authors or an institutional licensing specialist before distributing adapted data. A third-party portal describing the data as CC BY does not resolve this discrepancy.

Sources: [archived v1.0 release](https://zenodo.org/records/3887306), [archive metadata](https://zenodo.org/api/records/3887306), [pinned repository license](https://raw.githubusercontent.com/buds-lab/building-data-genome-project-2/9b97ccbe90096aff42ed4fd6493bf7ae692d7118/LICENSE).

The archived ZIP is approximately 595 MB. Repository CSV entries are Git LFS pointers: downloading a tiny pointer file is not downloading its measurements. A release archive, correct LFS download or publisher-supported data endpoint is needed.

**Decision:** proceed to a small, provenance-preserving local feasibility check, but do not yet describe the selected release as cleared for unrestricted redistribution or claim complete three-resource coverage.

### B. UNICON: Useful Research Data, Not an Unrestricted Default

UNICON describes electricity, gas and water for five La Trobe campuses, 2018--2021, with electricity and water at 15-minute resolution. Pandemic shutdowns are an important regime change, not just ordinary seasonal variation. The GitHub repository contains a subset and directs users to the full Kaggle release.

The public publisher API returned:

- Title: `UNICON Energy Consumption Dataset`.
- Version: 1.
- Data license: **CC BY-NC-SA 4.0**.
- Size: 950,884,462 bytes, approximately 951 MB decimal.

Sources: [authors' repository](https://github.com/CDAC-lab/UNICON), [dataset page](https://www.kaggle.com/datasets/cdaclab/unicon), [public metadata endpoint](https://www.kaggle.com/api/v1/datasets/view/cdaclab/unicon).

The Apache 2.0 notice on an associated validation notebook applies to that notebook, not automatically to the underlying data. The noncommercial and ShareAlike conditions must be considered for the intended use. Do not infer permission for a paid software deployment merely because academic citation is provided.

**Decision:** retain as a conditional research benchmark; not the first choice for a reusable dataset bundled with commercial services. Solar and waste are not verified components of this release.

### C. Kitakyushu: Clear CC BY License, Different Physical System

The original Figshare API identifies version 2 of `20-year Data of Energy Station at Kitakyushu Campus`, DOI `10.6084/m9.figshare.24978645.v2`, under **CC BY 4.0**. File categories include electrical load, power generation, gas usage, heat recovery, building thermal loads and weather. Selected archives are only a few MB, making a bounded pilot practical.

The associated study describes grid imports, PV generation and CHP equipment. Therefore, total campus electricity cannot be reconstructed by treating grid import as gross energy and subtracting solar again. All generation/load boundaries need to be understood first. Hot-water heating load is not evidence of drinking-water consumption in kl.

Sources: [original dataset](https://doi.org/10.6084/m9.figshare.24978645.v2), [publisher metadata](https://api.figshare.com/v2/articles/24978645), [data descriptor](https://pmc.ncbi.nlm.nih.gov/articles/PMC11659301/).

**Decision:** strong for a separate electricity/solar accounting study after variable inspection; not a four-resource drop-in workbook. The current MGCD import requires water, so absent water must be supported explicitly or evaluated outside that full-workbook path. It must not be fabricated just to pass validation.

### D. HKUST: Clear CC0 Electricity Benchmark

The HKUST release describes campus electricity data over 2.5 years with more than 1,400 meters and over 20 buildings. The inspected Dryad API reports **CC0-1.0** and metadata version 5. The dataset landing page lists an archive of approximately 1.43 GB. Metadata version and individual file version should both be recorded when downloading.

Sources: [Dryad record](https://datadryad.org/dataset/doi:10.5061/dryad.k3j9kd5h6), [record metadata](https://datadryad.org/api/v2/datasets/doi%3A10.5061%2Fdryad.k3j9kd5h6), [Dryad reuse terms](https://datadryad.org/terms).

Meter hierarchy matters: adding whole-building meters and their child equipment meters can double-count electricity. Select a declared level before aggregation. CC0 does not remove the scientific need to cite the original authors and dataset.

**Decision:** good licensing and a strong electricity-focused external test, but not evidence for water, waste or solar functionality. Normal MGCD workbook import would still require an appropriate treatment of absent water.

### E. Waste: Usable Separate Source, Not a Matched Campus Stream

Dublin City Council publishes dated AES garden/park waste records in CSV format. The publisher identifies weights as **tonnes**, not kg. Its metadata lists Creative Commons Attribution, with a generic attribution-license link; the exact version should be confirmed before a redistributed derivative is published.

Sources: [publisher dataset](https://data.smartdublin.ie/dataset/waste-data-aes-bord-na-mona), [publisher metadata](https://data.smartdublin.ie/api/3/action/package_show?id=waste-data-aes-bord-na-mona).

These records can test reading dates, weight conversion, aggregation, categories and export. They are not university waste, may contain multiple collection tickets on one date, and cannot be assigned to a real BDG2 building. Tickets need explicit aggregation or a richer event key rather than silent duplicate deletion.

For a separate waste-module case study, tonnes convert to kg by multiplying by 1,000. Report source geography, collection boundary, period and any aggregation. Do not merge unrelated records into a claimed measured campus Green Index.

Other inspected search leads included campus waste-sorting scores and waste-image datasets. Those are not measurements of waste mass over time. A publicly readable university annual waste PDF without an explicit reuse grant is also not automatically an approved redistributable dataset.

## 4. License Meaning for This Project

For datasets, "open data license" is more precise than "open-source license." Data, software, article text, figures and university branding may have different permissions.

| Label | Practical screening implication |
| --- | --- |
| CC0 | Broad reuse is intended; scholarly citation remains appropriate |
| CC BY 4.0 | Attribute the source, link the license and identify modifications; commercial reuse is permitted subject to the terms |
| CC BY-SA | Attribution plus ShareAlike obligations for distributed adapted material; retain the precise version and notices |
| CC BY-NC-SA | Includes noncommercial restrictions; not an unrestricted commercial-use dataset |
| No license or inconsistent notices | Do not assume permission merely from public access; obtain clarification |

Official explanations: [CC0](https://creativecommons.org/publicdomain/zero/1.0/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

Do not assume a data license automatically determines the license of the entire MGCD software or an IEEE article. The type of material reused, modifications and publication terms matter. This review records publisher statements and flags conflicts; it is not a formal legal clearance.

## 5. Quality Gates Before Selecting Data for the Paper

1. **Freeze provenance.** Save original URL, dataset DOI/version, source commit if applicable, retrieval time, file hashes and exact license evidence.
2. **Verify matching scope.** Resource records must refer to the same building/campus boundary, not merely to geographically nearby meters or similar names.
3. **Verify physical quantities.** Distinguish kWh from kW, liters from kl, tonnes from kg, thermal energy from water volume, and cumulative counters from interval consumption. Do not infer energy from electrical power without the sampling interval.
4. **Verify chronology.** Inspect valid overlap, missing/duplicate timestamps, timezone and daylight-saving transitions. Local timestamp strings may be ambiguous during clock changes.
5. **Verify meter hierarchy.** Do not sum a parent meter together with its child submeters. Confirm whether electricity already includes or excludes solar.
6. **Profile missingness.** Report coverage by resource, building and period. A zero may be a real reading, shutdown or meter failure. Do not blanket-fill missing values with zero.
7. **Define aggregation.** Sum interval energy/volume/mass, integrate power where appropriate, and preserve the distinction between whole-period and interval netting. Store transformations separately from originals.
8. **Separate scope-limited evaluations.** A dataset without waste cannot demonstrate measured waste performance. A municipal waste test does not validate a campus-wide combined score.
9. **Backtest forecasts.** Use past-only training and chronological holdouts. Compare simple baselines and occupancy-adjusted forecasts, report horizon-specific errors, and test displayed spread-band coverage.
10. **Use applicable assumptions.** The current Indian-rupee tariff and emission factor are not evidence of actual costs or emissions at a foreign campus. Use documented local/year-specific assumptions or label outputs as hypothetical scenarios.
11. **Handle missing resources honestly.** Before using an incomplete real dataset, avoid a composite Green Index that awards zero-pressure credit to unmeasured waste. Display partial coverage or an unassessed score under an explicitly documented policy.
12. **Preserve source identity.** External data must remain labeled as external. Neither a brand change nor a renamed building turns it into measured MAHE data.

## 6. Recommended Evaluation Plan

### Main Three-Resource Experiment

Use the five matched BDG2 identifiers as candidates only. Resolve the release/license discrepancy, inspect real overlap and meter semantics, then select the usable subset. Evaluate electricity, water and solar totals, filters, comparisons, scenarios and forecasting with declared missingness. Waste remains unavailable.

If the license discrepancy cannot be satisfactorily resolved, use the clearly licensed Kitakyushu data for a narrower campus energy/PV experiment and HKUST for an independent electricity benchmark. This narrows the paper's empirical claims rather than creating a false complete dataset.

### Separate Waste Experiment

Use an appropriately licensed weight-over-time dataset for the waste pipeline alone, explicitly identified as municipal if Dublin data are selected. Confirm the exact reuse terms first. This can demonstrate conversion and processing, not a measured campus-wide sustainability result.

### Existing Demo Data

Keep the existing workbook for UI demonstrations and deterministic corner cases. Clearly distinguish it from published measured-data experiments in the application, result tables and manuscript.

### Paper Update

Only after running the experiments should the manuscript report external dataset results. Cite both the original dataset/version and its associated research paper. Report what was actually evaluated and leave unavailable resources unclaimed. No results from these public datasets have been added to the existing six-page draft yet.
