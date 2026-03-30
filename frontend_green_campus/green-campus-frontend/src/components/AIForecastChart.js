import React from "react";
import { Line } from "react-chartjs-2";
import { dashboardCopy } from "../config/dashboardConfig";

function AIForecastChart({
  historicalValues,
  historicalLabels,
  forecastValues,
  forecastLabels,
  forecastLower,
  forecastUpper,
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
        backgroundColor: `${color}26`,
        tension: 0.35,
        borderDash: [8, 6],
        fill: false,
      },
      {
        label: dashboardCopy.chart.forecastSeries.confidence,
        data: [...Array((historicalValues || []).length).fill(null), ...(forecastLower || [])],
        borderColor: `${color}33`,
        backgroundColor: "transparent",
        pointRadius: 0,
        tension: 0.35,
      },
      {
        label: dashboardCopy.chart.forecastSeries.confidence,
        data: [...Array((historicalValues || []).length).fill(null), ...(forecastUpper || forecastValues)],
        borderColor: `${color}22`,
        backgroundColor: `${color}18`,
        pointRadius: 0,
        tension: 0.35,
        fill: "-1",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          filter: (item) => item.text !== dashboardCopy.chart.forecastSeries.confidence || item.datasetIndex === 3,
        },
      },
    },
  };

  return (
    <div style={{ height: "300px" }}>
      <Line data={data} options={options} />
    </div>
  );
}

export default AIForecastChart;
