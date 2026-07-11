import React from "react";

import EnergyTrend from "./EnergyTrend";
import InfoHint from "./InfoHint";
import ResourceMixChart from "./ResourceMixChart";
import ResourceOverview from "./ResourceOverview";

function ResourceCharts({ data, trendData, darkMode = false }) {
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
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "20px",
    marginBottom: "20px",
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
};

export default ResourceCharts;
