import React from "react";

import { dashboardCopy } from "../config/dashboardConfig";

const { theme, branding } = dashboardCopy;
const navIcons = {
  overview: "OV",
  intelligence: "IN",
  planning: "PL",
  governance: "GV",
  report: "RP",
};

function DashboardSidebar({
  activeView,
  setActiveView,
  selectedBuilding,
  forecastGranularity,
}) {
  const currentForecast =
    dashboardCopy.header.forecastOptions.find((option) => option.value === forecastGranularity)?.label ||
    forecastGranularity;

  return (
    <aside style={styles.sidebar} className="premium-card sidebar-glow stagger-in">
      <div style={styles.brandBlock}>
        <div style={styles.brandBadge}>{branding.appShort}</div>
        <div>
          <div style={styles.brandKicker}>Smart Operations</div>
          <h2 style={styles.brandTitle}>{branding.appName}</h2>
        </div>
      </div>

      <p style={styles.brandText}>
        {branding.organization} | {branding.tagline}
      </p>

      <div style={styles.navList}>
        {dashboardCopy.header.sectionTabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            style={{
              ...styles.navItem,
              ...(activeView === tab.id ? styles.navItemActive : {}),
            }}
            className={`lift-card stagger-in stagger-in-delay-${Math.min(index + 1, 3)}`}
          >
            <span style={styles.navLeading}>
              <span style={styles.navIcon}>{navIcons[tab.id] || String(index + 1).padStart(2, "0")}</span>
              <span style={styles.navIndex}>{String(index + 1).padStart(2, "0")}</span>
            </span>
            <span style={styles.navTextBlock}>
              <span style={styles.navLabel}>{tab.label}</span>
              <span style={styles.navCaption}>
                {tab.id === activeView ? "Current workspace" : "Open section"}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div style={styles.contextCard}>
        <span style={styles.contextLabel}>Current Scope</span>
        <strong style={styles.contextValue}>
          {selectedBuilding || dashboardCopy.header.buildingPlaceholder}
        </strong>
      </div>

      <div style={styles.contextCard}>
        <span style={styles.contextLabel}>Forecast Mode</span>
        <strong style={styles.contextValue}>{currentForecast}</strong>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    position: "sticky",
    top: "24px",
    alignSelf: "start",
    background: "linear-gradient(180deg, rgba(18, 35, 31, 0.96) 0%, rgba(24, 52, 46, 0.98) 100%)",
    color: "#f5fbf8",
    borderRadius: "28px",
    padding: "24px 20px",
    border: "1px solid rgba(133, 177, 164, 0.16)",
    boxShadow: "0 24px 44px rgba(9, 20, 18, 0.22)",
  },
  brandBlock: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  brandBadge: {
    width: "50px",
    height: "50px",
    borderRadius: "18px",
    display: "grid",
    placeItems: "center",
    fontWeight: "800",
    background: "linear-gradient(135deg, #2ea26f, #2563eb)",
    boxShadow: "0 12px 20px rgba(46, 162, 111, 0.18)",
  },
  brandKicker: {
    color: "rgba(237, 250, 244, 0.7)",
    fontSize: "12px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  brandTitle: {
    margin: "4px 0 0",
    fontSize: "24px",
  },
  brandText: {
    margin: "16px 0 0",
    color: "rgba(237, 250, 244, 0.74)",
    lineHeight: 1.6,
    fontSize: "14px",
  },
  navList: {
    display: "grid",
    gap: "12px",
    marginTop: "24px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    width: "100%",
    textAlign: "left",
    padding: "14px 14px",
    borderRadius: "18px",
    border: "1px solid rgba(147, 197, 185, 0.14)",
    background: "rgba(255,255,255,0.04)",
    color: "#eef8f4",
    cursor: "pointer",
  },
  navItemActive: {
    background: "linear-gradient(135deg, rgba(46, 162, 111, 0.28), rgba(37, 99, 235, 0.28))",
    border: "1px solid rgba(122, 203, 171, 0.36)",
    boxShadow: "0 16px 24px rgba(7, 17, 15, 0.18)",
  },
  navLeading: {
    display: "grid",
    gap: "6px",
    justifyItems: "center",
    minWidth: "44px",
  },
  navIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.08)",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.08em",
  },
  navIndex: {
    color: "rgba(237, 250, 244, 0.65)",
    fontSize: "10px",
    letterSpacing: "0.08em",
  },
  navTextBlock: {
    display: "grid",
    gap: "4px",
  },
  navLabel: {
    fontWeight: "700",
    fontSize: "15px",
  },
  navCaption: {
    color: "rgba(237, 250, 244, 0.62)",
    fontSize: "12px",
  },
  contextCard: {
    marginTop: "16px",
    padding: "16px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(147, 197, 185, 0.1)",
  },
  contextLabel: {
    display: "block",
    color: "rgba(237, 250, 244, 0.68)",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  contextValue: {
    display: "block",
    marginTop: "8px",
    color: "#ffffff",
    fontSize: theme.fontSizes.heroSubtitle,
  },
};

export default DashboardSidebar;
