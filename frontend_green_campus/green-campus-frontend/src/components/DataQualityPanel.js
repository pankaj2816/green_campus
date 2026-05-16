import React from "react";

import { dashboardCopy } from "../config/dashboardConfig";
import InfoHint from "./InfoHint";

const { theme } = dashboardCopy;

function DataQualityPanel({ qualityData, onOpenDetail }) {
  if (!qualityData) {
    return null;
  }

  const score = Number(qualityData.overall_score || 0);

  return (
    <div style={styles.container} className="premium-card lift-card stagger-in stagger-in-delay-2">
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>
            {dashboardCopy.quality.title}
            <InfoHint
              title="What Data Quality means"
              text="This checks whether imported data is complete enough to trust charts and forecasts. It looks for missing months, duplicates, and unusual zero or negative values."
              width={310}
            />
          </h3>
          <p style={styles.subtext}>{dashboardCopy.quality.subtitle}</p>
        </div>
        <div style={styles.scoreBadge}>
          <span>{dashboardCopy.quality.trustLabel}</span>
          <strong>{qualityData.trust_level}</strong>
        </div>
      </div>

      <div style={styles.scoreRow}>
        <div
          style={{
            ...styles.scoreCircle,
            background: `conic-gradient(#1b7f62 0deg, #60a5fa ${Math.min(score * 3.6, 360)}deg, #edf4f1 ${Math.min(score * 3.6, 360)}deg)`,
          }}
        >
          <strong>{score.toFixed(1)}</strong>
          <span>/ 100</span>
        </div>
        <div style={styles.scoreDetails}>
          <Metric label={dashboardCopy.quality.metrics.history} value={`${qualityData.history_months} months`} />
          <Metric label={dashboardCopy.quality.metrics.readiness} value={`${qualityData.forecast_readiness}%`} />
          <Metric label={dashboardCopy.quality.metrics.issues} value={qualityData.issue_count} />
        </div>
      </div>

      <div style={styles.resourceGrid}>
        {(qualityData.resources || []).map((item) => (
          <button
            key={item.resource}
            type="button"
            style={styles.resourceCard}
            onClick={() =>
              onOpenDetail?.({
                title: `${item.resource.toUpperCase()} data quality`,
                category: "Data Quality",
                summary: `${item.row_count} rows, ${item.covered_months} covered months, score ${item.score}/100.`,
                points: [
                  `Status: ${item.status}`,
                  `Missing months: ${item.missing_month_count}`,
                  `Duplicate readings: ${item.duplicate_readings}`,
                  `Zero or negative values: ${item.zero_or_negative_values}`,
                  `Average value: ${item.average_value} ${item.unit}`,
                ],
              })
            }
          >
            <div style={styles.resourceTop}>
              <strong>{item.resource}</strong>
              <span style={{ ...styles.statusPill, ...statusStyle(item.status) }}>{readableStatus(item.status)}</span>
            </div>
            <div style={styles.resourceValue}>{item.score}/100</div>
            <span style={styles.resourceMeta}>
              {item.row_count} rows | {item.missing_month_count} missing months
            </span>
          </button>
        ))}
      </div>

      <div style={styles.recommendationBox}>
        <strong>{dashboardCopy.quality.recommendationsTitle}</strong>
        {(qualityData.recommendations || []).map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={styles.metric}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function readableStatus(status) {
  return String(status || "review").replaceAll("_", " ");
}

function statusStyle(status) {
  if (status === "strong") {
    return { background: "#dcfce7", color: "#166534" };
  }
  if (status === "usable" || status === "optional_missing") {
    return { background: "#fef3c7", color: "#92400e" };
  }
  return { background: "#fee2e2", color: "#991b1b" };
}

const styles = {
  container: {
    background: theme.colors.surface,
    padding: "22px",
    borderRadius: theme.radius.card,
    boxShadow: theme.shadows.card,
    marginBottom: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    color: theme.colors.primaryText,
  },
  subtext: {
    margin: "8px 0 0",
    color: theme.colors.secondaryText,
    lineHeight: 1.55,
  },
  scoreBadge: {
    display: "grid",
    gap: "4px",
    padding: "12px 14px",
    borderRadius: "14px",
    background: "#eef7f2",
    color: theme.colors.primaryText,
    minWidth: "120px",
  },
  scoreRow: {
    display: "grid",
    gridTemplateColumns: "110px minmax(0, 1fr)",
    gap: "16px",
    alignItems: "center",
    marginTop: "18px",
  },
  scoreCircle: {
    width: "104px",
    height: "104px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    alignContent: "center",
    color: "#ffffff",
    boxShadow: "0 12px 24px rgba(27, 127, 98, 0.18)",
  },
  scoreDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "10px",
  },
  metric: {
    display: "grid",
    gap: "5px",
    padding: "12px",
    borderRadius: "14px",
    background: theme.colors.softSurface,
    color: theme.colors.secondaryText,
  },
  resourceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "10px",
    marginTop: "16px",
  },
  resourceCard: {
    border: "1px solid #dcebe5",
    background: "#ffffff",
    borderRadius: "14px",
    padding: "13px",
    textAlign: "left",
    cursor: "pointer",
  },
  resourceTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    alignItems: "center",
    textTransform: "capitalize",
  },
  statusPill: {
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  resourceValue: {
    marginTop: "10px",
    fontSize: "24px",
    fontWeight: "800",
    color: theme.colors.primaryText,
  },
  resourceMeta: {
    display: "block",
    marginTop: "4px",
    color: theme.colors.secondaryText,
    fontSize: "12px",
  },
  recommendationBox: {
    display: "grid",
    gap: "8px",
    marginTop: "16px",
    padding: "14px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #f7fbf9, #eef5ff)",
    color: theme.colors.secondaryText,
    lineHeight: 1.5,
  },
};

export default DataQualityPanel;
