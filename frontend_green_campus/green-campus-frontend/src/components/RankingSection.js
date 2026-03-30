import React from "react";

import BuildingPerformance from "./BuildingPerformance";
import { dashboardCopy } from "../config/dashboardConfig";

const { theme } = dashboardCopy;

function RankingSection({ performanceData }) {
  return (
    <div style={styles.card} className="premium-card lift-card stagger-in stagger-in-delay-1">
      <h3 style={styles.title}>{dashboardCopy.ranking.title}</h3>
      <BuildingPerformance performanceData={performanceData} />
    </div>
  );
}

const styles = {
  card: {
    background: theme.colors.surface,
    padding: "22px",
    borderRadius: theme.radius.card,
    boxShadow: theme.shadows.card,
  },
  title: {
    marginTop: 0,
    color: theme.colors.primaryText,
  },
};

export default RankingSection;
