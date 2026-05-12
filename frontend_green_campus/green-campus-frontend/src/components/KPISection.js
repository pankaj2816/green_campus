import React from "react";
import DashboardCards from "./DashboardCards";

function KPISection({ data, onOpenDetail }) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <span style={styles.kicker}>Quick Metrics</span>
          <h3 style={styles.title}>Core campus indicators</h3>
        </div>
        <p style={styles.text}>
          Start here for the fastest read of demand, solar coverage, remaining grid use, and overall sustainability score.
        </p>
      </div>
      <DashboardCards data={data} onOpenDetail={onOpenDetail} />
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: "8px",
  },
  header: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 0.8fr) minmax(0, 1fr)",
    gap: "18px",
    alignItems: "end",
    marginBottom: "16px",
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
};

export default KPISection;
