import React from "react";

import EnergyTrend from "./EnergyTrend";
import InfoHint from "./InfoHint";
import ResourceMixChart from "./ResourceMixChart";
import ResourceOverview from "./ResourceOverview";

function ResourceCharts({ data, trendData }) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <span style={styles.kicker}>Visual Storyboard</span>
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
      <div style={styles.grid}>
        <ResourceOverview data={data} />
        <ResourceMixChart data={data} />
      </div>
      <div style={styles.spanTwo}>
        <EnergyTrend trendData={trendData} />
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
    marginBottom: "16px",
    alignItems: "end",
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
    background: "#ffffff",
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
