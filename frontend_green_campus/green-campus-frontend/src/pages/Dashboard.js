import React, { useEffect, useState, useCallback } from "react";

import DashboardHeader from "../components/DashboardHeader";
import DashboardSidebar from "../components/DashboardSidebar";
import KPISection from "../components/KPISection";
import SolarSection from "../components/SolarSection";
import ResourceCharts from "../components/ResourceCharts";
import AIRiskSection from "../components/AIRiskSection";
import AIForecastSection from "../components/AIForecastSection";
import RankingSection from "../components/RankingSection";
import CarbonFootprintDial from "../components/CarbonFootprintDial";
import AIInsightsSection from "../components/AIInsightsSection";
import SustainabilitySimulator from "../components/SustainabilitySimulator";
import AssumptionsPanel from "../components/AssumptionsPanel";
import SeasonalOutlookPanel from "../components/SeasonalOutlookPanel";
import AlertCenter from "../components/AlertCenter";
import DataQualityPanel from "../components/DataQualityPanel";
import ExecutiveReportView from "../components/ExecutiveReportView";
import CampusPulseBar from "../components/CampusPulseBar";
import ComparisonSection from "../components/ComparisonSection";
import OccupancySettingsPanel from "../components/OccupancySettingsPanel";
import StrategicGoalsPanel from "../components/StrategicGoalsPanel";
import ActionTrackerPanel from "../components/ActionTrackerPanel";
import InsightDetailDrawer from "../components/InsightDetailDrawer";
import InfoHint from "../components/InfoHint";
import StatusNotice from "../components/StatusNotice";
import DeviceReadinessPanel from "../components/DeviceReadinessPanel";
import AuditTrailPanel from "../components/AuditTrailPanel";
import { dashboardCopy } from "../config/dashboardConfig";
import { fetchAssumptions, fetchCurrentUser, fetchDashboardBundle, fetchDashboardSettings } from "../services/api";

function SectionIntro({ kicker, title, subtitle, helpText, darkMode = false }) {
  return (
    <div style={styles.sectionIntro}>
      <div style={styles.sectionLabelRow}>
        <span style={styles.sectionIconDot} />
        <span style={{ ...styles.sectionKicker, color: darkMode ? "#7de1bb" : styles.sectionKicker.color }}>{kicker}</span>
      </div>
      <h2 style={{ ...styles.sectionTitle, color: darkMode ? "#f4fbf8" : styles.sectionTitle.color }}>
        {title}
        {helpText ? <InfoHint title={title} text={helpText} width={320} /> : null}
      </h2>
      <p style={{ ...styles.sectionSubtitle, color: darkMode ? "rgba(232,245,239,0.78)" : styles.sectionSubtitle.color }}>{subtitle}</p>
      <div
        style={{
          ...styles.sectionDivider,
          background: darkMode
            ? "linear-gradient(90deg, rgba(125,225,187,0.34), rgba(96,165,250,0.24), rgba(255,255,255,0))"
            : styles.sectionDivider.background,
        }}
      />
    </div>
  );
}

