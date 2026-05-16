# Green Campus Section Guide

This guide explains the website in simple language so you can understand each section and explain it clearly to someone else.

## 1. What This Website Is

Green Campus is a dashboard for managing:

- electricity use
- water use
- waste generation
- solar generation
- carbon impact
- future prediction and planning

The goal is to help a campus understand current performance and make better decisions for future resource management.

## 2. Main Dashboard Views

The dashboard is now divided into focused views so the user does not have to scan one very long page.

The UI now also includes:

- a built-in PDF guide in the sidebar
- small help badges beside important headings

These are meant to help non-technical users understand the page without searching elsewhere.

### Overview

This is the first operational view.

It is used to understand:

- what campus or building is currently selected
- what forecast mode is active
- what the current utility totals look like
- what the next occupancy and seasonal situation may be

This view is best for giving a quick introduction to the current situation.

It now has a clearer layout:

- a main workspace for pulse, comparison, KPI cards, and seasonal reading
- a support rail for goals and action tracking

Simple example:

- if you want to quickly show the current campus condition to someone, open this mode first
- it gives the fastest overall understanding

### Intelligence

This view is about deeper performance analysis.

It contains:

- carbon footprint section
- solar section
- data quality and forecast trust section
- alert center
- resource mix chart
- energy and solar trend charts

This view is useful when someone asks:

- where are we spending the most resource?
- how much is solar helping?
- are there any warning signs?

Simple example:

- if someone asks why electricity cost is high or whether solar is helping, this is the best mode to open

This view now feels more focused because:

- the main workspace shows carbon, solar, and trend analysis
- the support rail highlights data trust, alerts, and attention points

### Data Quality and Forecast Trust

This section checks whether the imported Excel data is reliable enough for charts, forecasts, and reports.

It looks for:

- how many months of history are available
- missing months in each resource sheet
- duplicate readings for the same building and date
- zero or negative values that may be mistakes
- whether there is enough history for stronger forecasting

Simple example:

- if energy has 12 months of records and no duplicate readings, the score will be strong
- if water is missing several months, the dashboard will still work but the trust level may become medium
- if required data is missing, the trust level becomes low and the section tells the user what to fix

This is useful before a demo or report because it tells the user whether the dashboard numbers can be trusted.

### Planning Studio

This is the AI-focused view.

It contains:

- AI insights
- AI risk engine
- scenario simulator
- forecast studio

This view helps explain what may happen next and what actions may improve the situation.

Simple example:

- if you want to show how June demand may reduce because students are away, use this mode

This view now separates:

- main planning tools like forecast and simulation
- support intelligence like AI risk and recommendation panels

### Governance

This view is for explanation and decision support.

It contains:

- building ranking
- assumptions panel
- terminology and settings

This is useful for teachers, management, sustainability teams, or reviewers who want to understand how the dashboard is working.

Simple example:

- if someone asks how the score is being calculated or which building is best, this is the right mode

This view now separates:

- editable operational settings
- ranking and explanation panels
- assumption and terminology help

### Executive Report

This is the clean report-style view.

It is best for:

- screenshots
- meetings
- presenting to management
- print/PDF style review

It collects the most important information into a simple summary format.

Simple example:

- if you want one clean page for a meeting or screenshot, use this mode

Important:

- when using `Print Report`, only the detailed executive report should be printed
- the normal explanation sections are for learning and walkthrough, not for the printed management report

## 3. Top Hero Section

The top hero section is the command center.

It shows:

- selected building scope
- selected forecast mode
- selected date range
- workspace state
- data controls

This is where the user starts.

### Campus Pulse

Campus Pulse is a quick sentence-style summary shown near the top of the overview.

It tells the user:

- current Green Index
- current risk level
- future occupancy hint
- one simple explanation line about the present campus state

This is useful because someone can understand the main situation in a few seconds.

### Strategic Goal Tracking

This is the goal board shown in the overview side rail.

It lets you set clear targets like:

- Green Index target
- solar offset target
- water per student target
- monthly energy cost target

