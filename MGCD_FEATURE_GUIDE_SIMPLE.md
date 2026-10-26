# MAHE Green Campus Dashboard (MGCD) - Simple Feature Guide

This document explains the full MGCD project in simple language.


## 1. What Is MGCD?

MGCD means **MAHE Green Campus Dashboard**.

It is a web dashboard that helps a campus monitor and improve:

- electricity usage
- water usage
- waste generation
- solar generation
- carbon footprint
- building-wise sustainability performance
- future demand using AI-style prediction
- management reporting

In simple words:

MGCD converts campus utility data into clear charts, scores, alerts, forecasts, and action points.

Instead of checking many Excel sheets separately, the user can open one dashboard and understand the campus sustainability picture quickly.

---

## 2. Why This Project Is Useful

In many campuses, electricity, water, waste, and solar data are stored separately.

Because of this:

- management cannot see the full picture quickly
- abnormal consumption may be noticed late
- solar benefit is not clearly visible
- building-wise comparison becomes difficult
- reports take time to prepare manually
- future planning is based on guesswork

MGCD solves this by bringing everything into one smart dashboard.

The dashboard helps answer questions like:

- Which building is using more electricity?
- Is solar actually reducing grid dependency?
- Is water consumption rising?
- Which month may have higher demand?
- What can we do to reduce cost and carbon?
- Which action should be taken first?

---

## 3. Main User Flow

The normal flow of the website is:

1. User opens the website.
2. User registers or logs in.
3. User imports Excel data.
4. Dashboard processes the data.
5. User checks overview, charts, forecasts, rankings, and reports.
6. User changes assumptions if required.
7. User exports data or prints a report when needed.

This makes the system useful for both demo and real planning.

---

## 4. Login And Register

The website has login and register pages.

### Register

Register is used to create a new user account.

The user enters:

- username
- password

After successful registration, the user can log in.

### Login

Login is used to enter the dashboard.

The system checks the username and password. If they are correct, the user gets access to the dashboard.

### Password Visibility Option

The password field includes a show/hide option.

This helps users check what they typed, especially during demos or mobile usage.

---

## 5. Dashboard Navigation

The dashboard is divided into focused sections.

This makes the website easier to use because everything is not shown as one long mixed page.

Main sections are:

- Overview
- Intelligence
- Planning Studio
- Governance
- Executive Report

Each section has a different purpose.

---

## 6. Overview Section

The Overview section gives the quickest understanding of the campus condition.

It is the best section to open first during a demo.

### What It Shows

- selected building or full campus
- selected forecast mode
- selected date range
- campus pulse
- comparison analytics
- KPI cards
- seasonal intelligence
- strategic goals
- action board

### Why It Matters

Overview helps the user understand the current condition in a few seconds.

It is useful for management because they do not need to study every detailed chart first.

### Simple Example

If management asks, "What is the current sustainability condition of the campus?", open Overview.

You can explain:

"This section gives the overall operational picture. It shows whether the campus is improving, where the risk is, and what actions are suggested."

---

## 7. Campus Pulse

Campus Pulse is a short summary shown near the top of the Overview section.

### What It Explains

- current Green Index
- current risk level
- selected campus or building scope
- forecast occupancy
- short system-generated summary

### Why It Matters

It gives a quick health check of the campus.

Instead of reading many numbers, the user gets one simple summary sentence.

### Simple Example

If Campus Pulse says risk is high, it means the current or forecasted resource pattern needs attention.

---

## 8. KPI Cards

KPI means **Key Performance Indicator**.

KPI cards show the most important numbers in a simple format.

### Main KPI Cards

- Gross Energy
- Water Consumption
- Waste Generated
- Solar Generated
- Net Grid Energy
- Carbon Footprint
- Green Index
- Estimated Cost

### Gross Energy

Gross Energy means total electricity demand before subtracting solar generation.

### Net Grid Energy

Net Grid Energy means electricity still required from the grid after solar support.

Formula:

```text
Net Grid Energy = Gross Energy - Solar Energy
```

If solar is more than demand, net grid energy becomes zero.

### Green Index

Green Index is a combined sustainability score.

Higher value means better sustainability performance.

It considers energy, water, and waste pressure together.

### Why KPI Cards Matter

They help management quickly see the most important numbers without opening detailed tables.

---

## 9. Comparison Analytics

Comparison Analytics compares the selected date range with the previous period of the same length.

### Example

If user selects:

```text
April 2024 to June 2024
```

The system compares it with:

```text
January 2024 to March 2024
```

### What It Compares

- net energy
- water
- waste
- carbon
- Green Index
- energy cost

### Why It Matters

