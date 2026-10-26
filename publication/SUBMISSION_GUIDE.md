# MGCD: IEEE Conference Paper Preparation and Submission

Prepared: 26 October 2026.

**Revised evidence-based draft:** The manuscript now describes the corrected implementation at `e5c8f20`, including availability-aware scoring, interval coverage, seasonal-reference forecasts and BDG2 diagnostics. The repeated-data post-fix benchmark is regression evidence, not a fresh unseen-test result. Author details, applicable dataset permissions, venue requirements and human approval still need completion before submission.

## 1. What Has Been Prepared

`main.tex` is an editable manuscript using `\documentclass[conference]{IEEEtran}`. It is a detailed conference-format first draft, not an accepted paper or a certified camera-ready submission. The target conference, page limit, author details, affiliations, and institutional permissions are not yet known.

The readable PDF export is `../output/pdf/MGCD_IEEE_Conference_Draft.pdf`. Its numbered citations, equation numbering, tables and two-column layout are generated from the LaTeX source. Review it alongside this guide before adding authors or adapting to a selected venue.

The revised draft is eight US-letter pages with embedded fonts. It was compiled with Tectonic and visually inspected; this is not IEEE PDF eXpress certification. If a venue permits only six pages, shorten the manuscript without reducing template font sizes or margins. `check_paper.py` checks central evidence values, reference labels, PDF text bounds and embedding; it does not establish originality, peer-review approval or scientific generalization.

Proposed title:

**MGCD: An Auditable Multi-Resource Dashboard for Campus Sustainability Planning**

The paper is positioned as a systems and software-verification contribution. It explains what the prototype implements, how its outputs are calculated, and what local tests establish. It does not claim a new machine-learning algorithm, actual campus savings, certified carbon reporting, or sensor deployment.

The writing uses project-specific methods and concrete findings instead of promotional descriptions. No claim can be made that a text detector will classify it in a particular way. The appropriate route is accurate authorship, careful human revision, original analysis, and the required disclosure of assistance.

## 2. What the Paper Contains

| Section | Purpose |
| --- | --- |
| Abstract | Brief problem, implementation, local evaluation and main findings |
| I. Introduction | Practical problem, research questions and bounded contributions |
| II. Related Work | Campus dashboard research, forecasting evaluation and emissions-accounting context |
| III. System Design | Architecture, database state, import contract, five views and governance |
| IV. Analytical Methods | Totals, netting, carbon, cost, Green Index, relative ranking, occupancy, forecasting, spread bands, risk and simulation |
| V. Evaluation Design | Workbook versions, BDG2 qualification, independent calculations, failure checks and chronological diagnostic protocol |
| VI. Results | Reconciliation, before/after forecast errors, interval coverage, missing-resource effects, unit discrepancy and netting sensitivity |
| VII. Discussion and Limitations | What remains unverified and why it matters |
| VIII. Conclusion | Contribution supported by the actual evidence and next evaluation steps |
| Data and Code Availability | Evaluated source snapshot and provenance restrictions |
| Acknowledgment of AI Assistance | Transparent statement of drafting and technical assistance |
| References | Numbered references to verified sources and the evaluated repository snapshot |

The participant names are not filled in. The current author block is intentionally a placeholder; it must not be submitted unchanged.

## 3. Evidence You Can Defend

The local review loaded four compatible workbook versions into isolated test databases, checked outputs, exported the data, and re-imported it. Independent calculations used source cells and Decimal arithmetic rather than calling the application's calculation functions to create their own expected answers.

- 55 backend tests passed.
- 28 frontend tests passed.
- The frontend production build succeeded.
- The four workbook versions contain 8,980 resource records in aggregate, including related versions of the same source data.
- The demo workbook contains 2,190 records per resource across six building labels for 2025.
- Actual public BDG2 readings were profiled for five header-matched buildings. Two had an entirely empty resource; three yielded 518 shared complete days and 4,662 daily resource records.
- Eighteen public-data API/workflow check groups passed; these overlap test functionality and are not independent field trials.
- Chronological one-/seven-day diagnostics used 44/42 paired targets per resource. One-day electricity WAPE was 22.242% before correction and 6.763% after adopting the previous-week baseline. This matches the baseline, not an advantage over it.
- No utility-bill validation, field intervention, sensor trial, untouched post-selection forecast test or management user study was completed.

The test counts are not a coverage percentage, forecast accuracy, or statistical significance result. Do not describe the workbook versions as four independent campus datasets or say the demonstration readings were measured at the university unless original source evidence confirms that claim.

The manuscript evaluates source snapshot `e5c8f20b15d12eee17de993230343125c0d54d25`. Changes after that snapshot require corresponding evidence updates. Pre-/post-fix JSON snapshots preserve the original results rather than overwriting inconvenient findings.

Detailed evidence: `BDG2_ACTUAL_DATA_VERIFICATION.md`, `BDG2_FIX_VALIDATION.md`, `external_bdg2_results.json`, `external_bdg2_postfix_results.json`, `../DATA_VERIFICATION_REPORT.md` and `../PROJECT_AUDIT_REPORT.md`. The original paper is cited separately from the dataset repository. Source meter units and license applicability still require confirmation.

