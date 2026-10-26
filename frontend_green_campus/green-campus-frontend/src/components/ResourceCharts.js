import React from "react";
import { Bar } from "react-chartjs-2";

import EnergyTrend from "./EnergyTrend";
import InfoHint from "./InfoHint";
import ResourceMixChart from "./ResourceMixChart";
import ResourceOverview from "./ResourceOverview";

function ResourceCharts({ data, trendData, darkMode = false, buildingData = [] }) {
  const energy = Number(data?.energy || 0);
  const solar = Number(data?.solar || 0);
  const netEnergy = Number(data?.net_energy || 0);
  const solarCoverage = energy > 0 ? ((solar / energy) * 100).toFixed(1) : "0.0";
  const latestPoint = trendData?.[trendData.length - 1];
  const firstPoint = trendData?.[0];
  const netDirection =
    latestPoint && firstPoint
      ? latestPoint.net > firstPoint.net
        ? "Net grid draw is rising"
        : latestPoint.net < firstPoint.net
          ? "Net grid draw is easing"
          : "Net grid draw is stable"
      : "Trend baseline forming";

  return (
    <div style={styles.wrapper}>
      <div style={styles.header} className="resource-charts-header">
        <div>
          <div style={styles.kickerRow}>
            <span style={styles.kickerDot} />
            <span style={styles.kicker}>Visual Storyboard</span>
          </div>
          <h3 style={styles.title}>
            Resource flow and trend interpretation
            <InfoHint
              title="What this section shows"
              text="This section helps you explain what resource is dominating the current picture and how energy, solar, and net grid dependence are changing over time."
              width={300}
            />
          </h3>
        </div>
        <p style={styles.text}>
          Use these views to explain which resource is dominating the current picture and how grid dependence shifts over time.
        </p>
      </div>
      <div style={styles.storyStats}>
        <div style={styles.storyStatCard}>
          <span style={styles.storyLabel}>Net grid draw</span>
          <strong style={styles.storyValue}>{netEnergy.toLocaleString()} kWh</strong>
          <span style={styles.storyNote}>Electricity still taken from the grid after solar is counted.</span>
        </div>
        <div style={styles.storyStatCard}>
          <span style={styles.storyLabel}>Solar coverage</span>
          <strong style={styles.storyValue}>{solarCoverage}%</strong>
          <span style={styles.storyNote}>How much of current electricity demand is being supported by solar generation.</span>
        </div>
        <div style={styles.storyStatCard}>
          <span style={styles.storyLabel}>Trend reading</span>
          <strong style={styles.storyValue}>{netDirection}</strong>
          <span style={styles.storyNote}>Quick narrative cue for meetings, screenshots, and executive explanation.</span>
        </div>
      </div>
      <div style={styles.grid} className="resource-charts-grid">
        <ResourceOverview data={data} darkMode={darkMode} />
        <ResourceMixChart data={data} darkMode={darkMode} />
      </div>
      <div style={styles.spanTwo}>
        <EnergyTrend trendData={trendData} darkMode={darkMode} />
        <p style={styles.chartNote}>
          Reading tip: if solar rises while net grid energy drops, campus operations are getting more daytime support from renewable generation.
        </p>
      </div>
      <BuildingEnergyChart buildingData={buildingData} darkMode={darkMode} />
    </div>
  );
}

function BuildingEnergyChart({ buildingData, darkMode }) {
  const rows = Array.isArray(buildingData) ? buildingData : [];
  const titleColor = darkMode ? "#f4fbf8" : "#18332d";
  const subtitleColor = darkMode ? "rgba(235,245,240,0.76)" : "#60756f";

  if (!rows.length) {
    return <p style={{ color: subtitleColor }}>No building electricity data is available for this date window.</p>;
  }

  return (
    <div style={styles.buildingCard}>
      <h3 style={{ ...styles.title, color: titleColor }}>Electricity by building</h3>
      <p style={{ ...styles.text, color: subtitleColor }}>
        Each bar is that building&apos;s electricity use in kWh for the selected dates.
      </p>
      <div style={styles.buildingChart}>
        <Bar
          data={{
            labels: rows.map((item) => item.building),
            datasets: [
              {
                label: "Electricity (kWh)",
                data: rows.map((item) => Number(item.total_kwh || 0)),
                backgroundColor: "#1d8a67",
                borderRadius: 8,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: subtitleColor } },
              y: {
                title: { display: true, text: "Electricity (kWh)", color: subtitleColor },
                ticks: { color: subtitleColor },
              },
            },
          }}
        />
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    marginBottom: "20px",
  },
  header: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 0.85fr) minmax(0, 1fr)",
    gap: "18px",
    marginBottom: "14px",
    alignItems: "end",
  },
  kickerRow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 11px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.74)",
    border: "1px solid rgba(171, 194, 186, 0.28)",
  },
  kickerDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1d8a67, #2563eb)",
  },
  kicker: {
    color: "#1b7f62",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: "700",
  },
  title: {
    margin: "8px 0 0",
    color: "#17342d",
    fontSize: "24px",
    letterSpacing: "-0.03em",
  },
  text: {
    margin: 0,
    color: "#60756f",
    lineHeight: 1.6,
    justifySelf: "end",
    maxWidth: "560px",
  },
  grid: {
    display: "grid",
    alignItems: "start",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },
  storyStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
    marginBottom: "18px",
  },
  storyStatCard: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(243,249,246,0.94))",
    borderRadius: "20px",
    padding: "16px 18px",
    border: "1px solid rgba(160, 190, 180, 0.22)",
    boxShadow: "0 16px 32px rgba(12, 24, 21, 0.06)",
    display: "grid",
    gap: "6px",
  },
  storyLabel: {
    color: "#60756f",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: "800",
  },
  storyValue: {
    color: "#17342d",
    fontSize: "24px",
    lineHeight: 1.18,
    letterSpacing: "-0.03em",
  },
  storyNote: {
    color: "#60756f",
    fontSize: "13px",
    lineHeight: 1.55,
  },
  spanTwo: {
    gridColumn: "1 / -1",
    background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,251,249,0.94))",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 18px 40px rgba(12, 24, 21, 0.08)",
  },
  chartNote: {
    margin: "14px 0 0",
    color: "#60756f",
    fontSize: "13px",
    lineHeight: 1.55,
  },
  buildingCard: {
    marginTop: "20px",
    background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,251,249,0.94))",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 18px 40px rgba(12, 24, 21, 0.08)",
  },
  buildingChart: {
    height: "320px",
    marginTop: "12px",
  },
};

export default ResourceCharts;
