import React from "react";

import { dashboardCopy } from "../config/dashboardConfig";

const { theme } = dashboardCopy;

function AlertCenter({ alertsData }) {
  if (!alertsData) {
    return null;
  }

  return (
    <div style={styles.container} className="premium-card lift-card stagger-in stagger-in-delay-1">
      <div style={styles.header}>
        <div>
          <h3 style={{ margin: 0 }}>{dashboardCopy.alerts.title}</h3>
          <p style={styles.subtext}>{dashboardCopy.alerts.subtitle}</p>
        </div>
        <div style={styles.scopePill}>
          {dashboardCopy.global.scopeLabel}: {alertsData.scope}
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.panel}>
          {(alertsData.alerts || []).length > 0 ? (
            alertsData.alerts.map((alert, index) => (
              <div key={index} style={{ ...styles.alertCard, borderLeft: `6px solid ${levelColor(alert.level)}` }}>
                <strong>{alert.title}</strong>
                <p style={styles.cardText}>{alert.message}</p>
              </div>
            ))
          ) : (
            <p>{dashboardCopy.alerts.noAlerts}</p>
          )}
        </div>

        <div style={styles.panel}>
          <div style={styles.exportSummary}>
            <strong>{dashboardCopy.alerts.exportTitle}</strong>
            <div style={styles.exportCount}>
              {alertsData.export_ready_day_count} {dashboardCopy.alerts.exportCountLabel}
            </div>
          </div>

          {alertsData.export_ready_days?.length > 0 ? (
            alertsData.export_ready_days.map((item) => (
              <div key={item.date} style={styles.exportCard}>
                <strong>{item.date}</strong>
                <span>{item.surplus_kwh} kWh surplus</span>
              </div>
            ))
          ) : (
            <p>{dashboardCopy.alerts.noExportDays}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function levelColor(level) {
  if (level === "high") return "#dc2626";
  if (level === "medium") return "#f59e0b";
  return "#16a34a";
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
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  subtext: {
    color: theme.colors.secondaryText,
    marginTop: "8px",
  },
  scopePill: {
    background: "#eef7f2",
    color: theme.colors.accent,
    padding: "10px 14px",
    borderRadius: "999px",
    fontWeight: "600",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  panel: {
    background: theme.colors.softSurface,
    borderRadius: "18px",
    padding: "18px",
  },
  alertCard: {
    background: theme.colors.surface,
    borderRadius: "12px",
    padding: "14px",
    marginBottom: "10px",
  },
  cardText: {
    marginBottom: 0,
    color: theme.colors.secondaryText,
    lineHeight: 1.5,
  },
  exportSummary: {
    marginBottom: "12px",
  },
  exportCount: {
    marginTop: "8px",
    fontSize: "22px",
    fontWeight: "700",
    color: theme.colors.primaryText,
  },
  exportCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    background: theme.colors.surface,
    borderRadius: "12px",
    padding: "14px",
    marginBottom: "10px",
  },
};

export default AlertCenter;
