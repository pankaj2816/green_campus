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
  dateFrom,
  dateTo,
  setDateFrom,
  setDateTo,
  screenshotMode,
  setScreenshotMode,
  onPrintReport,
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

        <div style={styles.statusGrid}>
          <StatusCard
            label={dashboardCopy.header.statusCards.scope}
            value={selectedBuilding || dashboardCopy.header.buildingPlaceholder}
          />
          <StatusCard
            label={dashboardCopy.header.statusCards.forecast}
            value={
              dashboardCopy.header.forecastOptions.find(
                (option) => option.value === forecastGranularity
              )?.label || forecastGranularity
            }
          />
          <StatusCard
            label={dashboardCopy.header.statusCards.live}
            value="Live operations view"
          />
          <StatusCard
            label={dashboardCopy.header.statusCards.period}
            value={
              dateFrom && dateTo
                ? `${dateFrom} to ${dateTo}`
                : "All imported data"
            }
          />
        </div>

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

          <label style={styles.dateField}>
            <span style={styles.dateLabel}>{dashboardCopy.header.dateFromLabel}</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={styles.dateInput}
            />
          </label>

          <label style={styles.dateField}>
            <span style={styles.dateLabel}>{dashboardCopy.header.dateToLabel}</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={styles.dateInput}
            />
          </label>

          <button onClick={() => {
            setDateFrom("");
            setDateTo("");
          }} style={styles.ghostBtn}>
            {dashboardCopy.header.clearDatesLabel}
          </button>

          <button onClick={handleLogout} style={styles.logoutBtn}>
            {dashboardCopy.header.logoutLabel}
          </button>

          <button
            onClick={() => setScreenshotMode?.((current) => !current)}
            style={styles.ghostBtn}
          >
            {screenshotMode
              ? dashboardCopy.presentation.normalMode
              : dashboardCopy.presentation.screenshotMode}
          </button>

          <button onClick={onPrintReport} style={styles.printBtn}>
            {dashboardCopy.presentation.printReport}
          </button>
        </div>
      </div>

      <div style={styles.sidePanel}>
        <DataUploadPanel onUploadSuccess={refresh} />
      </div>
    </div>
  );
}

function StatusCard({ label, value }) {
  return (
    <div style={styles.statusCard}>
      <span style={styles.statusLabel}>{label}</span>
      <strong style={styles.statusValue}>{value}</strong>
    </div>
  );
}

const styles = {
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.4fr) minmax(320px, 0.95fr)",
    gap: "20px",
    padding: "28px",
    borderRadius: "30px",
    background: `linear-gradient(135deg, ${theme.colors.heroStart} 0%, ${theme.colors.heroMiddle} 45%, ${theme.colors.heroEnd} 100%)`,
    boxShadow: theme.shadows.hero,
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
  statusGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "12px",
    marginTop: "22px",
  },
  statusCard: {
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(173, 198, 192, 0.5)",
    borderRadius: "18px",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  statusLabel: {
    color: theme.colors.secondaryText,
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  statusValue: {
    color: theme.colors.primaryText,
    fontSize: "16px",
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
  dateField: {
    display: "grid",
    gap: "4px",
    minWidth: "150px",
  },
  dateLabel: {
    color: theme.colors.secondaryText,
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  dateInput: {
    padding: "12px 14px",
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
  ghostBtn: {
    padding: "12px 16px",
    background: "rgba(255,255,255,0.82)",
    color: theme.colors.primaryText,
    border: "1px solid #d1ded8",
    borderRadius: theme.radius.button,
    cursor: "pointer",
  },
  printBtn: {
    padding: "12px 16px",
    background: "linear-gradient(135deg, #17342d, #2563eb)",
    color: theme.colors.surface,
    border: "none",
    borderRadius: theme.radius.button,
    cursor: "pointer",
  },
  sidePanel: {
    display: "flex",
    alignItems: "stretch",
    justifyContent: "center",
  },
};

export default DashboardHeader;
