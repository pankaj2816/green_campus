import React from "react";

import BuildingPerformance from "./BuildingPerformance";
import { dashboardCopy } from "../config/dashboardConfig";

function RankingSection({ performanceData }) {
  return (
    <div style={styles.card}>
      <h3>{dashboardCopy.ranking.title}</h3>
      <BuildingPerformance performanceData={performanceData} />
    </div>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
  },
};

export default RankingSection;