It tells whether the campus is improving or getting worse.

This is more useful than only showing current data.

### Simple Explanation

"This section tells us whether the selected period performed better or worse than the previous comparable period."

---

## 10. Strategic Goals

Strategic Goals help the campus set targets.

### What Can Be Tracked

- target Green Index
- target solar offset
- target water usage per student
- target monthly energy cost

### Why It Matters

This changes the dashboard from only monitoring to goal-based planning.

### Simple Example

If the target Green Index is 85 and current value is 78, the dashboard shows that improvement is still needed.

---

## 11. Action Board

Action Board turns AI recommendations into trackable work.

### Action Status Options

- Suggested
- Planned
- In Progress
- Completed

### What Each Status Means

Suggested means the system has recommended an action.

Planned means the team has accepted the action and may assign responsibility.

In Progress means work has started.

Completed means the action has been finished.

### Why It Matters

Many dashboards only show problems.

MGCD also helps track whether recommended actions are actually being followed.

### Recent UI Improvement

The Action Board is now shown as a full-width recommendation workspace.

This makes long recommendation lists easier to read and avoids empty side areas while scrolling.

---

## 12. Intelligence Section

The Intelligence section gives deeper analysis.

It is used when someone wants to understand why the numbers are changing.

### What It Includes

- Advanced Carbon Footprint
- Solar Operations
- Resource Flow and Trend Interpretation
- Data Quality and Forecast Trust
- Alert Center

### Why It Matters

This section explains resource behavior, not just raw totals.

---

## 13. Advanced Carbon Footprint

This section explains carbon impact.

### Gross Carbon

Gross Carbon means carbon that would be produced if all electricity came from the grid.

### Solar Avoided Carbon

Solar Avoided Carbon means carbon saved because solar energy reduced grid electricity usage.

### Net Carbon

Net Carbon means actual estimated carbon after solar benefit.

Formula:

```text
Net Carbon = Net Grid Energy x Carbon Factor
```

### Why It Matters

This helps show the environmental benefit of solar and reduced energy use.

---

## 14. Solar Operations

Solar Operations explains how solar generation is helping the campus.

### What It Shows

- solar contribution
- carbon avoided
- cost shielding
- grid export potential

### Solar Contribution

Solar Contribution means how much campus electricity demand is supported by solar.

### Grid Export

Grid Export means extra solar energy that may be available after campus demand is already covered.

Formula:

```text
Grid Export = Solar Energy - Gross Energy
```

If solar is less than demand, grid export is zero.

### Why Grid Export Can Be Zero

Grid export will be zero when campus electricity demand is higher than solar generation.

This is normal in many campuses.

---

## 15. Resource Visualization

Resource Visualization helps users understand electricity, water, waste, and solar data visually.

### Resource Comparison Chart

This chart compares the main resource streams side by side.

It shows:

- energy in kWh
- water in kl
- waste in kg
- solar in kWh

### Resource Mix Chart

This chart shows how much each resource contributes to the current tracked picture.

It is shown as a doughnut or pie-style chart.

### Trend Chart

Trend chart shows how energy, solar, and net grid demand change over time.

### Recent Visualization Improvement

The visualization area now includes:

- summary strip above charts
- solar coverage
- tracked footprint
- trend reading
- sorted legend
- progress bars for resource share
- clearer latest value cards

This makes the charts easier to explain during presentations.

---

## 16. Data Quality And Forecast Trust

This section checks whether the imported data is reliable.

### What It Checks

- number of records
- missing months
- duplicate records
- unusual zero values
- whether enough history exists for forecasting

### Trust Level

Trust level tells whether the data is strong enough for dashboard and forecast usage.

Possible meanings:

- High means data looks reliable.
- Medium means data can be used but should be reviewed.
- Low means data needs correction before serious reporting.

### Why It Matters

Good predictions need good data.

This section helps users understand whether the current data can be trusted.

---

## 17. Alert Center

Alert Center shows important warnings and opportunities.

### Example Alerts

- energy demand is increasing
- water usage may be abnormal
- waste generation is high
- forecast risk is high
- solar export-ready days are available

### Why It Matters

It saves time because the user does not need to manually inspect every chart.

The system highlights what needs attention.

---

## 18. Planning Studio

Planning Studio is the AI and future planning section.

### What It Includes

- AI Forecast Studio
- AI Risk Analysis
- AI Insights
- Scenario Simulator

### Why It Matters

This section helps the campus plan before problems happen.

---

## 19. AI Forecast Studio

AI Forecast Studio predicts future values.

### Forecasted Resources

- electricity
- water
- waste
- solar

### Forecast Modes

- daily
- monthly
- yearly
- seasonal

