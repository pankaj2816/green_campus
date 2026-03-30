import React from "react";

import { dashboardCopy } from "../config/dashboardConfig";

function formatNumber(value, suffix = "") {
  if (value === undefined || value === null) {
    return "-";
  }

  return `${Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}${suffix}`;
}

function SummaryMetric({ label, value, note }) {
  return (
    <div style={styles.metricCard}>
      <span style={styles.metricLabel}>{label}</span>
      <strong style={styles.metricValue}>{value}</strong>
      {note ? <span style={styles.metricNote}>{note}</span> : null}
    </div>
  );
}

function ExecutiveReportView({
  data,
  riskData,
  insightsData,
  performanceData,
  forecastData,
  seasonalOutlook,
}) {
  if (!data) {
    return null;
  }

  const risk = riskData?.[0];
  const topBuildings = (performanceData || []).slice(0, 3);
  const recommendations = (insightsData?.recommendations || []).slice(0, 3);

  return (
    <section style={styles.container} className="premium-card lift-card stagger-in stagger-in-delay-1 print-report-section">
      <div style={styles.brandRow}>
        <div style={styles.brandMark}>
          <strong>{dashboardCopy.branding.logoText}</strong>
          <span>{dashboardCopy.branding.logoSubtext}</span>
        </div>
        <div style={styles.orgMark}>
          <strong>{dashboardCopy.branding.organization}</strong>
          <span>{dashboardCopy.branding.tagline}</span>
        </div>
      </div>

      <div style={styles.header}>
        <div>
          <span style={styles.kicker}>{dashboardCopy.layout.reportSection.kicker}</span>
          <h2 style={styles.title}>{dashboardCopy.layout.reportSection.title}</h2>
          <p style={styles.subtitle}>{dashboardCopy.presentation.reportSubtitle}</p>
        </div>
        <div style={styles.scopeCard}>
          <span style={styles.scopeLabel}>Scope</span>
          <strong style={styles.scopeValue}>{data.scope}</strong>
        </div>
      </div>

      <div style={styles.summaryGrid}>
        <SummaryMetric label="Net Energy" value={formatNumber(data.net_energy, " kWh")} note="After solar support" />
        <SummaryMetric label="Water" value={formatNumber(data.water, " KL")} note="Current filtered scope" />
        <SummaryMetric label="Waste" value={formatNumber(data.waste, " kg")} note="Tracked waste output" />
        <SummaryMetric label="Green Index" value={formatNumber(data.green_index, "%")} note="Higher is better" />
      </div>

      <div style={styles.twoCol}>
        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>{dashboardCopy.presentation.quickSummaryTitle}</h3>
          <ul style={styles.list}>
            <li>Gross energy is {formatNumber(data.energy, " kWh")} and solar is {formatNumber(data.solar, " kWh")}.</li>
            <li>Net carbon is {formatNumber(data.carbon, " kg CO2")} with {formatNumber(data.solar_avoided_carbon, " kg CO2")} avoided by solar.</li>
            <li>
              Forecast outlook: {forecastData?.horizon_label || "No forecast"} with future occupancy around{" "}
              {Math.round((forecastData?.future_occupancy_average || 0) * 100)}%.
            </li>
            <li>
              Seasonal note: {seasonalOutlook?.headline || "Seasonal outlook not available."}
            </li>
          </ul>
        </div>

        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Risk Snapshot</h3>
          {risk ? (
            <ul style={styles.list}>
              <li>Risk level: {risk.risk_level}</li>
              <li>Trend direction: {risk.trend_direction}</li>
              <li>Forecast window: {risk.projected_energy_low} to {risk.projected_energy_high} kWh</li>
              <li>Primary driver: {risk.primary_driver}</li>
            </ul>
          ) : (
            <p style={styles.empty}>Risk data not available.</p>
          )}
        </div>
      </div>

      <div style={styles.twoCol}>
        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Top Building Performance</h3>
          {topBuildings.length > 0 ? (
            <div style={styles.rankList}>
              {topBuildings.map((item) => (
                <div key={item.building} style={styles.rankCard}>
                  <strong>{item.rank}. {item.building}</strong>
                  <span>Net Energy: {formatNumber(item.net_energy, " kWh")}</span>
                  <span>Carbon: {formatNumber(item.carbon, " kg CO2")}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.empty}>No building ranking data available.</p>
          )}
        </div>

        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Priority Recommendations</h3>
          {recommendations.length > 0 ? (
            <div style={styles.rankList}>
              {recommendations.map((item) => (
                <div key={item.title} style={styles.rankCard}>
                  <strong>{item.title}</strong>
                  <span>{item.message}</span>
                  <span>
                    Estimated impact: {item.estimated_savings_kwh} kWh | Rs {item.estimated_savings_rs}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.empty}>No recommendations generated.</p>
          )}
        </div>
      </div>
    </section>
  );
}

const styles = {
  container: {
    background: "#ffffff",
    borderRadius: "28px",
    padding: "24px",
    boxShadow: "0 18px 40px rgba(12, 24, 21, 0.08)",
    marginBottom: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  brandRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },
  brandMark: {
    display: "grid",
    gap: "4px",
    padding: "14px 16px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #17342d, #255b89)",
    color: "#ffffff",
  },
  orgMark: {
    display: "grid",
    gap: "4px",
    padding: "14px 16px",
    borderRadius: "18px",
    background: "#f3f8f6",
    color: "#17342d",
  },
  kicker: {
    color: "#1b7f62",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontSize: "12px",
    fontWeight: "700",
  },
  title: {
    margin: "8px 0 6px",
    color: "#17342d",
    fontSize: "30px",
  },
  subtitle: {
    margin: 0,
    color: "#60756f",
    maxWidth: "760px",
    lineHeight: 1.6,
  },
  scopeCard: {
    background: "linear-gradient(135deg, #eef7f2, #edf4ff)",
    borderRadius: "18px",
    padding: "16px 18px",
    minWidth: "180px",
  },
  scopeLabel: {
    display: "block",
    color: "#60756f",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  scopeValue: {
    display: "block",
    marginTop: "8px",
    color: "#17342d",
    fontSize: "20px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "14px",
    marginTop: "18px",
  },
  metricCard: {
    padding: "16px",
    borderRadius: "18px",
    background: "#f8fbfa",
    border: "1px solid #e1ece8",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  metricLabel: {
    color: "#60756f",
    fontSize: "13px",
  },
  metricValue: {
    color: "#17342d",
    fontSize: "28px",
  },
  metricNote: {
    color: "#1b7f62",
    fontSize: "13px",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "16px",
    marginTop: "18px",
  },
  panel: {
    background: "#f8fbfa",
    borderRadius: "20px",
    padding: "18px",
  },
  panelTitle: {
    marginTop: 0,
    color: "#17342d",
  },
  list: {
    margin: 0,
    paddingLeft: "18px",
    color: "#35514a",
    lineHeight: 1.7,
  },
  rankList: {
    display: "grid",
    gap: "12px",
  },
  rankCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "14px",
    display: "grid",
    gap: "6px",
    color: "#35514a",
  },
  empty: {
    marginBottom: 0,
    color: "#60756f",
  },
};

export default ExecutiveReportView;
