import React from "react";

import { dashboardCopy } from "../config/dashboardConfig";

function getRowTone(rank, total) {
  if (rank === 1) {
    return {
      background: "#eef9f1",
      borderLeft: "4px solid #27ae60",
    };
  }
  if (rank === total) {
    return {
      background: "#fff3f4",
      borderLeft: "4px solid #e05b65",
    };
  }
  return {
    background: "#ffffff",
    borderLeft: "4px solid transparent",
  };
}

function formatNumber(value) {
  if (value === undefined || value === null) {
    return "-";
  }

  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function SummaryCard({ label, value, tone }) {
  return (
    <div
      style={{
        ...styles.summaryCard,
        ...(tone === "good" ? styles.summaryGood : {}),
        ...(tone === "watch" ? styles.summaryWatch : {}),
      }}
    >
      <span style={styles.summaryLabel}>{label}</span>
      <strong style={styles.summaryValue}>{value}</strong>
    </div>
  );
}

function BuildingPerformance({ performanceData }) {
  if (!performanceData || performanceData.length === 0) {
    return (
      <p style={{ textAlign: "center", padding: "20px" }}>
        {dashboardCopy.ranking.empty}
      </p>
    );
  }

  const best = performanceData[0];
  const worst = performanceData[performanceData.length - 1];

  return (
    <div style={styles.container}>
      <div style={styles.summaryRow}>
        <SummaryCard label="Top Performer" value={best?.building || "-"} tone="good" />
        <SummaryCard label="Needs Attention" value={worst?.building || "-"} tone="watch" />
        <SummaryCard label="Buildings Ranked" value={performanceData.length} />
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headRow}>
              {dashboardCopy.ranking.headers.map((header, index) => (
                <th
                  key={header}
                  style={{
                    ...styles.th,
                    ...(index === 0 ? styles.stickyRank : {}),
                    ...(index === 1 ? styles.stickyBuilding : {}),
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {performanceData.map((building, index) => (
              <tr
                key={`${building.building}-${building.rank}-${index}`}
                style={{
                  ...styles.row,
                  ...getRowTone(building.rank, performanceData.length),
                }}
              >
                <td style={{ ...styles.td, ...styles.stickyRank, ...styles.rankCell }}>
                  {building.rank}
                </td>
                <td style={{ ...styles.td, ...styles.stickyBuilding, ...styles.buildingCell }}>
                  <strong>{building.building}</strong>
                </td>
                <td style={styles.td}>{formatNumber(building.energy)}</td>
                <td style={styles.td}>{formatNumber(building.solar)}</td>
                <td style={styles.td}>{formatNumber(building.net_energy)}</td>
                <td style={styles.td}>{formatNumber(building.water)}</td>
                <td style={styles.td}>{formatNumber(building.waste)}</td>
                <td style={styles.td}>{formatNumber(building.carbon)}</td>
                <td style={styles.td}>
                  {(Number(building.efficiency_score || 0) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const stickyBase = {
  position: "sticky",
  background: "#ffffff",
  zIndex: 2,
};

const styles = {
  container: {
    display: "grid",
    gap: "14px",
    background: "#ffffff",
    padding: "18px",
    borderRadius: "16px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
  },
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
  },
  summaryCard: {
    padding: "12px 14px",
    borderRadius: "14px",
    background: "#f8fbfa",
    border: "1px solid #deebe6",
    display: "grid",
    gap: "4px",
  },
  summaryGood: {
    background: "#eef9f1",
    borderColor: "#c9e9d2",
  },
  summaryWatch: {
    background: "#fff3f4",
    borderColor: "#f2d6da",
  },
  summaryLabel: {
    color: "#60756f",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    fontWeight: "700",
  },
  summaryValue: {
    color: "#17342d",
    fontSize: "16px",
  },
  tableWrap: {
    overflowX: "auto",
    paddingBottom: "4px",
  },
  table: {
    width: "100%",
    minWidth: "860px",
    borderCollapse: "separate",
    borderSpacing: 0,
    textAlign: "center",
  },
  headRow: {
    background: "#f4f7f7",
  },
  th: {
    padding: "12px 10px",
    fontWeight: "700",
    fontSize: "13px",
    color: "#35514a",
    borderBottom: "1px solid #dce7e2",
    background: "#f4f7f7",
  },
  td: {
    padding: "12px 10px",
    fontSize: "13px",
    color: "#17342d",
    borderBottom: "1px solid #edf2ef",
    background: "inherit",
    whiteSpace: "nowrap",
  },
  row: {
    transition: "background 0.2s ease",
  },
  stickyRank: {
    ...stickyBase,
    left: 0,
    minWidth: "58px",
    boxShadow: "1px 0 0 #edf2ef",
  },
  stickyBuilding: {
    ...stickyBase,
    left: "58px",
    minWidth: "150px",
    textAlign: "left",
    boxShadow: "1px 0 0 #edf2ef",
  },
  rankCell: {
    fontWeight: "700",
  },
  buildingCell: {
    whiteSpace: "normal",
    lineHeight: 1.35,
  },
};

export default BuildingPerformance;
