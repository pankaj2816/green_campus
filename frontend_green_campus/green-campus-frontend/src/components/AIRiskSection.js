import React from "react";
import { dashboardCopy } from "../config/dashboardConfig";

function AIRiskSection({ riskData }) {
  if (!riskData || riskData.length === 0) {
    return null;
  }

  const risk = riskData[0];

  return (
    <div style={styles.container}>
      <h3 style={{ marginTop: 0 }}>{dashboardCopy.risk.title}</h3>
      <p style={styles.subtext}>{risk.message}</p>

      <div style={styles.grid}>
        <MetricCard title={dashboardCopy.risk.cards.level} value={risk.risk_level} accent={getRiskColor(risk.risk_level)} />
        <MetricCard title={dashboardCopy.risk.cards.trend} value={risk.trend_direction} />
        <MetricCard title={dashboardCopy.risk.cards.growth} value={`${risk.growth_percent}%`} />
        <MetricCard title={dashboardCopy.risk.cards.volatility} value={`${risk.volatility_percent}%`} />
        <MetricCard title={dashboardCopy.risk.cards.projectedEnergy} value={`${risk.projected_energy} kWh`} />
        <MetricCard title={dashboardCopy.risk.cards.projectedCost} value={`Rs ${risk.projected_cost}`} />
        <MetricCard title={dashboardCopy.risk.cards.projectedCarbon} value={`${risk.projected_carbon} kg CO2`} />
      </div>
    </div>
  );
}

function MetricCard({ title, value, accent }) {
  return (
    <div style={{ ...styles.card, borderTop: accent ? `5px solid ${accent}` : "5px solid transparent" }}>
      <h4 style={styles.cardTitle}>{title}</h4>
      <p style={styles.cardValue}>{value}</p>
    </div>
  );
}

function getRiskColor(level) {
  if (level === "HIGH") return "#dc2626";
  if (level === "MEDIUM") return "#f59e0b";
  return "#16a34a";
}

const styles = {
  container: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
    marginBottom: "20px",
  },
  subtext: {
    color: "#576b64",
    marginBottom: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
  },
  card: {
    background: "#f8fbfa",
    borderRadius: "12px",
    padding: "16px",
  },
  cardTitle: {
    margin: "0 0 8px 0",
    color: "#5a6d67",
    fontSize: "14px",
  },
  cardValue: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
    color: "#15332d",
  },
};

export default AIRiskSection;