Why it is useful:

- it helps define what success should look like
- it shows whether the current scope is on track or needs attention
- it turns the dashboard into a planning tool, not only a monitoring screen

Simple example:

- if the Green Index target is `88` and the current value is `82`, the goal card shows that more improvement is still needed

### Action Board

This is the recommendation workflow panel.

It lets a team mark each AI recommendation as:

- suggested
- planned
- in progress
- completed

What each status means:

- `Suggested` means the dashboard is proposing the action but nobody has started it yet
- `Planned` means the team has accepted the idea and should assign owner/time next
- `In Progress` means implementation is underway and later comparisons should start reflecting it
- `Completed` means the work is finished and future KPI/comparison views should be checked for proof of impact

Why it is useful:

- it helps teams follow up on actions
- it connects dashboard insight to real operational work

Simple example:

- if the system suggests “Shift Non-Critical Loads”, the team can mark it as `planned` and later update it to `completed`

### Detail Drawer

Many cards can now be clicked.

When clicked, a detail drawer opens from the side and explains:

- what the item means
- why it matters
- how to read the value
- short points that are easy to explain to others

Why it is useful:

- the dashboard stays clean
- deeper explanation is available only when needed

## 4. Data Controls

The data controls are used to manage Excel files and reset the dataset.

### Import Excel

This uploads a new campus workbook and replaces old resource records.

Use this when:

- you have a new dataset
- you want to test a realistic sample
- you want fresh live numbers

### Export Excel

This downloads the currently stored system data into a workbook.

It is useful for:

- sharing data outside the website
- keeping a snapshot of the current system
- management or audit review

### Reset Data

This clears energy, water, waste, and solar records from the current dataset.

### Workbook Check

Before import, the dashboard now checks the Excel file structure.

It can show:

- which sheets are present
- how many rows each sheet has
- whether required columns are missing
- whether water values looked like liters and were converted to `kl`

This makes uploads safer and easier to explain.

Use this before importing a fresh dataset if you want a clean start.

## 5. KPI Cards

These are the quick summary cards.

KPI means **Key Performance Indicator**.

They are shown first because they answer the most basic questions quickly.

### Gross Energy

This is the total electricity demand before solar is subtracted.

### Water Consumption

This is the total water use in the selected campus or building scope.

### Waste Generated

This is the total tracked waste in the selected scope.

### Solar Generated

This is the total solar energy produced in the selected scope.

### Net Grid Energy

This is the electricity still needed after solar support.

Formula:

`Net Energy = max(Gross Energy - Solar, 0)`

### Green Index

This is a combined sustainability score.

Higher is better.

It helps give one overall performance number instead of only separate raw totals.

## 5A. Comparison Analytics

This is a new section near the overview.

It compares the selected date window with the immediately previous period of the same length.

Example:

- if you choose April to June
- the system compares it with January to March

It shows whether these have gone up or down:

- net energy
- water
- waste
- carbon
- Green Index
- energy cost

This is very useful in demos because it answers not only “what is happening now?” but also “is this better or worse than before?”

Simple example:

- if Campus A has a Green Index of 78 and Campus B has 61, Campus A is performing better overall

## 6. Seasonal Intelligence

This section helps explain how occupancy affects future demand.

Example:

- when students are away in June or July, demand may fall
- solar may cover a larger share of demand
- export potential may increase

This section shows:

- current occupancy
- next occupancy
- next energy forecast
- possible solar export
- short recommendations

## 7. Carbon Footprint Section

This section explains energy impact in carbon terms.

### Gross Carbon

This is the carbon linked to total electricity demand before solar benefit.

### Solar Avoided Carbon

This is the carbon saved because solar reduced how much electricity had to come from the grid.

### Net Carbon

This is the carbon linked only to the remaining grid electricity after solar contribution.

### Solar Offset

This means how much of the electricity demand was covered by solar.

### Export Potential

If solar becomes greater than total demand, the extra amount is called export potential.

Formula:

`Export Potential = max(Solar - Gross Energy, 0)`

