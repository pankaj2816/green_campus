import React from "react";
import { useNavigate } from "react-router-dom";

import DataUploadPanel from "./DataUploadPanel";
import { dashboardCopy } from "../config/dashboardConfig";

const { theme } = dashboardCopy;

function getRangePreset(presetId) {
  if (presetId === "all") {
    return { from: "", to: "" };
  }

  if (presetId === "last180") {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 179);
    return {
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10),
    };
  }

  if (presetId === "ay2024") {
    return { from: "2024-04-01", to: "2025-03-31" };
  }

  return null;
}

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
  executiveDarkMode,
  setExecutiveDarkMode,
  onPrintReport,
  comparisonData,
  riskData,
  insightsData,
  onLogout,
  canManage = false,
}) {
  const navigate = useNavigate();
  const primaryRisk = riskData?.[0];
  const topRecommendation = insightsData?.recommendations?.[0];
  const comparisonDelta = comparisonData?.delta?.net_energy;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      navigate("/");
      return;
    }

    localStorage.removeItem("token");
    navigate("/");
  };

  const handlePreset = (presetId) => {
    const preset = getRangePreset(presetId);
    if (!preset) {
      return;
    }
    setDateFrom(preset.from);
    setDateTo(preset.to);
  };

  return (
    <div
      style={{
        ...styles.hero,
        ...(executiveDarkMode ? styles.heroDark : {}),
      }}
      className="hero-command-sticky"
    >
      <div style={styles.heroText}>
        <div style={styles.kickerRow}>
          <span style={{ ...styles.kicker, ...(executiveDarkMode ? styles.kickerDark : {}) }}>{dashboardCopy.header.kicker}</span>
          <span style={{ ...styles.kickerBadge, ...(executiveDarkMode ? styles.kickerBadgeDark : {}) }}>Premium operations view</span>
        </div>
        <h1 style={{ ...styles.title, ...(executiveDarkMode ? styles.titleDark : {}) }}>{dashboardCopy.branding.appName}</h1>
        <div style={{ ...styles.subtitleLead, ...(executiveDarkMode ? styles.subtitleLeadDark : {}) }}>{dashboardCopy.header.title}</div>
        <p style={{ ...styles.subtitle, ...(executiveDarkMode ? styles.subtitleDark : {}) }}>{dashboardCopy.header.subtitle}</p>

        <div style={styles.commandBrief}>
          <InsightCard
            label="Priority Risk"
            value={primaryRisk ? primaryRisk.risk_level : "Stable"}
            note={primaryRisk?.primary_driver || primaryRisk?.message || "No major risk signal is active right now."}
            darkMode={executiveDarkMode}
          />
          <InsightCard
            label="Best Next Action"
            value={topRecommendation?.title || "Review dashboard"}
            note={topRecommendation?.message || "Use the filtered views below to identify the next operational move."}
            darkMode={executiveDarkMode}
          />
          <InsightCard
            label="Change Signal"
            value={
              comparisonDelta?.change === undefined
                ? "Pick a period"
                : `${comparisonDelta.change > 0 ? "+" : ""}${comparisonDelta.change.toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh`
            }
            note="Current selection compared with the previous equal-length period."
            darkMode={executiveDarkMode}
          />
        </div>

        <div style={styles.statusGrid}>
          <StatusCard
            label={dashboardCopy.header.statusCards.scope}
            value={selectedBuilding || dashboardCopy.header.buildingPlaceholder}
            darkMode={executiveDarkMode}
          />
          <StatusCard
            label={dashboardCopy.header.statusCards.forecast}
            value={
              dashboardCopy.header.forecastOptions.find(
                (option) => option.value === forecastGranularity
              )?.label || forecastGranularity
            }
            darkMode={executiveDarkMode}
          />
          <StatusCard
            label={dashboardCopy.header.statusCards.live}
            value="Live operations view"
            darkMode={executiveDarkMode}
          />
          <StatusCard
            label={dashboardCopy.header.statusCards.period}
            value={
              dateFrom && dateTo
                ? `${dateFrom} to ${dateTo}`
                : "All imported data"
            }
            darkMode={executiveDarkMode}
          />
        </div>

        <div style={styles.quickRangeRow}>
          <span style={{ ...styles.quickRangeLabel, ...(executiveDarkMode ? styles.quickRangeLabelDark : {}) }}>{dashboardCopy.header.quickRangeLabel}</span>
          <div style={styles.quickRangeButtons}>
            {dashboardCopy.header.quickRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => handlePreset(range.id)}
                style={styles.rangeChip}
              >
                {range.label}
              </button>
            ))}
          </div>
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
            onClick={() => setExecutiveDarkMode?.((current) => !current)}
            style={styles.themeBtn}
          >
            {executiveDarkMode ? "Light Theme" : "Executive Dark"}
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
        {canManage ? (
          <DataUploadPanel onUploadSuccess={refresh} />
        ) : (
          <p style={styles.viewerNote}>Data import, export, and reset are limited to administrators.</p>
        )}
      </div>
    </div>
  );
}

function StatusCard({ label, value, darkMode = false }) {
  return (
    <div style={{ ...styles.statusCard, ...(darkMode ? styles.statusCardDark : {}) }}>
      <span style={{ ...styles.statusLabel, ...(darkMode ? styles.statusLabelDark : {}) }}>{label}</span>
      <strong style={{ ...styles.statusValue, ...(darkMode ? styles.statusValueDark : {}) }}>{value}</strong>
    </div>
  );
}

