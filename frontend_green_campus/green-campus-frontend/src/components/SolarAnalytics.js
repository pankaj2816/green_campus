import React from "react";
import { dashboardCopy } from "../config/dashboardConfig";

function SolarAnalytics({ data }) {
  if (!data) return null;

  const solarPercent =
    data.energy > 0 ? ((data.solar / data.energy) * 100).toFixed(2) : 0;
  const carbonSaved = (data.solar_avoided_carbon || 0).toFixed(0);
  const moneySaved = (data.solar * 8).toFixed(0);

  return (
    <div style={styles.grid}>
      <Card title={dashboardCopy.solar.cards.contribution} value={`${solarPercent}%`} />
      <Card title={dashboardCopy.solar.cards.avoided} value={`${carbonSaved} kg`} />
      <Card title={dashboardCopy.solar.cards.savings} value={`Rs ${moneySaved}`} />
      <Card title={dashboardCopy.solar.cards.export} value={`${data.export_to_grid_kwh || 0} kWh`} />
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={styles.card}>
      <h4 style={styles.cardTitle}>{title}</h4>
      <h2 style={styles.cardValue}>{value}</h2>
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },
  card: {
    background: "linear-gradient(180deg, #f8fbfa 0%, #eef8f2 100%)",
    padding: "18px",
    borderRadius: "18px",
  },
  cardTitle: {
    margin: 0,
    color: "#5c726c",
  },
  cardValue: {
    marginBottom: 0,
    color: "#17342d",
    fontSize: "28px",
  },
};

export default SolarAnalytics;
