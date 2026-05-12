import React from "react";
import { dashboardCopy } from "../config/dashboardConfig";
import InfoHint from "./InfoHint";

function AIRiskSection({ riskData }) {
  if (!riskData || riskData.length === 0) {
    return null;
  }

  const risk = riskData[0];

  return (
    <div style={styles.container} className="premium-card lift-card stagger-in stagger-in-delay-2">
      <h3 style={{ marginTop: 0 }}>
        {dashboardCopy.risk.title}
        <InfoHint
          title="What AI Risk Engine means"
          text="This section estimates whether future campus demand looks low, medium, or high risk based on forecast growth, variability, uncertainty, and occupancy effect."
          width={320}
        />
      </h3>
      <p style={styles.subtext}>{risk.message}</p>

      <div style={styles.grid}>
        <MetricCard title={dashboardCopy.risk.cards.level} value={risk.risk_level} accent={getRiskColor(risk.risk_level)} />
        <MetricCard title={dashboardCopy.risk.cards.trend} value={risk.trend_direction} />
        <MetricCard title={dashboardCopy.risk.cards.growth} value={`${risk.growth_percent}%`} />
        <MetricCard title={dashboardCopy.risk.cards.volatility} value={`${risk.volatility_percent}%`} />
        <MetricCard title={dashboardCopy.risk.cards.confidence} value={`${risk.confidence_band_percent}%`} />
        <MetricCard title={dashboardCopy.risk.cards.occupancy} value={`${risk.occupancy_impact_percent}%`} />
        <MetricCard title={dashboardCopy.risk.cards.projectedEnergy} value={`${risk.projected_energy} kWh`} />
        <MetricCard
          title={dashboardCopy.risk.cards.projectedWindow}
          value={`${risk.projected_energy_low} - ${risk.projected_energy_high} kWh`}
        />
        <MetricCard title={dashboardCopy.risk.cards.projectedCost} value={`Rs ${risk.projected_cost}`} />
        <MetricCard title={dashboardCopy.risk.cards.projectedCarbon} value={`${risk.projected_carbon} kg CO2`} />
      </div>

      <div style={styles.driverCard}>
        <strong>Primary driver</strong>
        <p style={styles.driverText}>{risk.primary_driver}</p>
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
  driverCard: {
    marginTop: "16px",
    padding: "16px",
    borderRadius: "14px",
    background: "#eff7f2",
  },
  driverText: {
    marginBottom: 0,
    color: "#35514a",
    lineHeight: 1.5,
    marginTop: "8px",
  },
};

export default AIRiskSection;
