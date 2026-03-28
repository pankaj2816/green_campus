import React from "react";

import { dashboardCopy } from "../config/dashboardConfig";

function formatValue(key, value) {
  if (key === "weights" && typeof value === "object") {
    return Object.entries(value)
      .map(([itemKey, itemValue]) => `${itemKey}: ${itemValue}`)
      .join(" | ");
  }

  if (key === "academic_occupancy_factors" && typeof value === "object") {
    return "Month-by-month campus activity values";
  }

  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function AssumptionsPanel({ assumptions }) {
  if (!assumptions) {
    return null;
  }

  const constants = assumptions.constants || {};
  const glossary = assumptions.glossary || [];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={{ margin: 0 }}>{dashboardCopy.assumptions.title}</h3>
        <p style={styles.subtext}>{dashboardCopy.assumptions.subtitle}</p>
      </div>

      <div style={styles.grid}>
        <div style={styles.panel}>
          <h4>{dashboardCopy.assumptions.settingsTitle}</h4>
          <div style={styles.list}>
            {Object.entries(constants).map(([key, value]) => {
              const meta = dashboardCopy.assumptionsLabels[key] || {
                label: key,
                description: "Setting used by the dashboard.",
              };

              return (
                <div key={key} style={styles.settingCard}>
                  <div style={styles.settingTop}>
                    <span style={styles.term}>{meta.label}</span>
                    <span style={styles.value}>{formatValue(key, value)}</span>
                  </div>
                  <p style={styles.description}>{meta.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.panel}>
          <h4>{dashboardCopy.assumptions.glossaryTitle}</h4>
          <div style={styles.list}>
            {glossary.map((item) => (
              <div key={item.term} style={styles.glossaryCard}>
                <strong>{item.term}</strong>
                <p style={styles.glossaryText}>{item.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
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
    marginBottom: "16px",
  },
  subtext: {
    color: "#5f706a",
    marginTop: "8px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "16px",
  },
  panel: {
    background: "#f8fbfa",
    borderRadius: "12px",
    padding: "16px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  settingCard: {
    background: "#ffffff",
    borderRadius: "10px",
    padding: "12px",
  },
  settingTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
  },
  term: {
    color: "#27453f",
    fontWeight: "600",
  },
  value: {
    color: "#1b7f62",
    textAlign: "right",
    fontWeight: "700",
  },
  description: {
    marginBottom: 0,
    color: "#5f706a",
    lineHeight: 1.5,
  },
  glossaryCard: {
    background: "#ffffff",
    borderRadius: "10px",
    padding: "12px",
  },
  glossaryText: {
    marginBottom: 0,
    color: "#5f706a",
    lineHeight: 1.5,
  },
};

export default AssumptionsPanel;
