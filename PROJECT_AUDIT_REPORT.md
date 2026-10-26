# MGCD Project Audit And Verification

Audit date: 26 October 2026

## Scope

Reviewed the active React frontend, FastAPI routes, database setup, authentication, resource calculations, Excel import/export/reset, forecasting, risk and insights, settings, audit logging, device registry, and Render configuration. Existing sample workbooks, archived backups, proposals, and earlier user documents were preserved.

The audit fixes confirmed behavior problems. It does not certify every possible input, model accuracy, production availability, or compliance with an external sustainability standard.

## Confirmed Issues Fixed

| Area | Previous problem | Result |
| --- | --- | --- |
| Workbook parsing | A corrupt or non-Excel upload could return an internal error. | Invalid workbooks return a readable validation error; workbooks above 10 MB are rejected. |
| Invalid data | Invalid rows or an empty required sheet could replace valid stored data. | Invalid workbooks cannot replace existing readings. Negative/non-finite readings and duplicate timestamps are rejected. |
| Water units | Large `water_kl` values were automatically divided by 1,000. | Explicit `water_kl` remains unchanged; explicitly labeled `water_liters` is converted. |
| Empty export | Exporting an empty table produced sheets without required headers. | All resource sheets retain their columns even when empty. |
| Export timestamps | Readings lost their time-of-day on export. | Export/import preserves ISO timestamps. |
| Excel labels | Labels beginning with `=` could become formulas in an exported workbook. | Labels remain literal text. |
| Audit consistency | Data import committed readings before writing its audit record. | Import and its audit entry commit together or roll back together. |
| Settings validation | Negative costs, zero benchmarks, invalid occupancy months, malformed weights, and unknown action states could be saved. | Invalid settings return validation errors before any save. Weights must total 1. |
| Settings history | Audit entries identified changed sections but not their old/new values. | Changed sections include before/after values; unchanged saves do not create a change event. |
| Date validation | Invalid calendar dates caused internal errors. | Invalid dates return validation errors. Reversed ranges retain their existing normalized behavior; the maximum date no longer overflows. |
| Simulation inputs | Arbitrary reductions could create negative projected consumption. | Reduction percentages are limited to 0-100; solar increases are limited to 0-1,000; non-finite values are rejected. |
| Seasonal calendar | December was grouped with the preceding January/February. | December belongs to the following winter year. |
| Seasonal outlook | Saved occupancy settings were ignored and seasonal totals were described as next-month demand. | Outlook uses saved occupancy, monthly predictions, and the source data's reference date and forecast label. |
| Solar forecasting | Student occupancy directly changed solar production forecasts. | Solar generation is independent of the occupancy demand adjustment. |
| Missing history | A resource without readings received a synthetic zero forecast and uncertainty band. | Resources without history have no forecast values. |
| Risk estimates | Forecast cost/carbon ignored edited settings and solar offset. | Risk estimates use saved cost/emission factors and projected net grid demand. |
| Peer insights | Filtering to one building removed its peers from the comparison. | Peer insights retain the campus comparison set. |
| Anomalies | Readings from different buildings were compared as if they were successive campus totals. | Campus anomaly inputs are aggregated by day. |
| Solar alerts | A missing energy reading was treated as zero demand and could create a false export opportunity. | Export-ready days require both energy and solar records. |
| Data quality | Missing months at the edge of a requested period were ignored. | Coverage uses selected date bounds, reports missing building/month coverage, and bases readiness on actual required-resource history. |
| Duplicate quality checks | Multiple intraday readings or different waste categories were incorrectly flagged as duplicates. | Duplicate checks use full timestamp, building, and waste type. |
| Device registry | Opening an empty registry created demonstration meters with artificial healthy sync data. | Reads return saved devices only. Clearing a registry stays cleared. |
| Device validation | Duplicate names, unknown IDs/statuses, invalid/future timestamps, and mixed timezones could fail unexpectedly. | Invalid entries are rejected, timestamps are normalized to UTC, and device changes and their audit entry share a transaction. |
| Empty dashboard | No readings could appear as a perfect Green Index. | Empty views are marked explicitly; no Green Index or executive assessment is reported without readings. |
| Login feedback | Invalid login responses used the protected-session redirect path. | Wrong-password errors remain visible on the login page. |
| Session expiry | Unauthorized calls could return `null` and be mistaken for success. | Expiry clears the token, notifies the application, and returns a readable error. |
| Loading recovery | Network requests had no timeout and initial failures had no focused retry view. | Requests time out after 90 seconds; users can retry or return to login. |
| Filter races | A slow previous request could overwrite newer filter results. | Only the newest dashboard request can update the view. |
| Upload races | An older workbook validation could approve a newer invalid selection. | Validation results are applied only to the current file. Import/export/reset cannot run concurrently through the UI. |
| Simulation races | Old simulation results could remain visible after input/scope changes. | Results clear when inputs or scope change and old responses are ignored. |
| Printing | Printing left screenshot mode enabled. | The prior presentation state is restored afterward. |
| Mobile layout | Header columns squeezed the title into an unreadable narrow strip. | Header and related workspace grids collapse at narrower widths. |
| Help text | Popovers could clip at panel or viewport edges. | Help is rendered above panels, positioned within the viewport, and closes with Escape. |
| Detail dialog | Keyboard users could leave the open drawer or had no Escape action. | The drawer has dialog semantics, initial keyboard focus, Escape handling, and focus restoration. |
| Carbon visualization | An arbitrary five-tonne gauge maxed out for normal campus data. | A labeled meter shows the remaining grid share of electricity emissions. |
| Readability | White pseudo-element overlays reduced contrast over text and cards. | Decorative overlays were removed. |
| Hosted configuration | A missing hosted database URL silently fell back to temporary local SQLite. | Hosted startup requires `DATABASE_URL`; legacy `postgres://` URLs are normalized. |
| Health checks | Root HEAD requests returned 405 and no database health route existed. | Root accepts HEAD; `/health` checks connectivity and returns 503 when unavailable. |

