import React from "react";

import { dashboardCopy } from "../config/dashboardConfig";

function formatChange(value, suffix = "") {
  const numericValue = Number(value || 0);
  const sign = numericValue > 0 ? "+" : "";
  return `${sign}${numericValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}`;
}

function ComparisonCard({ title, metric, positiveIsGood = false, suffix = "" }) {
  if (!metric) {
    return null;
  }

  const change = Number(metric.change || 0);
  const tone =
    change === 0
      ? styles.neutral
      : positiveIsGood
        ? change > 0
          ? styles.good
          : styles.bad
        : change < 0
          ? styles.good
          : styles.bad;
  const statusLabel =
    change === 0
      ? dashboardCopy.comparison.statusFlat
      : positiveIsGood
        ? change > 0
          ? dashboardCopy.comparison.statusGood
          : dashboardCopy.comparison.statusWatch
        : change < 0
          ? dashboardCopy.comparison.statusGood
          : dashboardCopy.comparison.statusWatch;

  return (
    <div style={{ ...styles.card, ...tone }}>
      <div style={styles.cardHeader}>
        <div style={styles.cardTitle}>{title}</div>
        <span style={{ ...styles.statusBadge, ...tone }}>{statusLabel}</span>
      </div>
      <div style={styles.changeValue}>{formatChange(metric.change, suffix)}</div>
      <div style={styles.metaRow}>
        <span>Current: {metric.current?.toLocaleString?.() ?? metric.current}{suffix}</span>
        <span>Previous: {metric.previous?.toLocaleString?.() ?? metric.previous}{suffix}</span>
      </div>
      <div style={styles.percentText}>
        {metric.change_percent === null || metric.change_percent === undefined
          ? "No baseline percent available"
          : `${formatChange(metric.change_percent, "%")} vs previous period`}
      </div>
    </div>
  );
}

export default function ComparisonSection({ comparisonData }) {
  if (!comparisonData?.previous) {
    return (
      <div style={styles.emptyCard} className="premium-card lift-card stagger-in">
        <h3 style={styles.title}>{dashboardCopy.comparison.title}</h3>
        <p style={styles.subtitle}>{dashboardCopy.comparison.subtitle}</p>
        <p style={styles.emptyText}>{dashboardCopy.comparison.noPrevious}</p>
      </div>
    );
  }

  const delta = comparisonData.delta || {};

  return (
    <div style={styles.wrapper} className="premium-card lift-card stagger-in">
      <h3 style={styles.title}>{dashboardCopy.comparison.title}</h3>
      <p style={styles.subtitle}>{dashboardCopy.comparison.subtitle}</p>
      <p style={styles.periodText}>
        Current: {comparisonData.current_period?.date_from} to {comparisonData.current_period?.date_to}
        {" | "}
        Previous: {comparisonData.previous_period?.date_from} to {comparisonData.previous_period?.date_to}
      </p>

      <div style={styles.grid}>
        <ComparisonCard title={dashboardCopy.comparison.cards.netEnergy} metric={delta.net_energy} suffix=" kWh" />
        <ComparisonCard title={dashboardCopy.comparison.cards.water} metric={delta.water} suffix=" kl" />
        <ComparisonCard title={dashboardCopy.comparison.cards.waste} metric={delta.waste} suffix=" kg" />
        <ComparisonCard title={dashboardCopy.comparison.cards.carbon} metric={delta.carbon} suffix=" kg CO2" />
        <ComparisonCard title={dashboardCopy.comparison.cards.greenIndex} metric={delta.green_index} positiveIsGood suffix=" pts" />
        <ComparisonCard title={dashboardCopy.comparison.cards.cost} metric={delta.monthly_energy_cost_rs} suffix=" Rs" />
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 18px 40px rgba(12, 24, 21, 0.08)",
    marginBottom: "20px",
  },
  emptyCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 18px 40px rgba(12, 24, 21, 0.08)",
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    color: "#17342d",
  },
  subtitle: {
    marginTop: "8px",
    color: "#60756f",
  },
  periodText: {
    marginTop: "10px",
    color: "#35514a",
    fontSize: "13px",
  },
  emptyText: {
    marginTop: "12px",
    color: "#60756f",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
    marginTop: "16px",
  },
  card: {
    borderRadius: "18px",
    padding: "16px",
    border: "1px solid #deebe6",
    background: "#f8fbfa",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center",
  },
  good: {
    borderColor: "#b7e1ce",
    background: "#f1fbf5",
  },
  bad: {
    borderColor: "#f2d6da",
    background: "#fff5f6",
  },
  neutral: {
    borderColor: "#deebe6",
    background: "#f8fbfa",
  },
  cardTitle: {
    color: "#60756f",
    fontSize: "13px",
  },
  statusBadge: {
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
    color: "#17342d",
  },
  changeValue: {
    color: "#17342d",
    fontWeight: "700",
    fontSize: "24px",
    marginTop: "8px",
  },
  metaRow: {
    display: "grid",
    gap: "4px",
    marginTop: "10px",
    color: "#35514a",
    fontSize: "13px",
  },
  percentText: {
    marginTop: "10px",
    color: "#1b7f62",
    fontSize: "13px",
  },
};
