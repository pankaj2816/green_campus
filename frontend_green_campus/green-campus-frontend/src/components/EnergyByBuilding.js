import React from "react";
import { Bar } from "react-chartjs-2";

export default function EnergyByBuilding({ buildingData }) {
  return (
    <Bar
      data={{
        labels: buildingData.map((b) => b.building),
        datasets: [
          {
            label: "Total Energy (kWh)",
            data: buildingData.map((b) => b.total_kwh),
            backgroundColor: "#673ab7",
            borderRadius: 8,
          },
        ],
      }}
      options={{ responsive: true }}
    />
  );
}