## Redundant Items Removed

- `react-gauge-chart` and its unused transitive packages, replaced by a standard accessible meter.
- The unused CRA logo source.
- The inactive web-vitals callback module and direct dependency.
- The duplicate token-verification function; authenticated routes keep their existing single current-user dependency.
- Automatic demonstration-device blueprints and seeding on read.
- A duplicate frontend settings request; assumptions responses already include settings.
- Dead tooltip alignment styles and commented imports for a removed AI router.

The main production JavaScript bundle reduced from roughly 290 kB to 180.9 kB gzipped after cleanup and compatible dependency updates.

## Dependency Security Result

The npm advisory check initially reported 60 advisories: 3 critical, 35 high, 12 moderate, and 10 low. Compatible updates were applied within the declared version ranges, with install scripts disabled and without `--force`.

The final check reports 57 advisories: 0 critical, 19 high, 29 moderate, and 9 low. `react-scripts` is the remaining directly declared package flagged by the report; its transitive build/development tooling requires further work. This is not a clean security audit. The static production site does not run the development server, but the build and local development environments still need attention.

Frontend tests and the production build passed after these updates. The resulting lockfile is part of this change set.

## Verification

### Backend Regression Suite

23 automated tests cover:

- Login, duplicate registration, closed registration, and simultaneous first-account creation.
- Authentication and viewer/admin restrictions.
- Import/export/reset and saved settings/audit behavior.
- Rejected corrupt, blank, negative, infinite, and malformed-date workbooks.
- Explicit water units and optional empty waste sheets.
- Import rollback when audit logging fails.
- Empty export column headers and timestamp round trips.
- Invalid settings and simulation values without corrupting saved data.
- Device duplicate names, invalid IDs, timezone offsets, bad dates, clearing, and empty reads.
- Unsynced devices are excluded from the healthy-device count.
- December winter-year grouping, absent history, all forecast granularities, and saved occupancy/cost/emission settings.
- Comparison consistency, partial dashboard section failure, peer context, and anomaly aggregation.
- Empty-data scoring, literal Excel labels, reversed ranges, and the maximum date.

Backend tests use isolated SQLite databases. They do not reset or write to the deployed PostgreSQL database.

### Frontend Regression Suite

13 automated tests cover login rendering, duplicate/invalid authentication feedback, session expiry, network timeouts, bundle mapping, help text, all dashboard views with missing optional sections, retry behavior, stale filter responses, upload validation races, and keyboard dialog controls.

### Browser Checks

Headless Edge checked Overview, Intelligence, Planning Studio, Governance, and Executive Report at 1440 px desktop and 390 px mobile widths using an isolated backend with synthetic data. Checks included login failure and success, JavaScript errors, page-level horizontal overflow, and non-empty chart canvases. Each view was captured for visual inspection.

These checks are not a load test and do not replace testing on physical phones, Safari, assistive technology, or the deployed Render services.

A local review preview is available at `http://localhost:3000`, using an isolated backend at `http://127.0.0.1:8100`. It contains synthetic readings, not the live campus database. Its test account is `audit-admin` / `local-audit-password`. The local audit database is stored only under the ignored `tmp/audit` folder.

## Important Model Limits

1. Forecasts are cycle-average estimates with occupancy adjustments. They are not trained weather models or guaranteed predictions. The displayed range is a heuristic uncertainty band, not a calibrated statistical confidence interval.
2. Net grid energy and export in the main summary are estimates from totals within the selected period. They do not prove instantaneous import/export or meter-level settlement. Real export needs synchronized energy and inverter readings.
3. Building rankings compare absolute resource volumes. Different building sizes, uses, and populations can explain differences; rankings are not an occupancy-adjusted certification.
4. Water and waste recommendations use simple assumed savings. They should not be presented as approved financial returns without site-specific tariffs and measured outcomes.
5. Optional missing resources do not become measured zero consumption. Review data quality before interpreting scores.
6. Readiness is registry metadata. It does not implement device ingestion or verify a physical meter connection.

## Deployment And Operations

- Set `DATABASE_URL`, `SECRET_KEY`, and `CORS_ORIGINS` for the hosted backend.
- Keep the frontend API URL pointed at the backend. SPA routes require the existing rewrite to `index.html`.
- Deploy the backend before the frontend when changing API contracts.
- Use `/health` as a database-connected readiness check. An application cannot stay connected to a database that has expired or been deleted.
- Existing database tables are still initialized with `create_all`; schema migrations remain future work.
- Existing device records are preserved. If old demonstration records exist, an administrator can explicitly remove them in Governance.
- Invalid workbooks now require correction rather than silently dropping bad rows. Review the workbook warnings before import.
- A large value labeled `water_kl` is no longer silently converted. Use `water_liters` when the source unit is litres.

## Recommended Next Work

1. Prioritize the dependency security report. Apply compatible fixes; plan a separate replacement of build tooling where fixes require a migration.
2. Add managed database backups and a restore rehearsal before a campus pilot.
3. Add an administrator user-management page and controlled password-reset workflow.
4. Add forecast backtesting and measured accuracy by resource and horizon before promising prediction quality.
5. Introduce database migrations and explicit telemetry ingestion contracts before physical-device deployment.
6. Consolidate old guides only after agreeing which are the official user guide and technical handover guide; preserve original university proposals and datasets.
