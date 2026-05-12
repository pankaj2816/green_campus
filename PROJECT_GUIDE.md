# Green Campus Project Guide

## Purpose

This system is built for professional campus sustainability monitoring and planning across:

- electricity
- water
- waste
- solar generation
- AI forecasting
- AI risk analysis
- anomaly and recommendation insights
- scenario simulation
- occupancy-aware seasonal planning

It is designed so you can import fresh Excel data, reset old data, view current sustainability performance, and later adjust formulas based on your campus needs.

## Active Project Folders

- Backend API: `D:\working_green_campus\green-campus`
- Frontend dashboard: `D:\working_green_campus\frontend_green_campus\green-campus-frontend`

Ignore `backup` for the active app flow.

## How The System Works

### Backend

Main entry:

- `D:\working_green_campus\green-campus\app\main.py`

The backend uses FastAPI and SQLAlchemy. It:

- starts the API
- registers all routers
- enables CORS for the React app
- loads database models
- serves analytics, AI, simulation, metadata, and data-management endpoints

Important backend files:

- `app\models.py`
  Database tables for `EnergyData`, `WaterData`, `WasteData`, `SolarData`, and `User`
- `app\routers\dashboard.py`
  Summary, building ranking, and building filter logic
- `app\routers\data_import.py`
  Excel import and full dataset reset
- `app\routers\forecast.py`
  AI forecast endpoint
- `app\routers\ai_risk.py`
  AI risk endpoint
- `app\routers\insights.py`
  Anomalies, opportunities, recommendations
- `app\routers\simulation.py`
  What-if simulator endpoint
- `app\routers\seasonal.py`
  Occupancy-aware seasonal intelligence endpoint
- `app\routers\meta.py`
  Assumptions and glossary endpoint
- `app\services\metrics_config.py`
  Central place for assumptions, thresholds, cost factors, weights, and academic occupancy factors

### Frontend

Main entry:

- `D:\working_green_campus\frontend_green_campus\green-campus-frontend\src\App.js`

Main dashboard page:

- `D:\working_green_campus\frontend_green_campus\green-campus-frontend\src\pages\Dashboard.js`

The dashboard now works like a professional operations console. It includes:

- command-center header
- focused dashboard views with sidebar navigation
- section-based main workspace + support rail layout
- data import and reset controls
- building filter
- date-range filter
- daily, monthly, yearly, seasonal forecast selector
- current period vs previous period comparison analytics
- campus pulse summary banner
- strategic goal tracking board
- action tracker for AI recommendations
- click-to-open detail drawer for deeper explanations
- built-in simple guide PDF access from the sidebar
- hover/click help badges for complex headings
- KPI cards
- seasonal intelligence panel
- advanced carbon section
- solar operations section
- resource comparison and pie-style mix view
- AI insights and risk
- alert center and export-ready days
- scenario simulator
- occupancy and campus-context settings editor
- editable runtime parameter editor in Governance
- ranking table
- assumptions and terminology panel
- executive report view for screenshot and print use

Main frontend copy/config file:

- `D:\working_green_campus\frontend_green_campus\green-campus-frontend\src\config\dashboardConfig.js`

Use this file when you want to quickly change:

- titles
- subtitles
- wording
- button labels
- section labels
- simple explanatory text
- login/register text
- chart labels
- simulator labels
- AI panel headings
- some colors
- some font sizes

Look inside these sections in the same file:

- `theme.colors`
- `theme.fontSizes`

This is the main frontend text file.

If you ask "where is the frontend wording file?", the answer is:

- `D:\working_green_campus\frontend_green_campus\green-campus-frontend\src\config\dashboardConfig.js`

## Commands To Run

### Backend

Open a terminal in:

- `D:\working_green_campus\green-campus`

Install dependencies:

```powershell
python -m pip install -r requirements.txt
```

Run backend:

```powershell
python -m uvicorn app.main:app --reload
```

Alternative if `python` is unavailable:

```powershell
py -m pip install -r requirements.txt
py -m uvicorn app.main:app --reload
```

### Frontend

Open a second terminal in:

- `D:\working_green_campus\frontend_green_campus\green-campus-frontend`

Install dependencies:

```powershell
npm install
```

Run frontend:

```powershell
npm start
```

For live deployment, the frontend can use:

- `REACT_APP_API_BASE_URL`

This should point to your deployed backend API URL.

## Verification Commands

Backend compile check:

```powershell
cd D:\working_green_campus\green-campus
python -m compileall app
```