## 8. Solar Operations Section

This section focuses only on solar value.

It shows:

- solar contribution
- carbon avoided
- cost shielding
- export possibility

This helps explain why solar is important not only for sustainability but also for cost and planning.

## 9. Alert Center

This section highlights important issues.

Examples:

- energy spike
- possible water leak
- waste surge
- forecast risk
- export-ready days

This is useful because a user does not need to manually study every chart to notice a problem.

## 10. Resource Mix Chart

This is the pie/doughnut chart for electricity, water, waste, and solar.

It gives a quick visual idea of which resource is dominating the current mix.

It is helpful in demos because people understand it quickly.

## 11. Trend Charts

These charts show how values change over time.

They help answer:

- is usage going up?
- is solar keeping up?
- are we becoming more efficient?

## 12. AI Insights

This section gives plain-language interpretation from the data.

It contains:

- anomalies
- opportunities
- recommendations

### Anomalies

These are unusual changes compared to recent behavior.

Example:

- energy moved 25% above recent average

### Opportunities

These show where improvement or savings may exist.

Example:

- high cost exposure
- solar offset opportunity
- peer efficiency gap

### Recommendations

These are suggested actions.

Now the system also shows estimated impact such as:

- kWh savings
- rupee savings
- carbon reduction

## 13. AI Risk Engine

This section explains future risk in a simple way.

It uses:

- growth trend
- volatility
- confidence range
- occupancy effect
- projected energy window

It also shows a primary driver statement so you can explain **why** the risk is high, medium, or low.

### Confidence Range

Confidence range means the forecast is shown as a likely lower and upper band instead of only one fixed number.

Simple example:

- predicted next-month energy = 42,000 kWh
- confidence range = 39,000 to 45,000 kWh

This means the system expects the actual result to probably stay around that band.

It is useful because real life is uncertain and the system should not pretend that one exact number is always guaranteed.

### Confidence Explanation

The forecast now also gives a short reason for why the confidence band is narrow or wide.

Simple example:

- if past months are very stable, the range stays narrow
- if past months change a lot, the range becomes wider

### Occupancy Effect

Occupancy effect means future demand changes because campus activity changes.

Simple example:

- if student occupancy is lower in June, energy and water may reduce
- if full academic activity returns in September, energy may rise again

## 14. Forecast Studio

This section predicts future values for:

- energy
- water
- waste
- solar

It supports:

- daily
- monthly
- yearly
- seasonal

### What These Forecast Modes Mean

#### Daily Mode

Daily mode predicts near-future day-wise behavior.

Use this when you want to see short-term changes, spikes, or immediate planning needs.

Simple example:

- tomorrow or next week electricity may be slightly higher than recent days

#### Monthly Mode

Monthly mode predicts broader month-wise demand.

Use this for management planning and comparing academic months.

Simple example:

- June may be lower because of vacation
- September may be higher because campus is fully active again

#### Yearly Mode

Yearly mode gives a long-term high-level trend.

Use this when you want to speak about campus direction rather than short-term operations.

Simple example:

- next year net energy may rise if building usage grows

#### Seasonal Mode

Seasonal mode groups behavior into seasonal patterns such as winter, summer, monsoon, and post-monsoon.

Use this when climate and occupancy both affect the result.

Simple example:

- monsoon may reduce solar generation
- summer may increase cooling demand
- vacation months can reduce occupancy at the same time

The current smarter forecast now also includes:

- occupancy-aware adjustment
- lower and upper range
- baseline mean
- recent mean
- variability score

This makes the forecast easier to trust and explain.

### Baseline Mean

Baseline mean is the average historical level used as a normal reference.

Simple example:

- if monthly energy is usually around 40,000 kWh, that becomes the baseline mean

### Recent Mean

Recent mean is the average of the latest values, so it shows current recent behavior.

Simple example:

- if the last few months are higher than the older average, recent mean may be above baseline mean

### Variability Score

Variability score shows how unstable or changing a resource has been.

Simple example:

