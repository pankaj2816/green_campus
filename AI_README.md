# AI_README

This file is a fast handoff guide for any AI agent, teammate, or automation that needs to understand this repository without reading every file first.

It explains:

- what the project is
- what the main folders do
- how backend and frontend are connected
- what the most important files are
- what major features already exist
- what assumptions and known limitations matter

---

## 1. Project purpose

This repository contains a **Green Campus sustainability intelligence platform**.

It is designed for a college / university campus and tracks:

- energy consumption
- water consumption
- waste generation
- solar generation
- carbon impact
- AI-style forecasting
- AI risk analysis
- anomalies, opportunities, and recommendations
- scenario simulation
- comparison analytics
- occupancy-aware planning

Current branding in the frontend:

- **Manipal Institute of Technology, Karnataka**

This project currently works well as:

- a demo platform
- a dashboard/reporting platform
- a planning and sustainability presentation platform

It is partly analytics-ready and can be extended into a real-time IoT platform later.

---

## 2. Main folders

### Root

- `D:\working_green_campus`
  Main git repository root

### Backend

- `D:\working_green_campus\green-campus`
  FastAPI backend

### Frontend

- `D:\working_green_campus\frontend_green_campus\green-campus-frontend`
  React frontend dashboard

### Demo / supporting docs

- `D:\working_green_campus\demo_assets`
  presentation and demo-generated assets
- `D:\working_green_campus\sample_data`
  example Excel datasets

### Main docs already in repo

- `D:\working_green_campus\PROJECT_GUIDE.md`
- `D:\working_green_campus\SECTION_GUIDE.md`
- `D:\working_green_campus\REAL_WORLD_IMPLEMENTATION_GUIDE.html`
- `D:\working_green_campus\AI_README.md`

Ignore for normal active app work:

- `D:\working_green_campus\backup`

---

## 3. Tech stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL / SQLite-style SQLAlchemy support depending on env
- pandas for Excel import
- passlib / auth utilities

### Frontend

- React
- CRA-based frontend
- fetch-based API layer
- inline-style-heavy UI with shared config and global CSS polish in `App.css`

### Deployment

- GitHub repo
- Render backend + frontend used in practice

---

## 4. How to run locally

### Backend

Working directory:

- `D:\working_green_campus\green-campus`

Command:

```powershell
python -m uvicorn app.main:app --reload
```

Backend URL:

- `http://127.0.0.1:8000`

### Frontend

Working directory:

- `D:\working_green_campus\frontend_green_campus\green-campus-frontend`

Command:

```powershell
npm start
```

Frontend URL:

- `http://localhost:3000`

### Useful verification commands

Backend compile check:

```powershell
python -m compileall D:\working_green_campus\green-campus\app
```

Frontend production build:

```powershell
cd D:\working_green_campus\frontend_green_campus\green-campus-frontend
npm run build
```

---

## 5. Backend structure

Main backend entry:

- `D:\working_green_campus\green-campus\app\main.py`

Important core files:

- `database.py`
  database engine + session creation
- `models.py`
  SQLAlchemy models
- `schemas.py`
  pydantic schemas
- `crud.py`
  legacy/basic DB helpers

### Backend folders

#### `app\routers`

Contains HTTP routes.

Important routers:

- `auth.py`
  register/login + token auth
- `dashboard.py`
  summary, building performance, comparison analytics
- `energy.py`
  energy trends and energy-related aggregations
- `data_import.py`
  Excel validation, import, export, reset
- `insights.py`
  exposes anomalies / opportunities / recommendations
- `forecast.py`
  AI forecast endpoint
- `ai_risk.py`
  AI risk endpoint
- `seasonal.py`
  seasonal outlook endpoint
- `simulation.py`
  scenario simulator endpoint
- `meta.py`
  assumptions, settings, and editable planning metadata
- `alerts.py` or alert-related route files
  alert center and export-ready day analysis

#### `app\services`

Contains business logic.

Important service files:

- `metrics_config.py`
  central constants and assumptions
- `carbon.py`
  carbon calculations
- `date_filters.py`
  reusable date-range logic
- `settings_service.py`
  saved settings for occupancy, campus context, goals, action tracker
- `insights_service.py`
  anomaly/opportunity/recommendation generation
- `simulator.py`
  scenario simulation logic
- `seasonal_outlook.py`
  occupancy-aware seasonal planning logic
- `alert_service.py`
  alert center logic

#### `app\ai`

Contains forecast/risk helper logic.

Important files:

- `forecast.py`
  occupancy-aware forecasting with confidence range
- `risk.py`
  risk scoring from forecast behavior