Frontend production build:

```powershell
cd D:\working_green_campus\frontend_green_campus\green-campus-frontend
npm run build
```

## URLs

- Frontend: `http://localhost:3000`
- Backend API: `http://127.0.0.1:8000`
- API docs: `http://127.0.0.1:8000/docs`

## Deployment

Recommended free setup:

- Frontend: Render Static Site
- Backend: Render Web Service

This repo now includes:

- `D:\working_green_campus\render.yaml`

You can use that file with Render Blueprint deployment.

### Render deployment steps

1. Sign in to Render
2. Connect your GitHub account
3. Choose the repo:
   `https://github.com/pankaj2816/green_campus`
4. Create services from `render.yaml`

### Backend settings

Service type:

- Web Service

Root directory:

- `green-campus`

Build command:

```text
pip install -r requirements.txt
```

Excel upload note:
- `.xlsx` import uses `openpyxl`, which is included in backend requirements and must be installed in both local and deployed environments.

Start command:

```text
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Required environment variables:

- `DATABASE_URL`
- `CORS_ORIGINS`

Example `CORS_ORIGINS` value after frontend deploy:

```text
https://your-frontend-name.onrender.com
```

### Frontend settings

Service type:

- Static Site

Root directory:

- `frontend_green_campus/green-campus-frontend`

Build command:

```text
npm install --legacy-peer-deps && npm run build
```

Publish directory:

```text
build
```

Required environment variable:

- `REACT_APP_API_BASE_URL`

Example value:

```text
https://your-backend-name.onrender.com
```

## Main User Flow

1. Start backend
2. Start frontend
3. Register or log in
4. Import Excel data using the dashboard data controls
5. Use building filter, date range filter, and forecast selector
6. Review KPI cards, campus pulse, comparison analytics, carbon, solar, trend, risk, insights, and simulator
7. Set sustainability goals in Overview and track progress against them
8. Update action status for AI recommendations so the dashboard also reflects execution
9. Edit occupancy settings in Governance if you want the planning values to match your campus
10. Edit runtime parameters like carbon factor, energy cost, benchmarks, thresholds, and Green Index weights directly in Governance
11. Export Excel when you want the current live dataset as a workbook
12. Reset data when you want a fresh import

## Sample Excel File

A realistic demo workbook is available here:

- `D:\working_green_campus\sample_data\college_campus_realistic_demo.xlsx`

It includes daily records for multiple college buildings across a full year and is designed to show:

- lower academic occupancy in June and July
- seasonal changes in energy and water use
- lower solar output in monsoon months
- different behavior in hostels, academic blocks, library, and admin spaces

Sheet names inside the workbook:

- `solar`
- `energy`
- `water`
- `waste`

You can import it directly from the dashboard.

## Fresh View / Reset and Import

The dashboard now supports both actions:

- `Import Excel`
  Upload a fresh campus dataset from the frontend
- `Workbook Check`
  Preview whether the Excel file is ready before import, including sheet names, row counts, and warnings
- `Export Excel`
  Download the current workbook with summary, building performance, and raw energy, water, waste, and solar sheets
- `Reset Data`
  Clear all solar, energy, water, and waste records before starting again

Backend endpoint:

- `GET /admin/export-campus-excel`
- `POST /admin/reset-campus-data`

This is useful when:

- you want to remove old campus data
- you want to test with a new dataset
- you want a clean dashboard view before re-importing Excel

### Smarter import behavior

The importer is now more flexible.

- `energy` and `water` sheets are required
- `solar` and `waste` sheets can be missing
- if water values look like liters instead of `kl`, the importer converts them during upload and shows a warning
- an empty `waste` sheet is allowed as long as the correct columns exist

## Frontend Terminology

### Gross Energy

Total electricity consumption before subtracting solar generation.

### Solar Generated

Electricity produced from solar systems in the dataset.

### Net Grid Energy

Electricity still required from the grid after solar offset.

Formula:

```text
net_energy = max(energy - solar, 0)
```

### Export to Grid

If solar generation exceeds demand, the extra electricity can be treated as export potential.

Formula:

```text
export_to_grid = max(solar - energy, 0)
```

### Carbon Footprint

Estimated emissions from net grid electricity.

### Gross Carbon

Carbon that would result if all gross energy came from the grid.

### Solar Avoided Carbon

Carbon avoided because solar generation offsets part of the gross energy demand.

### Green Index

A sustainability score built from normalized energy, water, and waste consumption.

Higher is better.

### Forecast Granularity

- daily: operational view
- monthly: management view
- yearly: strategic view
- seasonal: climate + campus-cycle view

### Date Range Filter

You can now choose a `from` and `to` date in the header.

This changes:

- dashboard summary
- KPI cards
- trends
- comparison analytics
- alerts
- insights
- forecasts
- seasonal outlook
- simulator

Use this when you want to answer questions like:

- how did April compare with March?
- what happened only during summer break?
- how did one semester perform?

### Comparison Analytics

The dashboard now compares the selected period with the immediately previous period of the same length.

Simple example:

- if you select `2024-04-01` to `2024-06-30`
- the system compares it against the three months just before that

It shows change in:

- net energy
- water
- waste
- carbon
- Green Index
- estimated energy cost

This helps explain whether performance is improving or worsening over time.

### Strategic Goal Tracking

The overview now includes a goal board.

It lets you set simple targets for:

- Green Index
- solar offset
- water per student
- monthly energy cost

The dashboard then shows how close the current scope is to each target.

This is useful when you want to move from “what happened?” to “are we meeting the plan?”

### Action Board

The action board lets you track what happens after AI recommendations are shown.

Each recommendation can be marked as:

- suggested
- planned
- in progress
- completed

This makes the dashboard more useful for real operational follow-up.

### Detail Drawer

Many cards can now be clicked to open a detail drawer.

This drawer gives:

- a plain-language explanation
- current value context
- why the metric matters
- next interpretation points

This improves usability because the dashboard can stay visually clean while still explaining itself when needed.

### Seasonal Intelligence

An occupancy-aware planning layer. Example:

- if students are mostly away in June, energy and water demand should be lower
- during lower occupancy, solar may cover a larger share of demand
- in some cases, solar can exceed demand and become export potential

### Scenario Simulator

A what-if tool that shows how percentage changes in energy, water, waste, and solar affect carbon, cost, and green index.

### Editable Runtime Parameters

The Governance view now includes a live parameter editor.

You can change values like:

- carbon per electricity unit
- electricity cost per unit
- energy benchmark
- water benchmark
- waste benchmark
- anomaly thresholds
- Green Index weights

These changes now affect live dashboard calculations, so you do not need to edit code just to test a different energy-cost or carbon-factor assumption.

### Occupancy Meanings

The occupancy panel now explains what the monthly values mean:

- `1.0` = normal or full campus activity
- `0.9` = slightly reduced activity
- `0.5` = partial activity or vacation period
- `0.2` = very low campus activity

These are activity multipliers, not exact percentages.

### Formula Explanations

The Governance panel now also explains how the dashboard calculates:

- net energy
- export to grid
- carbon footprint
- gross carbon
- Green Index
- monthly energy cost

This makes the dashboard easier to explain without opening the backend code.

## Where Calculations Live

The first file to edit for formula updates is:

- `D:\working_green_campus\green-campus\app\services\metrics_config.py`

It currently contains:

- `EMISSION_FACTOR_KG_PER_KWH`
- `ENERGY_COST_PER_KWH`
- `ENERGY_BENCHMARK`
- `WATER_BENCHMARK`
- `WASTE_BENCHMARK`
- `COMPLIANCE_ENERGY_LIMIT`
- `COMPLIANCE_WATER_LIMIT`
- `COMPLIANCE_WASTE_LIMIT`
- `GREEN_INDEX_WEIGHTS`
- anomaly thresholds
- academic occupancy factors

Other calculation files:

- `app\services\carbon.py`
  Carbon formula
- `app\services\simulator.py`
  What-if scenario impact math
- `app\services\insights_service.py`
  Anomalies, opportunities, recommendations
- `app\services\seasonal_outlook.py`
  Occupancy-aware seasonal logic
- `app\routers\dashboard.py`
  Summary metrics returned to frontend
- `app\services\date_filters.py`
  Shared date-window logic
- `app\services\settings_service.py`
  Saved occupancy and campus planning values

## If You Want To Change Calculations

### Change carbon factor

Edit:

- `app\services\metrics_config.py`

Example:

```python
EMISSION_FACTOR_KG_PER_KWH = 0.82
```

### Change electricity cost assumption

Edit:

- `app\services\metrics_config.py`

Example:

```python
ENERGY_COST_PER_KWH = 8.0
```

### Change green index weights

Edit:

- `app\services\metrics_config.py`

Example:

```python
GREEN_INDEX_WEIGHTS = {
    "energy": 0.5,
    "water": 0.3,
    "waste": 0.2,
}
```

Keep the total close to `1.0`.

### Change sustainability benchmarks

Edit:

- `app\services\metrics_config.py`

Change these if your campus scale is different:

- `ENERGY_BENCHMARK`
- `WATER_BENCHMARK`
- `WASTE_BENCHMARK`

### Change academic calendar assumptions

Edit:

- `app\services\metrics_config.py`

This controls occupancy-aware seasonal intelligence:

```python
ACADEMIC_OCCUPANCY_FACTORS = {
    6: 0.45,
    7: 0.5,
}
```

If your campus is empty in June and partly occupied in July, keep lower values there. If your campus remains active in summer, increase those numbers.

### Change anomaly sensitivity

Edit:

- `app\services\metrics_config.py`

Adjust:

- `ANOMALY_THRESHOLD_PERCENT`
- `HIGH_ANOMALY_THRESHOLD_PERCENT`

## Current Feature Set

### Core

- auth
- Excel import
- dashboard summary
- building ranking
- energy trend
- compliance scoring

### AI and Advanced Analytics

- daily forecasting
- monthly forecasting
- yearly forecasting
- seasonal forecasting
- occupancy-aware forecasting
- forecast confidence range
- confidence explanation text
- AI risk analysis
- alert center
- export-ready day analysis
- AI anomalies
- AI opportunities
- AI recommendations
- impact-ranked recommendations
- peer comparison insights
- savings-aware recommendations
- strategic goal tracking with progress bars
- recommendation action tracker
- click-to-open detail drawer
- seasonal intelligence with occupancy assumptions
- scenario simulator
- comparison analytics across date windows
- editable occupancy and campus context settings
- editable runtime metric parameters
- formula explanation cards in Governance
- workbook validation before import
- optional solar/waste sheet support during import

### Premium UI Additions

- sidebar navigation for focused dashboard views
- campus pulse summary banner
- section-based workspace layout
- strategic goals side rail
- action tracker side rail
- screenshot mode
- executive report print view
- animated KPI cards
- premium login and register screens

### Data Management

- import fresh Excel data
- export the current workbook back to Excel
- reset all campus resource data

### Visual UX

- advanced carbon section
- solar operations section
- resource comparison chart
- resource mix pie chart
- professional operations-style layout

## Important API Endpoints

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Dashboard

- `GET /dashboard/summary`
- `GET /dashboard/all-buildings`
- `GET /dashboard/building-performance`
- `GET /dashboard/comparison`

### Energy

- `GET /energy/trend`
- `GET /energy/monthly`
- `GET /energy/daily`
- `GET /energy/by-building`

### AI

- `GET /ai/forecast/resources`
- `GET /ai/risk/energy`
- `GET /ai/seasonal-outlook`
- `GET /ai/alerts/overview`
- `GET /insights`
- `POST /ai/simulate/impact`

### Data Management

- `GET /admin/export-campus-excel`
- `POST /admin/validate-campus-excel`
- `POST /admin/upload-campus-excel`
- `POST /admin/reset-campus-data`

### Metadata

- `GET /meta/assumptions`
- `GET /meta/settings`
- `POST /meta/settings`

## Frontend Components You Will Most Likely Edit Later

- `src\config\dashboardConfig.js`
  Main place for changing frontend wording and labels
- `src\pages\Dashboard.js`
  Main page assembly
- `src\components\DashboardHeader.js`
  Hero header, filters, date range, and data controls
- `src\components\CarbonFootprintDial.js`
  Advanced carbon section
- `src\components\ComparisonSection.js`
  Previous-period comparison cards
- `src\components\ResourceMixChart.js`
  Doughnut chart
- `src\components\SeasonalOutlookPanel.js`
  Occupancy-aware planning panel
- `src\components\SustainabilitySimulator.js`
  What-if simulation UI
- `src\components\OccupancySettingsPanel.js`
  Occupancy and campus context editor
- `src\components\AssumptionsPanel.js`
  Visible assumptions and glossary

## Recommended Future Additions

Good next professional features would be:

- alert center for spikes and high-risk months
- per-building occupancy schedules
- storage/battery simulation for solar export
- hostel vs academic block comparison
- PDF or management report export
- benchmark comparison against previous months or years

## How To Keep This Document Updated

Whenever a major feature is added, update:

- current feature set
- key endpoints
- frontend terminology
- where calculations live
- commands if setup changes

This guide is meant to grow with the platform as features are added.
