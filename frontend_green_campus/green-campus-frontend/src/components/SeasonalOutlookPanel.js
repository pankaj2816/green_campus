import React from "react";
import { dashboardCopy } from "../config/dashboardConfig";

function SeasonalOutlookPanel({ outlook }) {
  if (!outlook) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={{ margin: 0 }}>{dashboardCopy.seasonal.title}</h3>
          <p style={styles.subtext}>{outlook.headline}</p>
        </div>
        <div style={styles.scopePill}>{outlook.scope}</div>
      </div>

      <div style={styles.metrics}>
        <MetricCard
          title={dashboardCopy.seasonal.cards.currentOccupancy}
          value={`${Math.round(outlook.current_occupancy_factor * 100)}%`}
          caption={outlook.current_month}
        />
        <MetricCard
          title={dashboardCopy.seasonal.cards.nextOccupancy}
          value={`${Math.round(outlook.next_occupancy_factor * 100)}%`}
          caption={outlook.next_month}
        />
        <MetricCard
          title={dashboardCopy.seasonal.cards.nextEnergy}
          value={`${outlook.forecast_energy_next_period} kWh`}
          caption={dashboardCopy.seasonal.captions.seasonalForecast}
        />
        <MetricCard
          title={dashboardCopy.seasonal.cards.exportPotential}
          value={`${outlook.potential_export_kwh} kWh`}
          caption={dashboardCopy.seasonal.captions.possibleExcess}
        />
      </div>

      <div style={styles.recommendations}>
        {outlook.recommendations.map((item, index) => (
          <div key={index} style={styles.tipCard}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ title, value, caption }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricTitle}>{title}</div>
      <div style={styles.metricValue}>{value}</div>
      <div style={styles.metricCaption}>{caption}</div>
    </div>
  );
}

const styles = {
  container: {
    background: "linear-gradient(135deg, #19322d 0%, #21443c 100%)",
    color: "#f5fbf8",
    padding: "24px",
    borderRadius: "24px",
    boxShadow: "0 20px 40px rgba(10, 24, 21, 0.18)",
    marginBottom: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
  },
  subtext: {
    color: "rgba(245,251,248,0.82)",
    maxWidth: "720px",
    marginTop: "8px",
  },
  scopePill: {
    background: "rgba(255,255,255,0.12)",
    padding: "10px 14px",
    borderRadius: "999px",
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginTop: "18px",
  },
  metricCard: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "16px",
  },
  metricTitle: {
    color: "rgba(245,251,248,0.74)",
    fontSize: "13px",
  },
  metricValue: {
    fontSize: "28px",
    fontWeight: "700",
    marginTop: "4px",
  },
  metricCaption: {
    color: "rgba(245,251,248,0.7)",
    marginTop: "6px",
    fontSize: "12px",
  },
  recommendations: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "12px",
    marginTop: "18px",
  },
  tipCard: {
    background: "rgba(255,255,255,0.1)",
    borderRadius: "14px",
    padding: "14px",
    lineHeight: 1.5,
  },
};

export default SeasonalOutlookPanel;
