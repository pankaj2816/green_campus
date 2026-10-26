import React from "react";

import AIForecastChart from "./AIForecastChart";
import { dashboardCopy } from "../config/dashboardConfig";

const { theme } = dashboardCopy;

function ForecastCard({ title, payload, color, unit }) {
  if (!payload) {
    return null;
  }
  if (Array.isArray(payload.historical_values) && payload.historical_values.length === 0) {
    return (
      <div style={styles.card}>
        <h4 style={{ marginTop: 0 }}>{title}</h4>
        <p style={styles.caption}>No measured records; forecast not assessed.</p>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h4 style={{ marginTop: 0 }}>{title}</h4>
      <AIForecastChart
        historicalValues={payload.historical_values}
        historicalLabels={payload.historical_labels}
        forecastValues={payload.forecast_values}
        forecastLabels={payload.forecast_labels}
        forecastLower={payload.forecast_lower}
        forecastUpper={payload.forecast_upper}
        color={color}
        unit={unit}
      />
      <p style={styles.caption}>
        Baseline: {payload.baseline_mean} | Recent: {payload.recent_mean} | Variability: {payload.variability_score}
      </p>
      <details style={styles.reasonText}>
        <summary style={{ cursor: "pointer", fontWeight: "600" }}>How this forecast works</summary>
        {payload.forecast_method ? <p style={styles.reasonText}>Method: {payload.forecast_method.replaceAll("_", " ")}</p> : null}
        {payload.method_description ? <p style={styles.reasonText}>{payload.method_description}</p> : null}
        {payload.spread_type ? <p style={styles.reasonText}>Spread: {payload.spread_type.replaceAll("_", " ")}</p> : null}
        {payload.spread_backtest_cases != null ? <p style={styles.reasonText}>Historical error cases used for spread: {payload.spread_backtest_cases}</p> : null}
        {typeof payload.occupancy_adjustment_applied === "boolean" ? (
          <p style={styles.reasonText}>Occupancy adjustment applied to main forecast: {payload.occupancy_adjustment_applied ? "Yes" : "No"}.{payload.occupancy_adjustment_applied === false ? " The main forecast is the baseline; occupancy what-if values are a separate scenario, not the baseline or measured attendance." : ""}</p>
        ) : null}
        {payload.occupancy_note ? <p style={styles.reasonText}>{payload.occupancy_note}</p> : null}
        {payload.occupancy_scenario_values?.[0] != null ? (
          <p style={styles.reasonText}>Separate occupancy what-if scenario{payload.forecast_labels?.[0] ? ` (${payload.forecast_labels[0]})` : " (first period)"}: {payload.occupancy_scenario_values[0]} {unit}. Not the main forecast.</p>
        ) : null}
        {payload.confidence_reasons?.[0] ? (
          <p style={styles.reasonText}>{payload.confidence_reasons[0].replace(/confidence range/gi, "forecast spread")}</p>
        ) : null}
      </details>
    </div>
  );
}

function AIForecastSection({ forecastData, granularity }) {
  if (!forecastData) {
    return null;
  }

  return (
    <div style={styles.container} className="premium-card lift-card stagger-in stagger-in-delay-3">
      <div style={styles.header}>
        <div>
          <h3 style={{ margin: 0 }}>{dashboardCopy.forecast.title}</h3>
          <p style={styles.subtext}>
            {forecastData.horizon_label} {dashboardCopy.forecast.subtitlePrefix} {granularity} {dashboardCopy.forecast.subtitleMiddle} {forecastData.building}.
          </p>
          <p style={styles.subtext}>Forecast spreads illustrate variability and uncertainty; they are not calibrated confidence intervals or a guarantee of future coverage.</p>
          {forecastData.future_occupancy_average != null ? (
            <p style={styles.meta}>
              Modeled occupancy factor for upcoming periods: {Math.round(forecastData.future_occupancy_average * 100)}% (not measured attendance)
            </p>
          ) : null}
        </div>
      </div>

      <div style={styles.grid}>
        <ForecastCard title={dashboardCopy.forecast.cards.energy} payload={forecastData.energy} color="#d97706" unit="kWh" />
        <ForecastCard title={dashboardCopy.forecast.cards.water} payload={forecastData.water} color="#0284c7" unit="kl" />
        <ForecastCard title={dashboardCopy.forecast.cards.waste} payload={forecastData.waste} color="#0f766e" unit="kg" />
        <ForecastCard title={dashboardCopy.forecast.cards.solar} payload={forecastData.solar} color="#65a30d" unit="kWh" />
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: theme.colors.surface,
    padding: "22px",
    borderRadius: theme.radius.card,
    boxShadow: theme.shadows.card,
    marginBottom: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  subtext: {
    marginTop: "8px",
    color: theme.colors.secondaryText,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
    gap: "20px",
    marginTop: "15px",
  },
  card: {
    background: theme.colors.softSurface,
    padding: "16px",
    borderRadius: "18px",
  },
  caption: {
    margin: "10px 0 0",
    color: theme.colors.secondaryText,
    fontSize: "13px",
  },
  meta: {
    margin: "8px 0 0",
    color: theme.colors.accent,
    fontSize: "13px",
    fontWeight: "600",
  },
  reasonText: {
    margin: "10px 0 0",
    color: "#35514a",
    fontSize: "12px",
    lineHeight: 1.5,
  },
};

export default AIForecastSection;
