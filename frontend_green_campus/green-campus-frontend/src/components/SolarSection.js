import React from "react";

import SolarAnalytics from "./SolarAnalytics";
import { dashboardCopy } from "../config/dashboardConfig";

function SolarSection({ data }) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>{dashboardCopy.solar.title}</h3>
        <p style={styles.subtitle}>{dashboardCopy.solar.subtitle}</p>
      </div>

      <SolarAnalytics data={data} />
    </div>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "24px",
    boxShadow: "0 18px 40px rgba(12, 24, 21, 0.08)",
    height: "100%",
  },
  header: {
    marginBottom: "16px",
  },
  title: {
    margin: 0,
    color: "#18332d",
  },
  subtitle: {
    marginTop: "8px",
    color: "#60756f",
  },
};

export default SolarSection;
