import React from "react";

import { dashboardCopy } from "../config/dashboardConfig";

function AlertCenter({ alertsData }) {
  if (!alertsData) {
    return null;
  }

  return (
    <div style={styles.container}>
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
    background: "#ffffff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
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
    color: "#5f706a",
    marginTop: "8px",
  },
  scopePill: {
    background: "#eef7f2",
    color: "#1b7f62",
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
    background: "#f8fbfa",
    borderRadius: "14px",
    padding: "16px",
  },
  alertCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "12px",
    marginBottom: "10px",
  },
  cardText: {
    marginBottom: 0,
    color: "#60756f",
    lineHeight: 1.5,
  },
  exportSummary: {
    marginBottom: "12px",
  },
  exportCount: {
    marginTop: "8px",
    fontSize: "22px",
    fontWeight: "700",
    color: "#17342d",
  },
  exportCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "12px",
    marginBottom: "10px",
  },
};

export default AlertCenter;
