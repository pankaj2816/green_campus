import React from "react";
import DashboardCards from "./DashboardCards";

function KPISection({ data, onOpenDetail }) {
  if (!data || data.has_data === false) return null;
  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <div style={styles.kickerRow}>
            <span style={styles.kickerDot} />
            <span style={styles.kicker}>Quick Metrics</span>
          </div>
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
    marginBottom: "14px",
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
    maxWidth: "620px",
  },
};

export default KPISection;
