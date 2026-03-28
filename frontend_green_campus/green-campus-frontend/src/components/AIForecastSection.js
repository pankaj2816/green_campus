import React from "react";

import AIForecastChart from "./AIForecastChart";
import { dashboardCopy } from "../config/dashboardConfig";

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
        color={color}
      />
    </div>
  );
}

function AIForecastSection({ forecastData, granularity }) {
  if (!forecastData) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={{ margin: 0 }}>{dashboardCopy.forecast.title}</h3>
          <p style={styles.subtext}>
            {forecastData.horizon_label} {dashboardCopy.forecast.subtitlePrefix} {granularity} {dashboardCopy.forecast.subtitleMiddle} {forecastData.building}.
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
    background: "#ffffff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
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
    color: "#5d6f6a",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginTop: "15px",
  },
  card: {
    background: "#f9fafc",
    padding: "15px",
    borderRadius: "12px",
  },
};

export default AIForecastSection;
