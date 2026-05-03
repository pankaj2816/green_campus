import React from "react";
import { dashboardCopy } from "../config/dashboardConfig";

function CampusPulseBar({ data, riskData, forecastData, seasonalOutlook, insightsData }) {
  if (!data) {
    return null;
  }

  const risk = riskData?.[0];
  const occupancy = Math.round((forecastData?.future_occupancy_average || 0) * 100);
  const topOpportunity = insightsData?.opportunities?.[0];
  const nextAction = insightsData?.recommendations?.[0];
  const message = [
    `Current Green Index is ${data.green_index}%.`,
    risk ? `Risk is ${risk.risk_level.toLowerCase()} with ${risk.growth_percent}% projected change.` : "Risk data is stable.",
    seasonalOutlook ? seasonalOutlook.headline : `Future occupancy is modeled around ${occupancy}%.`,
  ].join(" ");

  return (
    <div style={styles.container} className="premium-card lift-card stagger-in stagger-in-delay-1">
      <div style={styles.topRow}>
        <div>
          <div style={styles.label}>{dashboardCopy.pulse.title}</div>
          <div style={styles.message}>{message}</div>
        </div>
        <div style={styles.signalCard}>
          <span style={styles.signalLabel}>{dashboardCopy.pulse.signalTitle}</span>
          <strong style={styles.signalValue}>
            {risk ? `${risk.risk_level} risk` : "Stable"}
          </strong>
          <span style={styles.signalNote}>
            {risk?.primary_driver || "No high-priority issue is dominating the campus right now."}
          </span>
        </div>
      </div>
      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statLabel}>{dashboardCopy.pulse.cards.scope}</span>
          <strong>{data.scope}</strong>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>{dashboardCopy.pulse.cards.risk}</span>
          <strong>{risk ? risk.risk_level : "N/A"}</strong>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>{dashboardCopy.pulse.cards.occupancy}</span>
          <strong>{occupancy}%</strong>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>{dashboardCopy.pulse.cards.opportunity}</span>
          <strong>{topOpportunity?.title || "No major opportunity"}</strong>
          <span style={styles.statNote}>{topOpportunity?.message || "Use current charts to identify the next efficiency win."}</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>{dashboardCopy.pulse.cards.action}</span>
          <strong>{nextAction?.title || "Review filters"}</strong>
          <span style={styles.statNote}>{nextAction?.message || "Switch views and compare periods to decide the next move."}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "linear-gradient(135deg, #f7fbf8 0%, #eef5ff 58%, #f7fbff 100%)",
    borderRadius: "26px",
    padding: "20px 22px",
    border: "1px solid #d7e6e0",
    marginBottom: "18px",
  },
  topRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.7fr) minmax(260px, 0.9fr)",
    gap: "18px",
    alignItems: "start",
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
    fontSize: "17px",
    lineHeight: 1.65,
  },
  signalCard: {
    background: "rgba(255,255,255,0.78)",
    borderRadius: "18px",
    padding: "16px",
    border: "1px solid #d8e5df",
    display: "grid",
    gap: "6px",
  },
  signalLabel: {
    color: "#60756f",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  signalValue: {
    color: "#17342d",
    fontSize: "18px",
  },
  signalNote: {
    color: "#60756f",
    fontSize: "12px",
    lineHeight: 1.5,
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
  statNote: {
    color: "#60756f",
    fontSize: "12px",
    lineHeight: 1.45,
  },
};

export default CampusPulseBar;