---

## 6. Backend data model summary

In `models.py`, the project currently uses:

- `EnergyData`
- `WaterData`
- `WasteData`
- `SolarData`
- `User`
- `CampusSetting`

Important note:

- There is **not yet** a real raw telemetry / device-ingestion schema for IoT-scale real-time use.
- Current DB design is still primarily for imported and aggregated campus records.

### `CampusSetting`

This is important.

It stores saved settings like:

- academic occupancy factors
- campus context
- sustainability goals
- action tracker state

This is how several new “advanced” UI features persist without requiring a new full admin subsystem.

---

## 7. Frontend structure

Frontend entry:

- `D:\working_green_campus\frontend_green_campus\green-campus-frontend\src\App.js`

Global styling:

- `D:\working_green_campus\frontend_green_campus\green-campus-frontend\src\App.css`

Main page:

- `D:\working_green_campus\frontend_green_campus\green-campus-frontend\src\pages\Dashboard.js`

Auth pages:

- `src\pages\Login.js`
- `src\pages\Register.js`

API layer:

- `src\services\api.js`

Text/config system:

- `src\config\dashboardConfig.js`

This is the main place to change:

- titles
- subtitles
- labels
- button wording
- glossary wording
- some theme colors
- some font sizes

---

## 8. Dashboard UI architecture

The dashboard is organized into focused views.

### Sidebar views

- `overview`
- `intelligence`
- `planning`
- `governance`
- `report`

### Current design direction

The UI is intentionally moving toward a **mission-control / executive dashboard hybrid**:

- premium header
- clearer hierarchy
- sidebar navigation
- mobile-friendly auth flow
- presentation-ready reporting
- cleaner section-by-section workspaces

### Important current UI concept

Several views now use a:

- **main workspace**
- **support rail**

This helps reduce clutter and make the app easier to use.

---

## 9. Important frontend components

These are the components most likely to matter to another agent.

### Navigation and shell

- `DashboardSidebar.js`
  sidebar navigation
- `DashboardHeader.js`
  hero / command center / filters / quick ranges / upload panel
- `ExecutiveReportView.js`
  printable executive report

### Overview

- `CampusPulseBar.js`
  short plain-language current status summary
- `ComparisonSection.js`
  current period vs previous equal-length period
- `KPISection.js`
  core KPI section intro + cards
- `DashboardCards.js`
  animated KPI cards
- `SeasonalOutlookPanel.js`
  occupancy-aware seasonal summary
- `StrategicGoalsPanel.js`
  target tracking for sustainability goals
- `ActionTrackerPanel.js`
  AI recommendation workflow tracker

### Intelligence

- `AlertCenter.js`
  alert center + export-ready days
- `CarbonFootprintDial.js`
  advanced carbon summary
- `SolarSection.js`
  solar operations summary
- `ResourceCharts.js`
  grouped chart storytelling
- `ResourceMixChart.js`
  mixed resource doughnut chart
- `EnergyTrend.js`
  energy and solar trend chart

### Planning

- `AIForecastSection.js`
  forecast cards/charts
- `AIForecastChart.js`
  forecast visual
- `AIRiskSection.js`
  AI risk engine UI
- `AIInsightsSection.js`
  anomalies, opportunities, recommendations
- `SustainabilitySimulator.js`
  what-if simulation

### Governance

- `RankingSection.js`
  building ranking
- `OccupancySettingsPanel.js`
  editable academic occupancy and campus context
- `AssumptionsPanel.js`
  glossary and settings explanation

### Cross-cutting

- `InsightDetailDrawer.js`
  slide-over detail panel used to explain clicked cards and insight items

---

## 10. What major features already exist

### Data flow / management

- register/login
- Excel validation before import
- Excel import
- Excel export
- full data reset
- optional solar/waste sheet import support
- water liter-to-kl conversion logic during import when values look suspicious

### Dashboard analytics

- summary KPIs
- building ranking
- building filter
- date range filter
- comparison analytics
- campus pulse summary
- seasonal outlook
- carbon and solar sections
- resource mix view
- energy/solar trend analysis

### AI / smart features

- daily / monthly / yearly / seasonal forecast
- occupancy-aware forecast adjustment
- confidence range in forecast
- forecast explanation
- AI risk scoring
- alert center
- export-ready day detection
- anomalies
- opportunities
- recommendations
- estimated savings in kWh / Rs / carbon
- peer comparison logic for buildings
- scenario simulation

### Governance / planning

- editable occupancy factors
- editable campus context
- sustainability goals
- recommendation action tracking
- detail drawer for guided explanation

### Presentation

