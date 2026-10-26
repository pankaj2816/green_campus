# IEEE Draft Revision: 26 October 2026

This revision aligns the paper with corrected application commit `e5c8f20b15d12eee17de993230343125c0d54d25`. It does not change runtime code or reinterpret the post-fix benchmark as an independent test.

## Changes

- Replaced occupancy-adjusted baseline forecasting with the implemented seasonal-reference baseline and separately labeled occupancy scenario.
- Updated the Green Index equation to normalize available weights and distinguish missing waste from a measured zero. Prepared-workbook B now correctly reports 0.00, partial, instead of the old 20.00.
- Updated coverage scoring, unknown cadence, readiness limits, comparability flags and heuristic spread/risk explanations.
- Added actual BDG2 source qualification: 15 candidate series, 43,000 missing/nonfinite cells, two excluded buildings, three retained buildings, 518 shared complete days, 4,662 daily resource records, no waste observations.
- Added chronological diagnostic protocol, six resource/horizon WAPE comparisons, occupancy ablation evidence, spread coverage and the before/after readiness change.
- Updated verification counts to 55 backend tests, 28 frontend tests and 18 additional public-data workflow check groups. These are not independent field trials or a coverage percentage.
- Added the original BDG2 paper and pinned dataset repository to the bibliography. Retained institutional/data-permission caveats and the documented repository/archive license discrepancy.
- Retained author placeholders and AI-assistance disclosure. No fabricated deployment, savings, acceptance, author approval or plagiarism-check certificate was added.

## Interpretation Boundaries

The revised forecast deliberately matches the previous-week baseline on the paired cases. Small water differences follow output rounding. The same targets were inspected before correction: these results are regression diagnostics, not a new untouched-test claim. Grouped forecast modes passed numerical/structural checks, not horizon-specific predictive validation.

Carbon, INR cost, population and area defaults are not verified values for the anonymous external site. Source meter boundaries, zero runs and physical units still need provider confirmation. Source data files are not redistributed with the paper.

## Remaining Submission Work

Confirm author names/order/affiliations, institutional permissions, dataset license applicability, target conference/page limit, review anonymity and author approval. A new frozen unseen-data study would strengthen predictive claims. The PDF is an IEEE conference-format draft, not an accepted/camera-ready or independently plagiarism-certified paper.

## Document Checks

The final eight-page US-letter PDF compiled successfully with IEEEtran. All nine citation keys resolve; key forecast table values match the saved pre-/post-fix evidence; every font is embedded; page-edge checks found no escaped text. Rendered pages were visually checked, including the equations, result tables and balanced reference columns. TeX reported underfull-spacing warnings but no overfull boxes or unresolved references. These checks do not replace venue-specific PDF eXpress validation or human scientific review.
