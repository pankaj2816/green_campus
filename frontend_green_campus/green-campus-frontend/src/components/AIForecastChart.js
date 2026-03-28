import React from "react";
import { Line } from "react-chartjs-2";
import { dashboardCopy } from "../config/dashboardConfig";

function AIForecastChart({
  historicalValues,
  historicalLabels,
  forecastValues,
  forecastLabels,
  color = "#2f80ed",
}) {
  if (!forecastValues || forecastValues.length === 0) {
    return <p>{dashboardCopy.chart.forecastNoData}</p>;
  }

  const data = {
    labels: [...(historicalLabels || []), ...(forecastLabels || [])],
    datasets: [
      {
        label: dashboardCopy.chart.forecastSeries.historical,
        data: [...(historicalValues || []), ...Array(forecastValues.length).fill(null)],
        borderColor: "#64748b",
        backgroundColor: "rgba(100, 116, 139, 0.14)",
        tension: 0.35,
      },
      {
        label: dashboardCopy.chart.forecastSeries.forecast,
        data: [...Array((historicalValues || []).length).fill(null), ...forecastValues],
        borderColor: color,
        backgroundColor: `${color}33`,
        tension: 0.35,
        fill: true,
        borderDash: [8, 6],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
    },
  };

  return (
    <div style={{ height: "300px" }}>
      <Line data={data} options={options} />
    </div>
  );
}

export default AIForecastChart;
