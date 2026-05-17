import React from "react";
import GaugeChart from "react-gauge-chart";
import { dashboardCopy } from "../config/dashboardConfig";

const { theme } = dashboardCopy;

function CarbonFootprintDial({ data }) {
  if (!data) {
    return null;
  }

  const carbonTon = data.carbon / 1000;
  const grossCarbonTon = (data.gross_carbon || 0) / 1000;
  const avoidedCarbonTon = (data.solar_avoided_carbon || 0) / 1000;
  const percent = Math.min(carbonTon / 5, 1);

  return (
    <div style={styles.card} className="premium-card lift-card stagger-in stagger-in-delay-1">
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>{dashboardCopy.carbon.title}</h2>
          <p style={styles.subtitle}>{dashboardCopy.carbon.subtitle}</p>
        </div>
        <div style={styles.exportPill}>
          {dashboardCopy.carbon.exportLabel}: {data.export_to_grid_kwh} kWh
        </div>
      </div>

      <div style={styles.layout} className="carbon-footprint-layout">
        <div style={styles.gaugeWrap}>
          <GaugeChart
            id="carbon-gauge"
            nrOfLevels={24}
            percent={percent}
            colors={["#22c55e", "#f59e0b", "#dc2626"]}
            arcWidth={0.24}
            textColor={theme.colors.primaryText}
          />
        </div>

        <div style={styles.primaryMetricBlock}>
          <strong style={styles.mainValue}>{carbonTon.toFixed(2)} tCO2</strong>
          <span style={styles.mainCaption}>{dashboardCopy.carbon.netLabel}</span>
        </div>

        <div style={styles.breakdown}>
          <Metric title={dashboardCopy.carbon.cards.gross} value={`${grossCarbonTon.toFixed(2)} tCO2`} />
          <Metric title={dashboardCopy.carbon.cards.avoided} value={`${avoidedCarbonTon.toFixed(2)} tCO2`} />
          <Metric title={dashboardCopy.carbon.cards.net} value={`${carbonTon.toFixed(2)} tCO2`} />
          <Metric title={dashboardCopy.carbon.cards.offset} value={`${data.energy > 0 ? ((data.solar / data.energy) * 100).toFixed(1) : 0}%`} />
        </div>
      </div>
    </div>
  );
}

function Metric({ title, value }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricTitle}>{title}</div>
      <div style={styles.metricValue}>{value}</div>
    </div>
  );
}

const styles = {
  card: {
    background: theme.colors.surface,
    padding: "24px",
    borderRadius: theme.radius.card,
    boxShadow: "0 18px 40px rgba(12, 24, 21, 0.08)",
    marginBottom: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  title: {
    margin: 0,
    color: theme.colors.primaryText,
  },
  subtitle: {
    marginTop: "8px",
    color: theme.colors.secondaryText,
  },
  exportPill: {
    background: "#eff8f2",
    color: theme.colors.accent,
    padding: "10px 14px",
    borderRadius: "999px",
    fontWeight: "600",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
    alignItems: "center",
    marginTop: "16px",
  },
  gaugeWrap: {
    position: "relative",
    minHeight: "250px",
  },
  primaryMetricBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    marginTop: "-6px",
    marginBottom: "8px",
    textAlign: "center",
  },
  mainValue: {
    fontSize: theme.fontSizes.cardValue,
    color: theme.colors.primaryText,
    lineHeight: 1.1,
  },
  mainCaption: {
    color: theme.colors.secondaryText,
  },
  breakdown: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "14px",
  },
  metricCard: {
    background: theme.colors.softSurface,
    borderRadius: "18px",
    padding: "18px",
    minHeight: "118px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  metricTitle: {
    color: theme.colors.secondaryText,
    fontSize: theme.fontSizes.cardSubtitle,
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
  metricValue: {
    color: theme.colors.primaryText,
    fontSize: theme.fontSizes.metricValue,
    fontWeight: "700",
    marginTop: "6px",
    lineHeight: 1.25,
    wordBreak: "break-word",
  },
};

export default CarbonFootprintDial;
