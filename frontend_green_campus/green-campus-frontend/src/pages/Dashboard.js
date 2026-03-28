import React, { useEffect, useState, useCallback } from "react";

import DashboardHeader from "../components/DashboardHeader";
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
import { dashboardCopy } from "../config/dashboardConfig";
import { fetchAssumptions, fetchDashboardBundle } from "../services/api";

function Dashboard() {
  const [data, setData] = useState(null);
  const [trendData, setTrendData] = useState([]);
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
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const bundle = await fetchDashboardBundle({
        building: selectedBuilding,
        granularity: forecastGranularity,
      });

      setData(bundle.summary);
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
  }, [selectedBuilding, forecastGranularity]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const loadAssumptions = async () => {
      try {
        const result = await fetchAssumptions();
        setAssumptions(result);
      } catch (error) {
        console.error("Assumptions fetch error:", error);
      }
    };

    loadAssumptions();
  }, []);

  if (loading && !data) {
    return <h2 style={{ padding: "30px" }}>{dashboardCopy.global.loadingDashboard}</h2>;
  }

  return (
    <div style={styles.page}>
      <DashboardHeader
        buildings={buildingOptions}
        selectedBuilding={selectedBuilding}
        setSelectedBuilding={setSelectedBuilding}
        refresh={fetchData}
        forecastGranularity={forecastGranularity}
        setForecastGranularity={setForecastGranularity}
      />

      <SeasonalOutlookPanel outlook={seasonalOutlook} />
      <AlertCenter alertsData={alertsData} />
      <KPISection data={data} />

      <div style={styles.twoCol}>
        <div>
          <CarbonFootprintDial data={data} />
        </div>
        <div>
          <SolarSection data={data} />
        </div>
      </div>

      <ResourceCharts
        data={data}
        trendData={trendData}
        buildingData={buildingData}
      />

      <AIInsightsSection insightsData={insightsData} />
      <AIRiskSection riskData={riskData} />
      <SustainabilitySimulator selectedBuilding={selectedBuilding} />
      <AIForecastSection
        forecastData={forecastData}
        granularity={forecastGranularity}
      />
      <RankingSection performanceData={performanceData} />
      <AssumptionsPanel assumptions={assumptions} />
    </div>
  );
}

const styles = {
  page: {
    padding: "28px",
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(96,165,250,0.12), transparent 30%), linear-gradient(180deg, #f5f8f7 0%, #eef3f1 100%)",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },
};

export default Dashboard;
