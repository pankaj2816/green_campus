import React from "react";
import { Line } from "react-chartjs-2";
import { dashboardCopy } from "../config/dashboardConfig";

export default function EnergyTrend({ trendData, darkMode = false }) {
  if (!trendData || trendData.length === 0) {
    return <p>{dashboardCopy.chart.trendNoData}</p>;
  }

  const axisColor = darkMode ? "#d7e6e0" : "#4f6660";
  const gridColor = darkMode ? "rgba(195, 214, 207, 0.16)" : "rgba(114, 138, 130, 0.14)";
  const titleColor = darkMode ? "#f4fbf8" : "#18332d";
  const subtitleColor = darkMode ? "rgba(235,245,240,0.76)" : "#60756f";

  const labels = trendData.map((item) => item.month);
  const energy = trendData.map((item) => item.energy);
  const solar = trendData.map((item) => item.solar);
  const net = trendData.map((item) => item.net);
  const latest = trendData[trendData.length - 1];
  const previous = trendData.length > 1 ? trendData[trendData.length - 2] : null;
  const deltaText = (current, before) => {
    if (before === null || before === undefined) {
      return "Baseline point";
    }
    const diff = Number(current || 0) - Number(before || 0);
    const direction = diff > 0 ? "up" : diff < 0 ? "down" : "flat";
    return `${direction} ${Math.abs(diff).toLocaleString()} kWh vs last point`;
  };

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
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: "#f59e0b",
        pointBorderWidth: 0,
      },
      {
        label: dashboardCopy.chart.trendSeries.solar,
        data: solar,
        borderColor: "#65a30d",
        backgroundColor: "rgba(132, 204, 22, 0.1)",
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: "#65a30d",
        pointBorderWidth: 0,
      },
      {
        label: dashboardCopy.chart.trendSeries.net,
        data: net,
        borderColor: "#0284c7",
        backgroundColor: "rgba(2, 132, 199, 0.08)",
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: "#0284c7",
        pointBorderWidth: 0,
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
          color: axisColor,
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            weight: "700",
          },
        },
      },
      tooltip: {
        backgroundColor: darkMode ? "rgba(12, 24, 21, 0.94)" : "rgba(255,255,255,0.96)",
        titleColor: darkMode ? "#f4fbf8" : "#17342d",
        bodyColor: darkMode ? "#e8f5ef" : "#35514a",
        borderColor: darkMode ? "rgba(148, 182, 170, 0.24)" : "rgba(148, 182, 170, 0.2)",
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      x: {
        ticks: {
          color: axisColor,
          font: {
            weight: "600",
          },
        },
        title: {
          display: true,
          text: dashboardCopy.chart.trendXAxis,
          color: axisColor,
          font: {
            weight: "700",
          },
        },
        grid: {
          color: gridColor,
          drawBorder: false,
        },
      },
      y: {
        ticks: {
          color: axisColor,
          font: {
            weight: "600",
          },
        },
        title: {
          display: true,
          text: dashboardCopy.chart.trendYAxis,
          color: axisColor,
          font: {
            weight: "700",
          },
        },
        grid: {
          color: gridColor,
          drawBorder: false,
        },
      },
    },
  };

  return (
    <>
      <div style={styles.headerRow}>
        <div>
          <div style={{ ...styles.microLabel, color: subtitleColor }}>Trend Story</div>
          <h3 style={{ ...styles.title, color: titleColor }}>{dashboardCopy.chart.trendTitle}</h3>
        </div>
        <div style={styles.statChip}>Energy, solar, and net draw</div>
      </div>
      <p style={{ ...styles.subtitle, color: subtitleColor }}>
        {dashboardCopy.chart.trendSubtitle}
      </p>
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Latest Energy</span>
          <strong style={styles.summaryValue}>{Number(latest?.energy || 0).toLocaleString()} kWh</strong>
          <span style={styles.summaryNote}>{deltaText(latest?.energy, previous?.energy)}</span>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Latest Solar</span>
          <strong style={styles.summaryValue}>{Number(latest?.solar || 0).toLocaleString()} kWh</strong>
          <span style={styles.summaryNote}>{deltaText(latest?.solar, previous?.solar)}</span>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Latest Net Grid</span>
          <strong style={styles.summaryValue}>{Number(latest?.net || 0).toLocaleString()} kWh</strong>
          <span style={styles.summaryNote}>{deltaText(latest?.net, previous?.net)}</span>
        </div>
      </div>
      <div style={styles.chartWrap}>
        <Line data={data} options={options} />
      </div>
    </>
  );
}

const styles = {
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "start",
    flexWrap: "wrap",
  },
  microLabel: {
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  title: {
    marginTop: 0,
    marginBottom: 0,
    letterSpacing: "-0.03em",
  },
  subtitle: {
    marginBottom: "16px",
    lineHeight: 1.55,
  },
  statChip: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.74)",
    border: "1px solid rgba(160, 190, 180, 0.24)",
    color: "#35514a",
    fontSize: "12px",
    fontWeight: "700",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "10px",
    marginBottom: "16px",
  },
  summaryCard: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(243,249,246,0.92))",
    borderRadius: "16px",
    padding: "12px 14px",
    border: "1px solid rgba(160, 190, 180, 0.18)",
    boxShadow: "0 10px 22px rgba(12, 24, 21, 0.04)",
    display: "grid",
    gap: "4px",
  },
  summaryLabel: {
    color: "#60756f",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: "800",
  },
  summaryValue: {
    color: "#17342d",
    fontSize: "20px",
    lineHeight: 1.2,
    letterSpacing: "-0.03em",
  },
  summaryNote: {
    color: "#60756f",
    fontSize: "12px",
    lineHeight: 1.45,
  },
  chartWrap: {
    height: "360px",
  },
};