function InsightCard({ label, value, note, darkMode = false }) {
  return (
    <div style={{ ...styles.insightCard, ...(darkMode ? styles.insightCardDark : {}) }}>
      <span style={{ ...styles.insightLabel, ...(darkMode ? styles.insightLabelDark : {}) }}>{label}</span>
      <strong style={{ ...styles.insightValue, ...(darkMode ? styles.insightValueDark : {}) }}>{value}</strong>
      <span style={{ ...styles.insightNote, ...(darkMode ? styles.insightNoteDark : {}) }}>{note}</span>
    </div>
  );
}

const styles = {
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.4fr) minmax(320px, 0.95fr)",
    gap: "20px",
    padding: "28px 28px 26px",
    borderRadius: "30px",
    background: `linear-gradient(135deg, ${theme.colors.heroStart} 0%, ${theme.colors.heroMiddle} 45%, ${theme.colors.heroEnd} 100%)`,
    boxShadow: theme.shadows.hero,
    marginBottom: "24px",
    border: `1px solid ${theme.colors.borderSoft}`,
    overflow: "hidden",
  },
  heroText: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  heroDark: {
    background: "linear-gradient(135deg, rgba(14,30,27,0.98) 0%, rgba(18,40,35,0.98) 42%, rgba(25,54,77,0.92) 100%)",
    border: "1px solid rgba(151, 182, 172, 0.14)",
    boxShadow: "0 28px 60px rgba(4, 10, 9, 0.32)",
  },
  kickerRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "10px",
  },
  kicker: {
    color: theme.colors.accent,
    fontWeight: "700",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontSize: theme.fontSizes.heroKicker,
  },
  kickerDark: {
    color: "#7de1bb",
  },
  kickerBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 11px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(151, 184, 173, 0.34)",
    color: theme.colors.primaryText,
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  kickerBadgeDark: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(151, 182, 172, 0.14)",
    color: "#f4fbf8",
  },
  title: {
    fontSize: theme.fontSizes.heroTitle,
    lineHeight: 1.04,
    margin: "12px 0",
    color: theme.colors.primaryText,
    maxWidth: "760px",
    letterSpacing: "-0.04em",
  },
  titleDark: {
    color: "#f4fbf8",
  },
  subtitle: {
    color: theme.colors.secondaryText,
    fontSize: theme.fontSizes.heroSubtitle,
    maxWidth: "700px",
    lineHeight: 1.6,
  },
  subtitleDark: {
    color: "rgba(232,245,239,0.8)",
  },
  subtitleLead: {
    color: theme.colors.primaryText,
    fontSize: "18px",
    fontWeight: "700",
    marginTop: "-2px",
    letterSpacing: "-0.02em",
  },
  subtitleLeadDark: {
    color: "#f4fbf8",
  },
  commandBrief: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "12px",
    marginTop: "22px",
  },
  insightCard: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.82), rgba(248,251,250,0.76))",
    border: "1px solid rgba(173, 198, 192, 0.42)",
    borderRadius: "18px",
    padding: "14px 16px",
    display: "grid",
    gap: "6px",
    boxShadow: "0 12px 26px rgba(18, 34, 29, 0.05)",
  },
  insightLabel: {
    color: theme.colors.secondaryText,
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: "700",
  },
  insightValue: {
    color: theme.colors.primaryText,
    fontSize: "18px",
  },
  insightNote: {
    color: theme.colors.secondaryText,
    fontSize: "12px",
    lineHeight: 1.5,
  },
  insightCardDark: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
    border: "1px solid rgba(151, 182, 172, 0.14)",
  },
  insightLabelDark: {
    color: "rgba(232,245,239,0.7)",
  },
  insightValueDark: {
    color: "#f4fbf8",
  },
  insightNoteDark: {
    color: "rgba(232,245,239,0.76)",
  },
  statusGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "12px",
    marginTop: "22px",
  },
  statusCard: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.84), rgba(248,251,250,0.72))",
    border: "1px solid rgba(173, 198, 192, 0.42)",
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
  statusCardDark: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))",
    border: "1px solid rgba(151, 182, 172, 0.14)",
  },
  statusLabelDark: {
    color: "rgba(232,245,239,0.7)",
  },
  statusValueDark: {
    color: "#f4fbf8",
  },
  quickRangeRow: {
    display: "grid",
    gap: "8px",
    marginTop: "18px",
  },
  quickRangeLabel: {
    color: theme.colors.secondaryText,
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: "700",
  },
  quickRangeLabelDark: {
    color: "rgba(232,245,239,0.7)",
  },
  quickRangeButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  rangeChip: {
    padding: "10px 14px",
    borderRadius: "999px",
    border: "1px solid rgba(122, 164, 152, 0.38)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(247,251,249,0.86))",
    color: theme.colors.primaryText,
    fontWeight: "600",
    cursor: "pointer",
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
    background: "rgba(255,255,255,0.92)",
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
    background: "rgba(255,255,255,0.92)",
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
    background: "rgba(255,255,255,0.86)",
    color: theme.colors.primaryText,
    border: "1px solid #d1ded8",
    borderRadius: theme.radius.button,
    cursor: "pointer",
  },
  themeBtn: {
    padding: "12px 16px",
    background: "linear-gradient(135deg, rgba(24,53,47,0.98), rgba(37,99,235,0.92))",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: theme.radius.button,
    cursor: "pointer",
  },
  printBtn: {
    padding: "12px 16px",
    background: "linear-gradient(135deg, #1d8a67, #2563eb)",
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
  viewerNote: {
    margin: 0,
    maxWidth: "280px",
    color: theme.colors.secondaryText,
    lineHeight: 1.5,
    alignSelf: "center",
  },
};

export default DashboardHeader;