### Daily Forecast

Daily forecast is useful for short-term operational planning.

Example:

"Next few days may have higher electricity demand."

### Monthly Forecast

Monthly forecast is useful for management planning.

Example:

"June may have lower demand because fewer students are on campus."

### Yearly Forecast

Yearly forecast is useful for long-term strategy.

Example:

"Next year demand may increase if campus usage grows."

### Seasonal Forecast

Seasonal forecast considers seasonal behavior.

Example:

"Monsoon may reduce solar generation, while summer may increase cooling demand."

---

## 20. Confidence Range

Forecast should not be treated as one exact fixed number.

Confidence Range gives a likely lower and upper range.

### Example

If forecast says:

```text
Expected energy: 50,000 kWh
Range: 47,000 to 53,000 kWh
```

It means the actual value may likely fall in that range.

### Why It Matters

Real campus usage changes due to weather, occupancy, events, holidays, and operations.

Confidence range makes prediction more honest and practical.

---

## 21. AI Risk Analysis

AI Risk Analysis tells whether future resource demand may become risky.

### It Looks At

- growth trend
- variation in previous data
- forecasted increase
- occupancy effect
- confidence range

### Risk Levels

- Low
- Medium
- High

### Simple Explanation

"If energy is rising fast and past usage is unstable, the risk score becomes higher."

---

## 22. AI Insights

AI Insights gives interpretation of the data.

### It Includes

- anomalies
- opportunities
- recommendations

### Anomalies

Anomalies are unusual changes.

Example:

"Energy usage increased much more than normal."

### Opportunities

Opportunities are areas where savings or improvement may be possible.

Example:

"Solar contribution can be improved in this building."

### Recommendations

Recommendations are suggested actions.

Example:

"Shift non-critical energy loads to daytime when solar generation is higher."

---

## 23. Scenario Simulator

Scenario Simulator is a what-if tool.

The user can test changes like:

- reduce energy by 10%
- reduce water by 15%
- reduce waste by 8%
- increase solar by 20%

The simulator then shows possible impact on:

- net energy
- carbon
- energy cost
- Green Index

### Why It Matters

Before taking real action, management can estimate the possible benefit.

---

## 24. Governance Section

Governance explains how the dashboard is calculated and controlled.

### What It Includes

- building ranking
- occupancy settings
- current calculation settings
- simple explanations
- formula guide
- audit trail
- device readiness layer

### Why It Matters

Governance builds trust.

It helps users understand how numbers are calculated and how settings affect the dashboard.

---

## 25. Building Ranking

Building Ranking compares buildings based on sustainability performance.

### What It Shows

- rank
- building name
- energy
- solar
- net energy
- water
- waste
- carbon
- efficiency

### Why It Matters

It helps identify:

- best performing building
- building needing attention
- where improvement work should start

---

## 26. Occupancy And Campus Context

This section lets the user change campus activity assumptions.

### Monthly Occupancy Values

Values like `1.0`, `0.9`, `0.5`, and `0.2` are activity multipliers.

They do not mean exact attendance count.

### Simple Meaning

`1.0` means normal or full campus activity.

`0.9` means slightly reduced activity.

`0.5` means partial activity or vacation period.

`0.2` means very low campus activity.

### Why It Matters

If students are not present in June, energy and water demand should normally reduce.

This setting helps forecasts behave more realistically.

---

## 27. Editable Calculation Settings

The Governance section allows important assumptions to be changed from the UI.

### Examples

- carbon factor per kWh
- electricity cost per unit
- energy benchmark
- water benchmark
- waste benchmark
- anomaly threshold
- Green Index weights

### Why It Matters

Different campuses may use different calculation assumptions.

This feature allows customization without changing backend code every time.

---

## 28. Audit Trail

Audit Trail records important actions.

### Example Actions

- settings changed
- Excel imported
- data reset
- device registry updated

### Why It Matters

It helps management know what changed and when.

This is useful for review, accountability, and audit discussions.

---

## 29. Device Readiness Layer

Device Readiness is a planning layer for future real-time implementation.

### What It Tracks

- device name
- category
- building or scope
- source type
- sync status
- last sync time
- readiness score

### Why It Matters

When the project moves from Excel-based data to real campus devices, this section helps track whether meters and data sources are ready.

It is useful for planning IoT integration.

---

## 30. Executive Report

Executive Report is a clean report-style view.

### It Is Useful For

- management meetings
- screenshots
- PDF printing
- project demos
- quick review

### What It Contains

- summary
- important KPIs
- carbon and solar view
- important risks
- major recommendations

### Why It Matters

It gives management a clean view without needing to scroll through every dashboard section.

