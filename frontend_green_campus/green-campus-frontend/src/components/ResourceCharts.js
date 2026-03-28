import React from "react";

import EnergyTrend from "./EnergyTrend";
import ResourceMixChart from "./ResourceMixChart";
import ResourceOverview from "./ResourceOverview";

function ResourceCharts({ data, trendData }) {
  return (
    <div style={styles.grid}>
      <ResourceOverview data={data} />
      <ResourceMixChart data={data} />
      <div style={styles.spanTwo}>
        <EnergyTrend trendData={trendData} />
      </div>
    </div>
  );
}

const styles = {
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
};

export default ResourceCharts;
