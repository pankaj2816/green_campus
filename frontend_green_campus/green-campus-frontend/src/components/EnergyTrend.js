import React from "react";
import { Line } from "react-chartjs-2";
import { dashboardCopy } from "../config/dashboardConfig";

export default function EnergyTrend({ trendData }) {
  if (!trendData || trendData.length === 0) {
    return <p>{dashboardCopy.chart.trendNoData}</p>;
  }

  const labels = trendData.map((item) => item.month);
  const energy = trendData.map((item) => item.energy);
  const solar = trendData.map((item) => item.solar);
  const net = trendData.map((item) => item.net);

  const data = {
    labels,
    datasets: [
      {
        label: dashboardCopy.chart.trendSeries.energy,
        data: energy,
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.12)",
        tension: 0.35,
        fill: true,
      },
      {
        label: dashboardCopy.chart.trendSeries.solar,
        data: solar,
        borderColor: "#65a30d",
        backgroundColor: "rgba(132, 204, 22, 0.1)",
        tension: 0.35,
        fill: true,
      },
      {
        label: dashboardCopy.chart.trendSeries.net,
        data: net,
        borderColor: "#0284c7",
        backgroundColor: "rgba(2, 132, 199, 0.08)",
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <>
      <h3 style={{ marginTop: 0, color: "#18332d" }}>{dashboardCopy.chart.trendTitle}</h3>
      <p style={{ color: "#60756f", marginBottom: "16px" }}>
        {dashboardCopy.chart.trendSubtitle}
      </p>
      <div style={{ height: "360px" }}>
        <Line data={data} options={options} />
      </div>
    </>
  );
}
