import React, { useState } from "react";

import { runSimulation } from "../services/api";
import { dashboardCopy } from "../config/dashboardConfig";

const defaultInputs = {
  energy_reduction_pct: 10,
  water_reduction_pct: 5,
  waste_reduction_pct: 5,
  solar_increase_pct: 10,
};

function Metric({ title, value }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricTitle}>{title}</div>
      <div style={styles.metricValue}>{value}</div>
    </div>
  );
}

function SustainabilitySimulator({ selectedBuilding }) {
  const [inputs, setInputs] = useState(defaultInputs);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setInputs((current) => ({
      ...current,
      [key]: Number(value),
    }));
  };

  const handleRun = async () => {
    setLoading(true);

    try {
      const data = await runSimulation({
        building: selectedBuilding || null,
        ...inputs,
      });
      setResult(data);
    } catch (error) {
      console.error(error);
      alert(error.message || dashboardCopy.simulator.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={{ margin: 0 }}>{dashboardCopy.simulator.title}</h3>
          <p style={styles.subtext}>{dashboardCopy.simulator.subtitle}</p>
        </div>
        <button onClick={handleRun} style={styles.button}>
          {loading ? dashboardCopy.simulator.runningLabel : dashboardCopy.simulator.runLabel}
        </button>
      </div>

      <div style={styles.sliderGrid}>
        <Slider
          label={dashboardCopy.simulator.sliders.energyReduction}
          value={inputs.energy_reduction_pct}
          onChange={(value) => handleChange("energy_reduction_pct", value)}
        />
        <Slider
          label={dashboardCopy.simulator.sliders.waterReduction}
          value={inputs.water_reduction_pct}
          onChange={(value) => handleChange("water_reduction_pct", value)}
        />
        <Slider
          label={dashboardCopy.simulator.sliders.wasteReduction}
          value={inputs.waste_reduction_pct}
          onChange={(value) => handleChange("waste_reduction_pct", value)}
        />
        <Slider
          label={dashboardCopy.simulator.sliders.solarIncrease}
          value={inputs.solar_increase_pct}
          onChange={(value) => handleChange("solar_increase_pct", value)}
        />
      </div>

      {result ? (
        <div style={styles.resultsGrid}>
          <div style={styles.resultPanel}>
            <h4>{dashboardCopy.simulator.sections.baseline}</h4>
            <Metric title={dashboardCopy.simulator.metrics.netEnergy} value={`${result.baseline.net_energy} kWh`} />
            <Metric title={dashboardCopy.simulator.metrics.carbon} value={`${result.baseline.carbon} kg CO2`} />
            <Metric title={dashboardCopy.simulator.metrics.energyCost} value={`Rs ${result.baseline.energy_cost}`} />
            <Metric title={dashboardCopy.simulator.metrics.greenIndex} value={`${result.baseline.green_index}%`} />
          </div>

          <div style={styles.resultPanel}>
            <h4>{dashboardCopy.simulator.sections.projected}</h4>
            <Metric title={dashboardCopy.simulator.metrics.netEnergy} value={`${result.projected.net_energy} kWh`} />
            <Metric title={dashboardCopy.simulator.metrics.carbon} value={`${result.projected.carbon} kg CO2`} />
            <Metric title={dashboardCopy.simulator.metrics.energyCost} value={`Rs ${result.projected.energy_cost}`} />
            <Metric title={dashboardCopy.simulator.metrics.greenIndex} value={`${result.projected.green_index}%`} />
          </div>

          <div style={styles.resultPanel}>
            <h4>{dashboardCopy.simulator.sections.impact}</h4>
            <Metric title={dashboardCopy.simulator.metrics.carbonSaved} value={`${result.impact.carbon_saved} kg CO2`} />
            <Metric title={dashboardCopy.simulator.metrics.costSaved} value={`Rs ${result.impact.cost_saved}`} />
            <Metric title={dashboardCopy.simulator.metrics.greenIndexGain} value={`${result.impact.green_index_gain}%`} />
            <Metric title={dashboardCopy.simulator.metrics.scope} value={result.scope} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Slider({ label, value, onChange }) {
  return (
    <label style={styles.sliderCard}>
      <span style={styles.sliderLabel}>{label}</span>
      <input
        type="range"
        min="0"
        max="50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <strong>{value}%</strong>
    </label>
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
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  subtext: {
    marginTop: "8px",
    color: "#5b6d67",
  },
  button: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#155e4b",
    color: "#ffffff",
    cursor: "pointer",
  },
  sliderGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginTop: "16px",
  },
  sliderCard: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "16px",
    borderRadius: "12px",
    background: "#f7faf8",
  },
  sliderLabel: {
    color: "#214740",
    fontWeight: "600",
  },
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginTop: "20px",
  },
  resultPanel: {
    background: "#f8fbfa",
    borderRadius: "12px",
    padding: "16px",
  },
  metricCard: {
    padding: "10px 0",
    borderBottom: "1px solid #dce7e2",
  },
  metricTitle: {
    color: "#5a6c66",
    fontSize: "13px",
  },
  metricValue: {
    color: "#16312b",
    fontSize: "20px",
    fontWeight: "700",
    marginTop: "4px",
  },
};

export default SustainabilitySimulator;