function Dashboard({ onLogout }) {
  const [data, setData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [buildingData, setBuildingData] = useState([]);
  const [buildingOptions, setBuildingOptions] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [forecastData, setForecastData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [assumptions, setAssumptions] = useState(null);
  const [seasonalOutlook, setSeasonalOutlook] = useState(null);
  const [alertsData, setAlertsData] = useState(null);
  const [dataQuality, setDataQuality] = useState(null);
  const [deviceReadiness, setDeviceReadiness] = useState(null);
  const [auditTrail, setAuditTrail] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [forecastGranularity, setForecastGranularity] = useState("monthly");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeView, setActiveView] = useState("overview");
  const [screenshotMode, setScreenshotMode] = useState(false);
  const [pendingPrint, setPendingPrint] = useState(false);
  const [printMode, setPrintMode] = useState(false);
  const [executiveDarkMode, setExecutiveDarkMode] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settingsData, setSettingsData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [canManage, setCanManage] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const bundle = await fetchDashboardBundle({
        building: selectedBuilding,
        granularity: forecastGranularity,
        dateFrom,
        dateTo,
      });

      setData(bundle.summary);
      setComparisonData(bundle.comparisonData);
      setTrendData(bundle.trendData);
      setBuildingOptions(bundle.buildingOptions);
      setBuildingData(bundle.buildingData);
      setPerformanceData(bundle.performanceData);
      setRiskData(bundle.riskData);
      setForecastData(bundle.forecastData);
      setInsightsData(bundle.insightsData);
      setSeasonalOutlook(bundle.seasonalOutlook);
      setAlertsData(bundle.alertsData);
      setDataQuality(bundle.dataQuality);
      setDeviceReadiness(bundle.deviceReadiness);
      setAuditTrail(bundle.auditTrail);
      const failedSections = Object.keys(bundle.sectionErrors || {});
      if (failedSections.length) {
        setLoadError(`Some sections could not be loaded: ${failedSections.join(", ")}.`);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setLoadError(error.message || "Unable to load dashboard data. Please check the backend service and try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedBuilding, forecastGranularity, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await fetchCurrentUser();
        setCanManage(user?.role === "admin");
      } catch (error) {
        setCanManage(false);
      }
    };

    loadCurrentUser();
  }, []);

  useEffect(() => {
    const loadAssumptions = async () => {
      try {
        const result = await fetchAssumptions();
        setAssumptions(result);
        setSettingsData(result.settings || null);
      } catch (error) {
        console.error("Assumptions fetch error:", error);
      }
    };

    loadAssumptions();
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const [assumptionsResult, settingsResult] = await Promise.all([
        fetchAssumptions(),
        fetchDashboardSettings(),
      ]);
      setAssumptions(assumptionsResult);
      setSettingsData(settingsResult);
      fetchData();
    } catch (error) {
      console.error("Settings refresh error:", error);
    }
  }, [fetchData]);

  useEffect(() => {
    const handleAfterPrint = () => {
      setPendingPrint(false);
      setPrintMode(false);
    };

    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  useEffect(() => {
    if (!pendingPrint || activeView !== "report") {
      return;
    }

    const timer = window.setTimeout(() => {
      window.print();
    }, 450);

    return () => window.clearTimeout(timer);
  }, [pendingPrint, activeView]);

  if (loading && !data) {
    return <h2 style={{ padding: "30px" }}>{dashboardCopy.global.loadingDashboard}</h2>;
  }

  const handlePrintReport = () => {
    setPrintMode(true);
    setScreenshotMode(true);
    setActiveView("report");
    setPendingPrint(true);
  };

  return (
    <div
      style={{
        ...styles.page,
        ...(screenshotMode ? styles.pageScreenshot : {}),
        ...(executiveDarkMode ? styles.pageExecutiveDark : {}),
      }}
      className={`app-shell-ambient ${screenshotMode ? "screenshot-mode" : ""}`}
      data-theme={executiveDarkMode ? "executive-dark" : "executive-light"}
    >
      <div style={styles.ambientOne} />
      <div style={styles.ambientTwo} />
      <div style={styles.ambientThree} />
      <div style={styles.pageInner}>
        <div style={styles.shell} className="dashboard-shell">
          {!printMode ? (
            <DashboardSidebar
              activeView={activeView}
              setActiveView={setActiveView}
              selectedBuilding={selectedBuilding}
              forecastGranularity={forecastGranularity}
            />
          ) : null}

          <div
            style={{
              ...styles.mainColumn,
              ...(screenshotMode ? styles.mainColumnScreenshot : {}),
            }}
            className="dashboard-main-column"
          >
            {!printMode ? (
              <>
                <DashboardHeader
                  buildings={buildingOptions}
                  selectedBuilding={selectedBuilding}
                  setSelectedBuilding={setSelectedBuilding}
                  refresh={fetchData}
                  forecastGranularity={forecastGranularity}
                  setForecastGranularity={setForecastGranularity}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  setDateFrom={setDateFrom}
                  setDateTo={setDateTo}
                  comparisonData={comparisonData}
                  riskData={riskData}
                  insightsData={insightsData}
                  screenshotMode={screenshotMode}
                  setScreenshotMode={setScreenshotMode}
                  executiveDarkMode={executiveDarkMode}
                  setExecutiveDarkMode={setExecutiveDarkMode}
                  onPrintReport={handlePrintReport}
                  onLogout={onLogout}
                  canManage={canManage}
                />

                <div style={styles.mobileTabs} className="dashboard-mobile-tabs">
                  {dashboardCopy.header.sectionTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveView(tab.id)}
                      style={{
                        ...styles.mobileTabButton,
                        ...(activeView === tab.id ? styles.mobileTabButtonActive : {}),
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={styles.loadNotice}>
                  <StatusNotice
                    tone="error"
                    message={loadError}
                    onDismiss={() => setLoadError("")}
                  />
                </div>
              </>
            ) : null}

            {activeView === "overview" ? (
              <section style={styles.sectionBlock} className="stagger-in stagger-in-delay-1">
                <SectionIntro {...dashboardCopy.layout.primarySection} darkMode={executiveDarkMode} />
                <div style={styles.workspaceShell}>
                  <div style={styles.workspaceMain}>
                    <CampusPulseBar
                      data={data}
                      riskData={riskData}
                      forecastData={forecastData}
                      seasonalOutlook={seasonalOutlook}
                      insightsData={insightsData}
                    />
                    <ComparisonSection comparisonData={comparisonData} onOpenDetail={setSelectedDetail} />
                    <KPISection data={data} onOpenDetail={setSelectedDetail} />
                    <SeasonalOutlookPanel outlook={seasonalOutlook} />
                  </div>
                  <div style={styles.workspaceRail}>
                    <StrategicGoalsPanel
                      summaryData={data}
                      settings={settingsData}
                      onSaved={refreshSettings}
                      onOpenDetail={setSelectedDetail}
                      canManage={canManage}
                    />
                  </div>
                </div>
                <div style={styles.fullWidthSection}>
                  <ActionTrackerPanel
                    recommendations={insightsData?.recommendations}
                    settings={settingsData}
                    onSaved={refreshSettings}
                    onOpenDetail={setSelectedDetail}
                    canManage={canManage}
                  />
                </div>
              </section>
            ) : null}

            {activeView === "intelligence" ? (
              <section style={styles.sectionBlock} className="stagger-in stagger-in-delay-1">
                <SectionIntro {...dashboardCopy.layout.performanceSection} darkMode={executiveDarkMode} />
                <div style={styles.intelligenceStack}>
                  <div style={styles.twoCol}>
                    <CarbonFootprintDial data={data} />
                    <SolarSection data={data} />
                  </div>

                  <ResourceCharts
                    data={data}
                    trendData={trendData}
                    darkMode={executiveDarkMode}
                    buildingData={buildingData}
                  />

                  <div style={styles.intelligenceSupportGrid} className="intelligence-support-grid">
                    <DataQualityPanel qualityData={dataQuality} onOpenDetail={setSelectedDetail} />
                    <AlertCenter alertsData={alertsData} onOpenDetail={setSelectedDetail} />
                  </div>
                </div>
              </section>
            ) : null}

            {activeView === "planning" ? (
              <section style={styles.sectionBlock} className="stagger-in stagger-in-delay-1">
                <SectionIntro {...dashboardCopy.layout.planningSection} darkMode={executiveDarkMode} />
                <div style={styles.workspaceShell}>
                  <div style={styles.workspaceMain}>
                    <AIForecastSection
                      forecastData={forecastData}
                      granularity={forecastGranularity}
                    />
                    <SustainabilitySimulator
                      selectedBuilding={selectedBuilding}
                      dateFrom={dateFrom}
                      dateTo={dateTo}
                    />
                  </div>
                  <div style={styles.workspaceRail}>
                    <AIRiskSection riskData={riskData} />
                    <AIInsightsSection insightsData={insightsData} onOpenDetail={setSelectedDetail} />
                  </div>
                </div>
              </section>
            ) : null}

            {activeView === "governance" ? (
              <section style={styles.sectionBlock} className="stagger-in stagger-in-delay-1">
                <SectionIntro {...dashboardCopy.layout.governanceSection} darkMode={executiveDarkMode} />
                <div style={styles.governanceStack} className="governance-stack">
                  <RankingSection performanceData={performanceData} />
                  <OccupancySettingsPanel settings={settingsData} onSaved={refreshSettings} canManage={canManage} />
                  <AssumptionsPanel
                    assumptions={assumptions}
                    settings={settingsData}
                    onSaved={refreshSettings}
                    canManage={canManage}
                  />
                  <DeviceReadinessPanel deviceReadiness={deviceReadiness} onSaved={fetchData} canManage={canManage} />
                  <AuditTrailPanel auditTrail={auditTrail} />
                </div>
              </section>
            ) : null}

            {activeView === "report" ? (
            <section style={styles.sectionBlock} className="stagger-in stagger-in-delay-1">
              <ExecutiveReportView
                data={data}
                riskData={riskData}
                insightsData={insightsData}
                performanceData={performanceData}
                forecastData={forecastData}
                seasonalOutlook={seasonalOutlook}
              />
            </section>
            ) : null}
          </div>
        </div>
      </div>
      <InsightDetailDrawer detail={selectedDetail} onClose={() => setSelectedDetail(null)} />
    </div>
  );
}

const styles = {
  page: {
    position: "relative",
    overflow: "hidden",
    padding: "20px 14px 44px",
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(29,138,103,0.12), transparent 28%), radial-gradient(circle at top right, rgba(37,99,235,0.10), transparent 26%), linear-gradient(180deg, #f7fbf9 0%, #eef4f1 54%, #edf2f7 100%)",
  },
  pageScreenshot: {
    background: "#f4f7f6",
  },
  pageExecutiveDark: {
    background:
      "radial-gradient(circle at top left, rgba(29,138,103,0.18), transparent 28%), radial-gradient(circle at top right, rgba(37,99,235,0.16), transparent 26%), linear-gradient(180deg, #0d1715 0%, #12211e 48%, #162724 100%)",
  },
  ambientOne: {
    position: "absolute",
    width: "460px",
    height: "460px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(34,197,94,0.15), rgba(34,197,94,0))",
    top: "-80px",
    left: "-120px",
    filter: "blur(16px)",
  },
  ambientTwo: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59,130,246,0.11), rgba(59,130,246,0))",
    top: "150px",
    right: "-180px",
    filter: "blur(14px)",
  },
  ambientThree: {
    position: "absolute",
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(16,185,129,0.10), rgba(16,185,129,0))",
    bottom: "20px",
    left: "18%",
    filter: "blur(18px)",
  },
  pageInner: {
    position: "relative",
    maxWidth: "1640px",
    margin: "0 auto",
  },
  shell: {
    display: "grid",
    gridTemplateColumns: "256px minmax(0, 1fr)",
    gap: "18px",
  },
  mainColumn: {
    minWidth: 0,
    display: "grid",
    gap: "18px",
  },
  mainColumnScreenshot: {
    maxWidth: "1240px",
  },
  mobileTabs: {
    display: "none",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  loadNotice: {
    marginBottom: "12px",
  },
  mobileTabButton: {
    padding: "12px 18px",
    borderRadius: "999px",
    border: "1px solid #d1ded8",
    background: "#f6faf8",
    color: "#35514a",
    cursor: "pointer",
    fontWeight: "600",
  },
  mobileTabButtonActive: {
    background: "linear-gradient(135deg, #1b7f62, #2563eb)",
    color: "#ffffff",
    border: "1px solid transparent",
    boxShadow: "0 10px 24px rgba(37, 99, 235, 0.18)",
  },
  sectionBlock: {
    marginBottom: "16px",
  },
  workspaceShell: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.38fr) minmax(320px, 0.92fr)",
    gap: "16px",
    alignItems: "start",
  },
  workspaceMain: {
    minWidth: 0,
    display: "grid",
    gap: "14px",
  },
  workspaceRail: {
    minWidth: 0,
    display: "grid",
    gap: "14px",
    alignSelf: "start",
  },
  fullWidthSection: {
    marginTop: "16px",
  },
  sectionIntro: {
    marginBottom: "14px",
    padding: "0 6px",
  },
  sectionLabelRow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(171, 194, 186, 0.28)",
    boxShadow: "0 8px 20px rgba(12, 24, 21, 0.04)",
  },
  sectionIconDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1d8a67, #2563eb)",
    boxShadow: "0 0 0 4px rgba(29, 138, 103, 0.12)",
  },
  sectionKicker: {
    color: "#1b7f62",
    fontWeight: "700",
    fontSize: "12px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  sectionTitle: {
    margin: "8px 0 6px",
    color: "#17342d",
    fontSize: "32px",
    letterSpacing: "-0.03em",
  },
  sectionSubtitle: {
    margin: 0,
    color: "#60756f",
    lineHeight: 1.6,
    maxWidth: "980px",
  },
  sectionDivider: {
    marginTop: "14px",
    width: "100%",
    height: "1px",
    background: "linear-gradient(90deg, rgba(29,138,103,0.24), rgba(37,99,235,0.16), rgba(255,255,255,0))",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  intelligenceStack: {
    display: "grid",
    gap: "16px",
  },
  intelligenceSupportGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(320px, 0.94fr) minmax(0, 1.06fr)",
    gap: "16px",
    alignItems: "start",
  },
  governanceStack: {
    display: "grid",
    gap: "16px",
  },
};

export default Dashboard;
