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
import ExecutiveReportView from "../components/ExecutiveReportView";
import CampusPulseBar from "../components/CampusPulseBar";
import ComparisonSection from "../components/ComparisonSection";
import OccupancySettingsPanel from "../components/OccupancySettingsPanel";
import { dashboardCopy } from "../config/dashboardConfig";
import { fetchAssumptions, fetchDashboardBundle, fetchDashboardSettings } from "../services/api";

function SectionIntro({ kicker, title, subtitle }) {
  return (
    <div style={styles.sectionIntro}>
      <span style={styles.sectionKicker}>{kicker}</span>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <p style={styles.sectionSubtitle}>{subtitle}</p>
    </div>
  );
}

function Dashboard() {
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
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [forecastGranularity, setForecastGranularity] = useState("monthly");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeView, setActiveView] = useState("overview");
  const [screenshotMode, setScreenshotMode] = useState(false);
  const [pendingPrint, setPendingPrint] = useState(false);
  const [printMode, setPrintMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settingsData, setSettingsData] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);

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
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedBuilding, forecastGranularity, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      }}
      className={`app-shell-ambient ${screenshotMode ? "screenshot-mode" : ""}`}
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
                  onPrintReport={handlePrintReport}
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
              </>
            ) : null}

            {activeView === "overview" ? (
            <section style={styles.sectionBlock} className="stagger-in stagger-in-delay-1">
              <SectionIntro {...dashboardCopy.layout.primarySection} />
              <CampusPulseBar
                data={data}
                riskData={riskData}
                forecastData={forecastData}
                seasonalOutlook={seasonalOutlook}
                insightsData={insightsData}
              />
              <ComparisonSection comparisonData={comparisonData} />
              <SeasonalOutlookPanel outlook={seasonalOutlook} />
              <KPISection data={data} />
            </section>
            ) : null}

            {activeView === "intelligence" ? (
            <section style={styles.sectionBlock} className="stagger-in stagger-in-delay-1">
              <SectionIntro {...dashboardCopy.layout.performanceSection} />
              <AlertCenter alertsData={alertsData} />

              <div style={styles.twoCol}>
                <CarbonFootprintDial data={data} />
                <SolarSection data={data} />
              </div>

              <ResourceCharts
                data={data}
                trendData={trendData}
                buildingData={buildingData}
              />
            </section>
            ) : null}

            {activeView === "planning" ? (
            <section style={styles.sectionBlock} className="stagger-in stagger-in-delay-1">
              <SectionIntro {...dashboardCopy.layout.planningSection} />
              <AIInsightsSection insightsData={insightsData} />
              <AIRiskSection riskData={riskData} />
              <SustainabilitySimulator
                selectedBuilding={selectedBuilding}
                dateFrom={dateFrom}
                dateTo={dateTo}
              />
              <AIForecastSection
                forecastData={forecastData}
                granularity={forecastGranularity}
              />
            </section>
            ) : null}

            {activeView === "governance" ? (
            <section style={styles.sectionBlock} className="stagger-in stagger-in-delay-1">
              <SectionIntro {...dashboardCopy.layout.governanceSection} />
              <RankingSection performanceData={performanceData} />
              <OccupancySettingsPanel settings={settingsData} onSaved={refreshSettings} />
              <AssumptionsPanel assumptions={assumptions} />
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
    </div>
  );
}

const styles = {
  page: {
    position: "relative",
    overflow: "hidden",
    padding: "28px 20px 60px",
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(96,165,250,0.12), transparent 30%), linear-gradient(180deg, #f5f8f7 0%, #eef3f1 100%)",
  },
  pageScreenshot: {
    background: "#f4f7f6",
  },
  ambientOne: {
    position: "absolute",
    width: "380px",
    height: "380px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(34,197,94,0.16), rgba(34,197,94,0))",
    top: "-40px",
    left: "-80px",
    filter: "blur(10px)",
  },
  ambientTwo: {
    position: "absolute",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59,130,246,0.12), rgba(59,130,246,0))",
    top: "180px",
    right: "-120px",
    filter: "blur(8px)",
  },
  ambientThree: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(16,185,129,0.12), rgba(16,185,129,0))",
    bottom: "40px",
    left: "20%",
    filter: "blur(12px)",
  },
  pageInner: {
    position: "relative",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  shell: {
    display: "grid",
    gridTemplateColumns: "280px minmax(0, 1fr)",
    gap: "24px",
  },
  mainColumn: {
    minWidth: 0,
  },
  mainColumnScreenshot: {
    maxWidth: "1180px",
  },
  mobileTabs: {
    display: "none",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "20px",
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
    marginBottom: "34px",
  },
  sectionIntro: {
    marginBottom: "16px",
    padding: "0 4px",
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
    fontSize: "30px",
  },
  sectionSubtitle: {
    margin: 0,
    color: "#60756f",
    lineHeight: 1.6,
    maxWidth: "800px",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },
};

export default Dashboard;
