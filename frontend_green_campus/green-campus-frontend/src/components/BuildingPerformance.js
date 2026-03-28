import React from "react";

import { dashboardCopy } from "../config/dashboardConfig";

function getRowStyle(rank, total) {
  if (rank === 1) {
    return { backgroundColor: "#d4edda" };
  }
  if (rank === total) {
    return { backgroundColor: "#f8d7da" };
  }
  return {};
}

function formatNumber(value) {
  if (value === undefined || value === null) return "-";
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function BuildingPerformance({ performanceData }) {
  if (!performanceData || performanceData.length === 0) {
    return (
      <p style={{ textAlign: "center", padding: "20px" }}>
        {dashboardCopy.ranking.empty}
      </p>
    );
  }

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "20px",
        borderRadius: "16px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
        overflowX: "auto",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "center",
        }}
      >
        <thead>
          <tr style={{ background: "#f4f6f9" }}>
            {dashboardCopy.ranking.headers.map((header) => (
              <th key={header} style={thStyle}>{header}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {performanceData.map((building, index) => (
            <tr
              key={index}
              style={{
                ...getRowStyle(building.rank, performanceData.length),
                borderBottom: "1px solid #eee",
              }}
            >
              <td style={tdStyle}>{building.rank}</td>
              <td style={tdStyle}><strong>{building.building}</strong></td>
              <td style={tdStyle}>{formatNumber(building.energy)}</td>
              <td style={tdStyle}>{formatNumber(building.solar)}</td>
              <td style={tdStyle}>{formatNumber(building.net_energy)}</td>
              <td style={tdStyle}>{formatNumber(building.water)}</td>
              <td style={tdStyle}>{formatNumber(building.waste)}</td>
              <td style={tdStyle}>{formatNumber(building.carbon)}</td>
              <td style={tdStyle}>
                {(building.efficiency_score * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: "12px",
  fontWeight: "600",
  fontSize: "14px",
};

const tdStyle = {
  padding: "10px",
  fontSize: "14px",
};

export default BuildingPerformance;