## 4. What You Need to Provide Next

1. Each author's full publication name, preferred order, department, institution or employer, city, country, email, and ORCID if available.
2. The corresponding author and agreement from every co-author on the author order and contributions.
3. Whether this work was performed as a university project, independent work, employer-supported work, or a formal collaboration.
4. Confirmation that the use of MAHE/MIT names, data, screenshots and any logos is permitted. Dashboard branding does not establish institutional endorsement.
5. The actual origin of each dataset: measured records, manually prepared sample, transformed source, or synthetic demonstration data.
6. Original evidence for the water units and the emission-factor/tariff selection if those will be described as operationally applicable.
7. Funding and conflict-of-interest information, if any. Do not invent a grant or insert a blanket declaration on behalf of authors who have not confirmed it.
8. The target venue once selected, including its official call for papers and author instructions.

Use employer or university affiliations only when accurate and permitted. A participant's employer should not be portrayed as sponsoring or endorsing the project merely because that person is employed there.

## 5. Submission Process

### Step 1: Choose the Research Claim

The current draft's central claim is that an integrated planning workflow can be made inspectable and independently reconciled, while exposing errors that schema validation alone misses. This is a defensible claim from the local tests.

Before submission, discuss whether the target venue accepts applied systems papers at this evaluation stage. A venue centered on new predictive algorithms will generally require a substantially different experiment, including baselines and held-out accuracy. Formatting alone does not make a dashboard description publishable.

### Step 2: Select and Verify the Conference

Start with the official IEEE conference search and the conference's own site. Check subject fit, submission date, review process, page limit, anonymity rules, publication arrangements, registration requirements and presentation policy. Verify claims about IEEE sponsorship and proceedings independently rather than relying only on an invitation email.

