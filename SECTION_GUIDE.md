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

### Overview

This is the first operational view.

It is used to understand:

- what campus or building is currently selected
- what forecast mode is active
- what the current utility totals look like
- what the next occupancy and seasonal situation may be

This view is best for giving a quick introduction to the current situation.

### Intelligence

This view is about deeper performance analysis.

It contains:

- carbon footprint section
- solar section
- alert center
- resource mix chart
- energy and solar trend charts

This view is useful when someone asks:

- where are we spending the most resource?
- how much is solar helping?
- are there any warning signs?

### Planning Studio

This is the AI-focused view.

It contains:

- AI insights
- AI risk engine
- scenario simulator
- forecast studio

This view helps explain what may happen next and what actions may improve the situation.

### Governance

This view is for explanation and decision support.

It contains:

- building ranking
- assumptions panel
- terminology and settings

This is useful for teachers, management, sustainability teams, or reviewers who want to understand how the dashboard is working.

### Executive Report

This is the clean report-style view.

It is best for:

- screenshots
- meetings
- presenting to management
- print/PDF style review

It collects the most important information into a simple summary format.

## 3. Top Hero Section

The top hero section is the command center.

It shows:

- selected building scope
- selected forecast mode
- workspace state
- data controls

This is where the user starts.

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

The current smarter forecast now also includes:

- occupancy-aware adjustment
- lower and upper range
- baseline mean
- recent mean
- variability score

This makes the forecast easier to trust and explain.

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

### Occupancy Effect

This shows how student/staff campus activity is affecting expected future demand.

## 19. Best Way To Explain The Website In A Demo

Use this order:

1. Login
2. Overview
3. KPI cards
4. Seasonal intelligence
5. Carbon and solar
6. Alert center and charts
7. AI insights and risk
8. Forecast studio
9. Scenario simulator
10. Governance
11. Executive report
12. Import/export/reset

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