- if one month is 20,000 and another is 50,000, variability is high
- if every month is close to 40,000, variability is low

## 15. Scenario Simulator

This is the what-if planning tool.

You can change:

- energy reduction
- water reduction
- waste reduction
- solar increase

Then the dashboard shows:

- baseline result
- projected result
- impact result

This helps explain how policy or operational changes may affect cost, carbon, and sustainability score.

## 16. Building Ranking

This section compares buildings.

It helps identify:

- which building is performing best
- which building needs attention
- how net energy, solar, water, waste, and carbon differ

This is useful for building-wise campus action planning.

## 17. Assumptions and Terminology

This section explains the rules and values used by the dashboard.

Examples:

- carbon factor
- energy cost
- benchmarks
- thresholds
- occupancy factors

This section is very helpful when someone asks:

- how are you calculating these numbers?
- why is this score high or low?

The Governance view now also lets you directly edit the most important live parameters.

Examples:

- carbon factor
- electricity cost per unit
- energy, water, and waste benchmarks
- anomaly thresholds
- Green Index weights

So a user does not have to change backend code just to test a different assumption.

The same section now also explains monthly occupancy values in simple language.

Simple examples:

- `1.0` means normal/full activity
- `0.9` means slightly reduced activity
- `0.5` means partial activity or vacation period
- `0.2` means very low activity

These values are activity multipliers, not exact percentages.

It also now connects to editable settings for:

- monthly occupancy
- student population
- hostel population
- built-up area
- monthly energy budget

This means the dashboard can be adjusted to your real campus planning conditions.

## 18. Important Terms In Simple Language

### Benchmark

A benchmark is a reference value used for comparison.

If actual usage is high compared to the benchmark, performance is considered worse.

### Weighted Efficiency

This is a combined pressure score made from energy, water, and waste after giving each one different importance.

In this project:

- energy weight = 0.5
- water weight = 0.3
- waste weight = 0.2

Simple example:

- energy affects the final score the most because its weight is highest
- water affects the next most
- waste affects the least among the three

### Gross Energy

Total electricity before subtracting solar.

### Net Energy

Electricity still needed after solar support.

### Gross Carbon

Carbon linked to the full electricity demand.

### Net Carbon

Carbon linked only to the remaining grid demand.

### Forecast Range

This means the prediction is not just one number. It gives a likely lower and upper band.

Simple example:

- instead of saying next energy will be exactly 50,000
- the system says it may stay between 47,000 and 53,000

That is easier to explain honestly in real life.

### Occupancy Effect

This shows how student/staff campus activity is affecting expected future demand.

Simple example:

- fewer students in hostel means less electricity and water demand
- full classroom activity means higher demand again

### Date Range Filter

This lets you focus only on a chosen time period.

Simple example:

- show only one semester
- show only summer break
- show only the latest quarter

The selected date range changes summary cards, comparison cards, trends, alerts, forecasts, and simulation.

## 19. Best Way To Explain The Website In A Demo

Use this order:

1. Login
2. Overview
3. KPI cards
4. Comparison analytics
5. Seasonal intelligence
6. Carbon and solar
7. Alert center and charts
8. AI insights and risk
9. Forecast studio
10. Scenario simulator
11. Governance
12. Executive report
13. Import/export/reset

This order is easy for a listener to follow.

## 20. Final Summary

This project is not only a dashboard.

It is a campus decision-support system that helps:

- monitor resource usage
- understand current sustainability performance
- predict future demand
- detect unusual behavior
- compare buildings
- explain calculations clearly
- present results professionally

If you want, this document can later be expanded again whenever new features are added.

## 21. What More Can Be Added Later

The project is already strong, but it can become even more advanced.

Good next additions could be:

- weather-aware forecasting
- holiday and event-aware prediction
- hostel vs academic block comparison
- leak suspicion score for water
- solar underperformance diagnosis
- monthly management PDF export
- alert acknowledgement workflow
- building maintenance suggestion system
- target-vs-actual sustainability goals

These features would make the platform even more practical for real campus operations.