Official starting point: [IEEE conference search](https://conferences.ieee.org/conferences_events/conferences/search).

Do not assume every event using an IEEE-looking template is an IEEE-sponsored conference. Do not assume acceptance automatically guarantees indexing. Follow the confirmed event's publication conditions.

### Step 3: Adapt to the Exact Template

The manuscript uses the IEEEtran conference class. The selected venue may require a specific paper size, page limit, anonymous submission format or class option. Use that venue's official template rather than shrinking margins or font size to fit.

Official guidance: [IEEE conference authoring tools and templates](https://conferences.ieeeauthorcenter.ieee.org/write-your-paper/authoring-tools-and-templates/).

If the first draft exceeds the limit, shorten related work, reduce secondary feature descriptions, and retain the calculation definitions, evaluation protocol, main results and limitations. Do not compress tables into unreadable text or remove caveats merely to save space.

For double-blind review, check whether the author block, institutional system name, repository URL and identifying screenshots must be anonymized. Use the venue's instructions; anonymization is not achieved just by deleting author names.

### Step 4: Resolve Data Provenance and Unit Questions

Confirm why original water files contain 37,401,000 under `water_kl`, while the prepared version contains 37,401. Preserve the original files and document any approved transformation.

If provenance cannot be established, retain the current wording: repository sample/demo data, not verified institutional measurements. You can report the discrepancy as an engineering finding, but cannot treat an unconfirmed conversion as ground truth.

Decide whether energy quantities are interval consumption or cumulative meter readings. Confirm that energy and solar are comparable over the same intervals. Explain the intended netting boundary.

### Step 5: Strengthen the Evaluation Where Feasible

The paper already contains a limited chronological diagnostic, occupancy comparison, spread-coverage measurement and local accounting-sensitivity check. The following are additional or stronger experiments, not claims already established:

| Experiment | Practical design | Evidence to report |
| --- | --- | --- |
| Independent forecast baseline comparison | Freeze the model/protocol before acquiring a new site or untouched time window; retain seasonal naive and cycle means | MAE/WAPE by resource/horizon, availability and zero-denominator policy; not recycled inspected test data |
| Spread-band calibration | Use distinct calibration and untouched evaluation windows; report width and horizon-specific coverage | Observed coverage does not itself prove nominal future coverage |
| Verified occupancy predictors | Obtain measured attendance/calendar inputs and compare models with/without them on identical untouched cases | Whether observed occupancy adds predictive value beyond seasonal references |
| Error-injection study | Copies of a known dataset with changed units, duplicates, missing building-months, invalid dates and plausible-but-wrong labels | Which errors are rejected, warned about, or undetected; avoid claiming detection from schema alone |
| Accounting sensitivity | Compare whole-window, monthly, daily and interval netting where valid source resolution permits | Difference in energy, cost and carbon under each explicitly stated policy |
| Single-building pilot | Approved metered data and utility records for one selected building | Coverage, missing intervals, unit checks and bill reconciliation; measured savings only after a justified intervention design |
| Management usability | Approved participants complete predefined tasks with appropriate consent and review requirements | Task completion, errors, time and qualitative feedback; anonymized reporting |

For a forecast experiment, do not use the full series to choose settings and then report a previously inspected period as an untouched test. Do not randomly split time-dependent records across past and future. One year of demonstration data does not support strong generalization claims about all campus seasons.

### Step 6: Human Technical Review

Each author should read and revise the manuscript. Check every equation against the implemented code and every numeric result against the evidence files. A co-author should reproduce at least the principal totals and one scenario independently.

Verify that citations support the nearby statements. Do not add references merely to increase the count, invent a DOI, or describe a cited system as inferior without a fair comparison. The current related-work comparison is descriptive, not a benchmark showing MGCD is better.

Official structure guidance: [IEEE: Structure Your Paper](https://conferences.ieeeauthorcenter.ieee.org/write-your-paper/structure-your-paper/).

### Step 7: Ethics, Originality and AI Disclosure

IEEE states that AI-generated content must be disclosed, including the system used and the relevant scope of assistance. This draft includes an acknowledgment because assistance extended beyond spelling or grammar. Update it accurately after human revision; do not remove it to make the work appear unaided.

Official policy: [IEEE author guidelines for AI-generated content](https://open.ieee.org/author-guidelines-for-artificial-intelligence-ai-generated-text/).

Do not list an AI system as a human author or let an assistant imply that real co-authors approved the final text. Do not submit the same work simultaneously to multiple venues. Follow the venue's originality, prior-publication and preprint policies.

Similarity checking can identify overlapping text for review, but a percentage alone is not a guarantee of originality. Accurate quotations, citations, independent analysis and author accountability matter more than attempts to influence an AI-text detector.

### Step 8: Submit Through the Official Portal

Use the portal linked from the confirmed conference site. Enter the title, abstract, keywords, authors, affiliations, corresponding author and required declarations carefully. The portal may be CMT, EDAS or another system; no specific portal is assumed here.

Upload the correct review PDF, not this guide or a source file with placeholders. Check the rendered uploaded copy, file size, page count, figures, equations, references and anonymity requirements. Retain the submitted version and confirmation email.

### Step 9: Respond to Review

If revisions are invited, prepare a point-by-point response. For each comment, explain the correction and identify where it appears. If an experiment was not possible, say so and narrow the claim instead of fabricating a result. Acceptance is not guaranteed, and a rejection may indicate that more evaluation is needed rather than more decorative formatting.

### Step 10: Prepare the Camera-Ready Version

After acceptance, follow the venue's exact final-paper instructions. Replace author placeholders, remove review-only anonymization as directed, complete copyright steps and meet registration/presentation conditions. Use PDF eXpress if the conference requires it and provides the appropriate conference ID.

Official publication/PDF guidance: [IEEE publishing information for conference authors](https://events.ieee.org/planning-basics/ieee-conference-publications/publishing-information-for-ieee-conference-authors/).

Do not insert an invented IEEE copyright notice, conference name, ISBN, DOI, acceptance date or publication number. These come from the venue at the appropriate stage.

## 6. Language and Claim Checks

| Avoid | Prefer |
| --- | --- |
| "The proposed AI outperforms baselines" | "The corrected method matches a previous-week baseline on repeated chronological diagnostics; independent generalization remains untested" |
| "Tested on four independent campus datasets" | "Checked using four compatible, partly related workbook versions" |
| "The campus saved Rs X" from a scenario | "The scenario estimates Rs X under the stated reductions and tariff" |
| "Carbon-neutral campus" from a low dashboard number | "Estimated electricity-related carbon under the configured model" |
| "Real-time IoT system deployed" from a registry entry | "A device-readiness registry is implemented; live acquisition was not evaluated" |
| "100% accurate" because all tests passed | "All specified regression cases passed within the reported rounding tolerance" |
| "Novel dashboard" without a literature comparison | Describe the specific integrated workflow and independently verified contribution |

## 7. Final Author Checklist

- [ ] All authors agree on names, order, contributions and corresponding author.
- [ ] Affiliations, institutional labels, permissions, funding and conflicts are confirmed.
- [ ] Dataset provenance, water units and reading semantics are documented.
- [ ] No synthetic/demo record is described as measured university data without evidence.
- [ ] Main equations and tables have been independently checked by a human author.
- [ ] The evaluated commit and any subsequent changes are traceable.
- [ ] No future experiment appears in the results as already completed.
- [ ] The current limitations remain visible and proportionate.
- [ ] Bibliography metadata, URLs and nearby claims are checked.
- [ ] AI-use disclosure matches the actual assistance.
- [ ] The selected venue's template, page limit and anonymity requirements are met.
- [ ] The PDF has been inspected and passed the required venue checks.
- [ ] The submission portal and publication conditions have been verified.
- [ ] Every co-author has approved the exact final submission.

## 8. Sources Checked for This Package

IEEE template, structure, publication and AI-assistance links above were checked on 26 October 2026. The manuscript's technical bibliography also includes the primary SmartEle and Algarve campus-system papers, Candanedo et al.'s measured-demand study, the GHG Protocol Scope 2 Guidance, the authors' forecasting textbook, UC San Diego's official dashboards page, and the evaluated code snapshot. These support context and methodology; they are not evidence that MGCD has completed an equivalent field study.