---

## 31. Screenshot Mode

Screenshot Mode makes the dashboard cleaner for presentation screenshots.

### What It Does

- reduces visual clutter
- makes layout more presentation-friendly
- helps capture clean screenshots for PPT or reports

### Why It Matters

It is useful when preparing slides, project reports, or demo material.

---

## 32. Import Excel

Import Excel uploads campus data into the system.

### Expected Sheets

- energy
- water
- solar
- waste

Energy and water are important.

Solar and waste can be optional depending on how the dataset is prepared.

### Why It Matters

The dashboard needs data to show charts, KPIs, forecasts, and rankings.

---

## 33. Workbook Check

Workbook Check validates the Excel file before import.

### It Checks

- sheet names
- row count
- required columns
- possible warnings

### Why It Matters

It reduces import mistakes.

The user can confirm whether the file is ready before uploading it.

---

## 34. Export Excel

Export Excel downloads the current stored data.

### Why It Matters

It is useful for:

- backup
- sharing data with others
- offline review
- audit support

---

## 35. Reset Data

Reset Data clears the current resource records.

### When To Use

- when testing a new dataset
- when old data is wrong
- when starting a fresh demo
- when moving to a new database

### Important Note

After reset, the dashboard may look empty until a new Excel file is imported.

---

## 36. Main Calculations In Simple Words

### Net Energy

```text
Net Energy = Gross Energy - Solar Energy
```

If solar is greater than gross energy, net energy becomes zero.

### Grid Export

```text
Grid Export = Solar Energy - Gross Energy
```

If solar is less than gross energy, grid export is zero.

### Carbon

```text
Carbon = Net Grid Energy x Carbon Factor
```

### Energy Cost

```text
Energy Cost = Net Grid Energy x Cost Per kWh
```

### Green Index

Green Index is a combined score based on energy, water, and waste performance.

Simple idea:

- lower resource pressure improves the score
- better efficiency improves the score
- higher score means better sustainability condition

---

## 37. Important Terms

### Benchmark

A benchmark is a reference value used for comparison.

Example:

If benchmark energy is 100,000 kWh and actual usage is much lower, performance is considered better.

### Weighted Efficiency

Weighted Efficiency combines energy, water, and waste performance using different importance values.

Example:

Energy may be given more importance than waste because electricity has high cost and carbon impact.

### KPI

KPI means Key Performance Indicator.

It is an important number used to measure performance.

### Forecast

Forecast means future prediction based on past data and assumptions.

### Anomaly

Anomaly means unusual behavior in data.

### Occupancy

Occupancy means how active the campus is in a month.

### Carbon Factor

Carbon factor tells how much carbon is counted for each unit of grid electricity.

---

## 38. How To Explain The Project In A Demo

Use this simple order:

1. Start with login and dashboard access.
2. Show Overview and Campus Pulse.
3. Show KPI cards.
4. Show Comparison Analytics.
5. Show Carbon and Solar sections.
6. Show Resource Visualization.
7. Show AI Forecast and Risk.
8. Show Scenario Simulator.
9. Show Governance settings.
10. Show Executive Report.
11. Show Import, Export, and Reset options.

### Simple Opening Line

"This project is a smart sustainability dashboard for campus operations. It brings electricity, water, waste, and solar data into one place and converts it into useful insights, forecasts, and management reports."

### Simple Closing Line

"The main value is that management can understand current performance, future risk, and recommended actions from one dashboard instead of manually analyzing multiple Excel files."

---

## 39. What Makes This Project Smart

MGCD is smarter than a normal dashboard because it includes:

- AI-style forecasting
- occupancy-aware planning
- confidence range
- anomaly detection
- risk scoring
- recommendation generation
- action tracking
- scenario simulation
- editable assumptions
- data quality scoring
- executive reporting

This makes it useful for decision support, not just data display.

---

## 40. Future Features That Can Be Added

The project can be expanded with:

- real-time smart meter integration
- weather-aware prediction
- holiday and exam schedule planning
- hostel-wise occupancy data
- water leakage detection
- solar underperformance diagnosis
- automated monthly PDF reports
- role-based access for admin and viewers
- email or WhatsApp alerts
- maintenance ticket creation from recommendations
- battery and grid export simulation
- department-wise sustainability comparison

---

## 41. One Paragraph Summary

MGCD is a campus sustainability intelligence platform that tracks electricity, water, waste, solar, carbon, building performance, AI forecasts, risks, alerts, recommendations, goals, actions, and reports. It helps management understand current performance, compare periods, plan future demand, test improvement scenarios, and explain sustainability decisions clearly through a professional dashboard.
