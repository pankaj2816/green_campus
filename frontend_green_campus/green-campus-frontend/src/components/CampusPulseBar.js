import React from "react";

function CampusPulseBar({ data, riskData, forecastData, seasonalOutlook }) {
  if (!data) {
    return null;
  }

  const risk = riskData?.[0];
  const occupancy = Math.round((forecastData?.future_occupancy_average || 0) * 100);
  const message = [
    `Current Green Index is ${data.green_index}%.`,
    risk ? `Risk is ${risk.risk_level.toLowerCase()} with ${risk.growth_percent}% projected change.` : "Risk data is stable.",
    seasonalOutlook ? seasonalOutlook.headline : `Future occupancy is modeled around ${occupancy}%.`,
  ].join(" ");

  return (
    <div style={styles.container} className="premium-card lift-card stagger-in stagger-in-delay-1">
      <div style={styles.label}>Campus Pulse</div>
      <div style={styles.message}>{message}</div>
      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Scope</span>
          <strong>{data.scope}</strong>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Risk</span>
          <strong>{risk ? risk.risk_level : "N/A"}</strong>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Forecast Occupancy</span>
          <strong>{occupancy}%</strong>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "linear-gradient(135deg, #f5fbf7, #eef5ff)",
    borderRadius: "22px",
    padding: "18px 20px",
    border: "1px solid #dbe8e3",
    marginBottom: "18px",
  },
  label: {
    color: "#1b7f62",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: "700",
  },
  message: {
    marginTop: "10px",
    color: "#17342d",
    fontSize: "16px",
    lineHeight: 1.65,
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginTop: "16px",
  },
  stat: {
    background: "rgba(255,255,255,0.74)",
    borderRadius: "14px",
    padding: "12px 14px",
    display: "grid",
    gap: "5px",
  },
  statLabel: {
    color: "#60756f",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
};

export default CampusPulseBar;