- screenshot mode
- executive report mode
- print report flow
- improved login/register polish
- mobile responsiveness improvements

---

## 11. How current calculations work

Main calculation constants live in:

- `D:\working_green_campus\green-campus\app\services\metrics_config.py`

Examples there include:

- emission factor
- energy cost per kWh
- energy / water / waste benchmarks
- Green Index weights
- anomaly thresholds
- academic occupancy factors

Other key calculation files:

- `carbon.py`
- `dashboard.py`
- `simulator.py`
- `insights_service.py`
- `seasonal_outlook.py`
- `settings_service.py`

### Main important formulas

Examples:

- `net_energy = max(energy - solar, 0)`
- `export_to_grid = max(solar - energy, 0)`
- carbon is derived mainly from net grid energy
- Green Index is a weighted performance score based on energy, water, and waste

---

## 12. API layer overview

Main frontend API file:

- `D:\working_green_campus\frontend_green_campus\green-campus-frontend\src\services\api.js`

Important behavior:

- base URL comes from `REACT_APP_API_BASE_URL` or localhost fallback
- auth token is stored in `localStorage`
- `handleResponse()` clears token and redirects on `401`
- `fetchDashboardBundle()` is the main dashboard data loader

### Dashboard bundle currently fetches

- `/dashboard/summary`
- `/dashboard/comparison`
- `/energy/trend`
- `/dashboard/all-buildings`
- `/energy/by-building`
- `/dashboard/building-performance`
- `/ai/risk/energy`
- `/ai/forecast/resources`
- `/insights`
- `/ai/seasonal-outlook`
- `/ai/alerts/overview`

This means many dashboard views depend on a shared parallel bundle request pattern.

---

## 13. Current known limitations

Important for any future agent:

1. The project is still **dashboard-first**, not true full IoT ingestion yet.
2. Waste is still better treated as semi-manual data than true real-time data.
3. Some AI logic is still heuristic / rules-based, not full ML training.
4. Water real-time monitoring is not yet fully solved in code or hardware.
5. There is still a lot of inline styling in frontend components.
6. The app is functional and polished, but not yet refactored into a deep design system.
7. Real-time hardware deployment would require new ingestion endpoints and raw telemetry tables.

---

## 14. Current deployment model

Used in practice:

- frontend on Render static site
- backend on Render web service
- database on Render Postgres

Important env vars:

### Backend

- `DATABASE_URL`
- `CORS_ORIGINS`

### Frontend

- `REACT_APP_API_BASE_URL`

---

## 15. Sample datasets

Folder:

- `D:\working_green_campus\sample_data`

Important files that have been used during this project:

- `college_campus_realistic_demo.xlsx`
- `campus_resource_dataset.xlsx`
- `campus_resource_dataset_import_ready.xlsx` (if present locally)

Note:

- not all files in `sample_data` are guaranteed to be committed or clean at a given moment
- agents should check git status before staging sample-data changes

---

## 16. Docs another agent should read first

If an agent has only a few minutes, read in this order:

1. `D:\working_green_campus\AI_README.md`
2. `D:\working_green_campus\PROJECT_GUIDE.md`
3. `D:\working_green_campus\SECTION_GUIDE.md`
4. `D:\working_green_campus\REAL_WORLD_IMPLEMENTATION_GUIDE.html`

Then inspect:

1. `src\pages\Dashboard.js`
2. `src\services\api.js`
3. `app\routers\dashboard.py`
4. `app\services\insights_service.py`
5. `src\config\dashboardConfig.js`

---

## 17. Best future directions

If another agent is continuing this project, the strongest next areas are:

- true telemetry ingestion APIs
- raw device registry and device health monitoring
- weather-aware forecasting
- action workflow history and audit
- PDF export / scheduled management reports
- device operations page
- richer anomaly detection
- user roles and admin controls

---

## 18. Short summary for another AI

If you need a one-paragraph understanding:

This repo contains a campus sustainability intelligence dashboard with a FastAPI backend and React frontend. It supports login, Excel import/export/reset, building/date filtering, KPI summary, carbon/solar analysis, comparison analytics, occupancy-aware forecasting, AI risk/insight generation, alerts, scenario simulation, editable governance settings, strategic goal tracking, action tracking for recommendations, and executive reporting. The core frontend orchestration is in `src/pages/Dashboard.js`, the API layer is in `src/services/api.js`, the main backend aggregation logic is in `app/routers/dashboard.py`, and most adjustable visible wording is in `src/config/dashboardConfig.js`. It is already strong for demo and planning use, and the next major evolution is real-time telemetry ingestion for real campus deployment.
