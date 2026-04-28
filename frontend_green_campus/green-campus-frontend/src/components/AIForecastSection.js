import React from "react";

import AIForecastChart from "./AIForecastChart";
import { dashboardCopy } from "../config/dashboardConfig";

const { theme } = dashboardCopy;

function ForecastCard({ title, payload, color }) {
  if (!payload) {
    return null;
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
      />
      <p style={styles.caption}>
        Baseline: {payload.baseline_mean} | Recent: {payload.recent_mean} | Variability: {payload.variability_score}
      </p>
      {payload.confidence_reasons?.[0] ? (
        <p style={styles.reasonText}>{payload.confidence_reasons[0]}</p>
      ) : null}
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
          <p style={styles.meta}>
            Occupancy-aware average for upcoming periods: {Math.round((forecastData.future_occupancy_average || 0) * 100)}%
          </p>
        </div>
      </div>

      <div style={styles.grid}>
        <ForecastCard title={dashboardCopy.forecast.cards.energy} payload={forecastData.energy} color="#d97706" />
        <ForecastCard title={dashboardCopy.forecast.cards.water} payload={forecastData.water} color="#0284c7" />
        <ForecastCard title={dashboardCopy.forecast.cards.waste} payload={forecastData.waste} color="#0f766e" />
        <ForecastCard title={dashboardCopy.forecast.cards.solar} payload={forecastData.solar} color="#65a30d" />
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
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
