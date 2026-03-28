import React from "react";
import { dashboardCopy } from "../config/dashboardConfig";

const { theme } = dashboardCopy;

function Card({ title, value, subtitle, accent }) {
  return (
    <div style={{ ...styles.card, borderTop: `6px solid ${accent}` }}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>{value}</div>
      <div style={styles.cardSubtitle}>{subtitle}</div>
    </div>
  );
}

export default function DashboardCards({ data }) {
  const solarImpact =
    data.energy > 0 ? ((data.solar / data.energy) * 100).toFixed(1) : 0;

  return (
    <div style={styles.grid}>
      <Card
        title={dashboardCopy.kpis.grossEnergy.title}
        value={`${data.energy} kWh`}
        subtitle={dashboardCopy.kpis.grossEnergy.subtitle}
        accent="#f59e0b"
      />
      <Card
        title={dashboardCopy.kpis.water.title}
        value={`${data.water} KL`}
        subtitle={dashboardCopy.kpis.water.subtitle}
        accent="#0284c7"
      />
      <Card
        title={dashboardCopy.kpis.waste.title}
        value={`${data.waste} kg`}
        subtitle={dashboardCopy.kpis.waste.subtitle}
        accent="#14b8a6"
      />
      <Card
        title={dashboardCopy.kpis.solar.title}
        value={`${data.solar} kWh`}
        subtitle={`${solarImpact}% ${dashboardCopy.kpis.solar.subtitleSuffix}`}
        accent="#84cc16"
      />
      <Card
        title={dashboardCopy.kpis.net.title}
        value={`${data.net_energy} kWh`}
        subtitle={dashboardCopy.kpis.net.subtitle}
        accent="#2563eb"
      />
      <Card
        title={dashboardCopy.kpis.greenIndex.title}
        value={`${data.green_index}%`}
        subtitle={dashboardCopy.kpis.greenIndex.subtitle}
        accent="#1b7f62"
      />
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },
  card: {
    background: "rgba(255,255,255,0.96)",
    borderRadius: theme.radius.card,
    padding: "18px",
    boxShadow: "0 18px 40px rgba(12, 24, 21, 0.08)",
  },
  cardTitle: {
    color: theme.colors.secondaryText,
    fontSize: theme.fontSizes.cardTitle,
    fontWeight: "600",
  },
  cardValue: {
    color: theme.colors.primaryText,
    fontSize: theme.fontSizes.cardValue,
    fontWeight: "700",
    marginTop: "8px",
  },
  cardSubtitle: {
    color: theme.colors.secondaryText,
    marginTop: "8px",
    lineHeight: 1.4,
    fontSize: theme.fontSizes.cardSubtitle,
  },
};
