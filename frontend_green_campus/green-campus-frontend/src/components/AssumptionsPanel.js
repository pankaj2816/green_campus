import React from "react";

import { dashboardCopy } from "../config/dashboardConfig";

const { theme } = dashboardCopy;

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
    <div style={styles.container} className="premium-card lift-card stagger-in stagger-in-delay-2">
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
    background: theme.colors.surface,
    padding: "22px",
    borderRadius: theme.radius.card,
    boxShadow: theme.shadows.card,
    marginBottom: "20px",
  },
  header: {
    marginBottom: "16px",
  },
  subtext: {
    color: theme.colors.secondaryText,
    marginTop: "8px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "16px",
  },
  panel: {
    background: theme.colors.softSurface,
    borderRadius: "18px",
    padding: "18px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  settingCard: {
    background: theme.colors.surface,
    borderRadius: "10px",
    padding: "14px",
  },
  settingTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
  },
  term: {
    color: theme.colors.primaryText,
    fontWeight: "600",
  },
  value: {
    color: theme.colors.accent,
    textAlign: "right",
    fontWeight: "700",
  },
  description: {
    marginBottom: 0,
    color: theme.colors.secondaryText,
    lineHeight: 1.5,
  },
  glossaryCard: {
    background: theme.colors.surface,
    borderRadius: "10px",
    padding: "14px",
  },
  glossaryText: {
    marginBottom: 0,
    color: theme.colors.secondaryText,
    lineHeight: 1.5,
  },
};

export default AssumptionsPanel;
