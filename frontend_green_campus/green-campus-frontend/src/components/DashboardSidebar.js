import React from "react";

import { dashboardCopy } from "../config/dashboardConfig";
import InfoHint from "./InfoHint";

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

      <div style={styles.platformStrip}>
        <span style={styles.platformPill}>Live Campus</span>
        <span style={styles.platformText}>Executive-ready AI sustainability workspace</span>
      </div>

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

      <div style={styles.guideCard}>
        <div style={styles.guideTop}>
          <strong style={styles.guideTitle}>{dashboardCopy.resources.simpleGuideLabel}</strong>
          <InfoHint
            title="Why this PDF is useful"
            text="Open this guide when you want a simple explanation of important terms, formulas, and dashboard sections without reading the code."
            width={260}
          />
        </div>
        <span style={styles.guideText}>
          Open a simple term-and-formula guide directly from the dashboard.
        </span>
        <a
          href={dashboardCopy.resources.simpleGuidePdf}
          target="_blank"
          rel="noreferrer"
          style={styles.guideLink}
        >
          Open PDF
        </a>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    position: "sticky",
    top: "24px",
    alignSelf: "start",
    background: "linear-gradient(180deg, rgba(16, 40, 36, 0.98) 0%, rgba(24, 56, 50, 0.98) 50%, rgba(32, 76, 69, 0.98) 100%)",
    color: "#f5fbf8",
    borderRadius: "28px",
    padding: "22px 18px",
    border: "1px solid rgba(133, 177, 164, 0.18)",
    boxShadow: "0 28px 48px rgba(9, 20, 18, 0.24)",
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
    background: "linear-gradient(135deg, #33b17d, #2563eb)",
    boxShadow: "0 16px 26px rgba(46, 162, 111, 0.24)",
  },
  brandKicker: {
    color: "rgba(237, 250, 244, 0.7)",
    fontSize: "12px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  brandTitle: {
    margin: "4px 0 0",
    fontSize: "22px",
    lineHeight: 1.08,
    letterSpacing: "-0.03em",
  },
  brandText: {
    margin: "14px 0 0",
    color: "rgba(237, 250, 244, 0.74)",
    lineHeight: 1.6,
    fontSize: "14px",
  },
  platformStrip: {
    marginTop: "16px",
    padding: "14px 14px 12px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
    border: "1px solid rgba(147, 197, 185, 0.12)",
    display: "grid",
    gap: "8px",
  },
  platformPill: {
    display: "inline-flex",
    width: "fit-content",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  platformText: {
    color: "rgba(237, 250, 244, 0.84)",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  navList: {
    display: "grid",
    gap: "12px",
    marginTop: "20px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    width: "100%",
    textAlign: "left",
    padding: "14px 13px",
    borderRadius: "18px",
    border: "1px solid rgba(147, 197, 185, 0.14)",
    background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025))",
    color: "#eef8f4",
    cursor: "pointer",
  },
  navItemActive: {
    background: "linear-gradient(135deg, rgba(46, 162, 111, 0.34), rgba(37, 99, 235, 0.26))",
    border: "1px solid rgba(122, 203, 171, 0.36)",
    boxShadow: "0 18px 28px rgba(7, 17, 15, 0.20)",
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
    padding: "15px 16px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
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
  guideCard: {
    marginTop: "16px",
    padding: "16px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, rgba(37,99,235,0.24), rgba(46,162,111,0.18))",
    border: "1px solid rgba(147, 197, 185, 0.18)",
    color: "#ffffff",
    display: "grid",
    gap: "8px",
  },
  guideTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },
  guideTitle: {
    color: "#ffffff",
  },
  guideText: {
    color: "rgba(237, 250, 244, 0.82)",
    fontSize: "13px",
    lineHeight: 1.55,
  },
  guideLink: {
    display: "inline-flex",
    alignSelf: "start",
    padding: "10px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.16)",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: "700",
  },
};

export default DashboardSidebar;
