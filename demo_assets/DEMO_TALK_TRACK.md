# Green Campus Sustainability Intelligence Platform

## Demo talking track

## Project Overview
- Green Campus helps monitor energy, water, waste, and solar performance in one dashboard.
- It is designed for college or university campuses where usage changes with occupancy, seasons, and academic schedules.
- The system supports daily operations, future forecasting, sustainability scoring, and dataset import/export.

## Problem We Are Solving
- Campus utility information is often spread across Excel files and separate teams.
- It is hard to understand current consumption, compare buildings, and plan for upcoming months.
- This platform brings all resource data into one place and converts it into decisions.

## How The System Works
- Frontend: React dashboard for login, filters, charts, AI panels, simulator, import, reset, and export.
- Backend: FastAPI service that reads campus data, calculates metrics, and returns APIs for the frontend.
- Database: Stores raw energy, water, waste, solar, and user records.
- Deployment: Frontend and backend are both live, while local development is still available for new features.

## Main Website Flow
- Step 1: User logs in to the platform.
- Step 2: Dashboard loads campus summary, alerts, risk, forecasts, charts, and assumptions.
- Step 3: User can filter by building and forecast mode.
- Step 4: User can import a fresh Excel file, export the current workbook, or reset data.
- Step 5: User reviews AI insights and runs what-if simulations.

## What Data The Platform Stores
- Energy sheet: date, building, energy_kwh
- Water sheet: date, building, water_kl
- Waste sheet: date, building, waste_kg
- Solar sheet: date, building, solar_kwh
- User table: username, password hash, role

## Dashboard Sections
- Operations snapshot: current scope, forecast mode, import/export controls, KPI cards, seasonal outlook
- Performance intelligence: carbon footprint, solar operations, resource mix, trends, alerts
- AI planning studio: insights, risk, forecasts, scenario simulator
- Governance and reference: building ranking and assumptions glossary

## Calculation Logic: Summary Metrics
- Gross Energy = sum of electricity consumption in the selected scope
- Solar = sum of solar generation in the selected scope
- Net Energy = max(Gross Energy - Solar, 0)
- Export to Grid = max(Solar - Gross Energy, 0)
- Water = sum of water records
- Waste = sum of waste records

## Calculation Logic: Carbon Metrics
- Emission factor used in the project = 0.82 kg CO2 per kWh
- Net Carbon = Net Energy x 0.82
- Gross Carbon = Gross Energy x 0.82
- Solar Avoided Carbon = min(Solar, Gross Energy) x 0.82
- This makes the carbon section easy to explain in both operational and sustainability terms.

## Calculation Logic: Green Index
- Benchmarks: Energy 100000, Water 20000, Waste 30000
- Energy Score = min(Net Energy / 100000, 1)
- Water Score = min(Water / 20000, 1)
- Waste Score = min(Waste / 30000, 1)
- Weighted Efficiency = 0.5 x Energy Score + 0.3 x Water Score + 0.2 x Waste Score
- Green Index = (1 - Weighted Efficiency) x 100
- Higher Green Index means better sustainability performance.

## How Forecasting Works
- Forecast modes available: daily, monthly, yearly, and seasonal.
- Historical records are grouped by the selected granularity.
- The system finds recurring cycle averages from past periods.
- Future values are created by repeating those cycle averages in the next periods.
- This gives practical operational forecasting even without heavy ML infrastructure.

## Seasonal and Occupancy Logic
- The project includes academic occupancy factors by month.
- Lower occupancy months like June and July reduce expected campus demand.
- The seasonal panel compares current month occupancy with the next month.
- It also estimates when solar may offset most of the load or become export-ready.

## AI Features In Plain Language
- Risk Engine: estimates whether upcoming usage is low, medium, or high risk.
- Insights: identifies anomalies, opportunities, and recommendations.
- Alert Center: highlights unusual changes and export-ready days.
- Scenario Simulator: tests what happens if energy, water, and waste reduce or solar increases.

## Excel Import and Export Workflow
- Import Excel: uploads a fresh workbook and replaces old campus resource data.
- Export Excel: downloads a workbook with summary, building performance, and all raw sheets.
- Reset Data: clears current solar, energy, water, and waste records for a fresh view.
- This makes the platform practical for demos, audits, and management sharing.

## Live Demo Script
- 1. Open login page and log in
- 2. Show dashboard overview and explain KPI cards
- 3. Change building and forecast granularity
- 4. Open carbon, solar, alerts, and resource charts
- 5. Explain AI insights, seasonal outlook, and scenario simulator
- 6. Import the sample workbook and show how data refreshes
- 7. Export the workbook and explain the generated sheets

## Why This Project Is Useful
- Easy for campus administrators to understand current performance.
- Helps compare buildings and detect wasteful patterns early.
- Supports planning for low-occupancy periods, solar contribution, and carbon reduction.
- Provides a strong base for future features like reports, alerts, optimization, and occupancy-aware forecasting.
