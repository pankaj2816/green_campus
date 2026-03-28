import React from "react";
import { useNavigate } from "react-router-dom";

import DataUploadPanel from "./DataUploadPanel";
import { dashboardCopy } from "../config/dashboardConfig";

const { theme } = dashboardCopy;

function DashboardHeader({
  buildings,
  selectedBuilding,
  setSelectedBuilding,
  refresh,
  forecastGranularity,
  setForecastGranularity,
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={styles.hero}>
      <div style={styles.heroText}>
        <span style={styles.kicker}>{dashboardCopy.header.kicker}</span>
        <h1 style={styles.title}>{dashboardCopy.header.title}</h1>
        <p style={styles.subtitle}>{dashboardCopy.header.subtitle}</p>

        <div style={styles.filters}>
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            style={styles.dropdown}
          >
            <option value="">{dashboardCopy.header.buildingPlaceholder}</option>
            {buildings.map((building) => (
              <option key={building} value={building}>
                {building}
              </option>
            ))}
          </select>

          <select
            value={forecastGranularity}
            onChange={(e) => setForecastGranularity(e.target.value)}
            style={styles.dropdown}
          >
            {dashboardCopy.header.forecastOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button onClick={handleLogout} style={styles.logoutBtn}>
            {dashboardCopy.header.logoutLabel}
          </button>
        </div>
      </div>

      <div style={styles.sidePanel}>
        <DataUploadPanel onUploadSuccess={refresh} />
      </div>
    </div>
  );
}

const styles = {
  hero: {
    display: "grid",
    gridTemplateColumns: "1.35fr 1fr",
    gap: "20px",
    padding: "28px",
    borderRadius: "30px",
    background: `linear-gradient(135deg, ${theme.colors.heroStart} 0%, ${theme.colors.heroMiddle} 45%, ${theme.colors.heroEnd} 100%)`,
    boxShadow: "0 24px 50px rgba(18, 34, 29, 0.08)",
    marginBottom: "24px",
  },
  heroText: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  kicker: {
    color: theme.colors.accent,
    fontWeight: "700",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontSize: theme.fontSizes.heroKicker,
  },
  title: {
    fontSize: theme.fontSizes.heroTitle,
    lineHeight: 1.04,
    margin: "12px 0",
    color: theme.colors.primaryText,
    maxWidth: "760px",
  },
  subtitle: {
    color: theme.colors.secondaryText,
    fontSize: theme.fontSizes.heroSubtitle,
    maxWidth: "700px",
    lineHeight: 1.6,
  },
  filters: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "20px",
  },
  dropdown: {
    padding: "12px 14px",
    minWidth: "180px",
    borderRadius: theme.radius.button,
    border: "1px solid #cedcd7",
    background: theme.colors.surface,
  },
  logoutBtn: {
    padding: "12px 16px",
    background: theme.colors.primaryText,
    color: theme.colors.surface,
    border: "none",
    borderRadius: theme.radius.button,
    cursor: "pointer",
  },
  sidePanel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default DashboardHeader;
