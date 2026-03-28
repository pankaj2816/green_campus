import React from "react";
import { Line } from "react-chartjs-2";

function AIPredictionChart({ forecastData }) {

  if (!forecastData) return null;

  const labels = [
    "M1","M2","M3","M4","M5","M6",
    "M7","M8","M9","M10","M11","M12"
  ];

  const data = {
    labels,
    datasets: [
      {
        label: "Energy Forecast",
        data: forecastData.energy,
        borderColor: "#27ae60",
        backgroundColor: "rgba(39,174,96,0.2)",
        tension: 0.4
      }
    ]
  };

  return (
    <div style={{height:"320px"}}>
      <Line data={data}/>
    </div>
  );
}

export default AIPredictionChart;