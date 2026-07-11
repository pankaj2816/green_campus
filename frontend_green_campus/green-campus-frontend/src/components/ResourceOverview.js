import React from "react";
import { Bar } from "react-chartjs-2";
import { dashboardCopy } from "../config/dashboardConfig";

function ResourceOverview({ data, darkMode = false }) {
  if (!data) return null;

  const axisColor = darkMode ? "#d7e6e0" : "#4f6660";
  const gridColor = darkMode ? "rgba(195, 214, 207, 0.16)" : "rgba(114, 138, 130, 0.14)";
  const titleColor = darkMode ? "#f4fbf8" : "#18332d";
  const subtitleColor = darkMode ? "rgba(235,245,240,0.76)" : "#60756f";
  const cardBackground = darkMode
    ? "linear-gradient(180deg, rgba(20,38,34,0.98), rgba(18,32,29,0.96))"
    : "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,251,249,0.94))";

  const chartData = {
    labels: dashboardCopy.chart.resourceOverviewLabels,
    datasets: [
      {
        label: "Campus Total",
        data: [data.energy, data.water, data.waste, data.solar],
        backgroundColor: ["#f59e0b", "#0284c7", "#14b8a6", "#84cc16"],
        borderRadius: 14,
        maxBarThickness: 48,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: darkMode ? "rgba(12, 24, 21, 0.94)" : "rgba(255,255,255,0.96)",
        titleColor: darkMode ? "#f4fbf8" : "#17342d",
        bodyColor: darkMode ? "#e8f5ef" : "#35514a",
        borderColor: darkMode ? "rgba(148, 182, 170, 0.24)" : "rgba(148, 182, 170, 0.2)",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            const value = Number(context.raw || 0).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            });
            const unitMap = ["kWh", "kl", "kg", "kWh"];
            return `${context.label}: ${value} ${unitMap[context.dataIndex] || ""}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          autoSkip: false,
          color: axisColor,
          font: {
            size: 11,
            weight: "600",
          },
        },
        title: {
          display: true,
          text: dashboardCopy.chart.resourceOverviewXAxis,
          color: axisColor,
          font: {
            weight: "700",
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: axisColor,
          font: {
            size: 11,
            weight: "600",
          },
        },
        title: {
          display: true,
          text: dashboardCopy.chart.resourceOverviewYAxis,
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
    <div style={{ ...styles.card, background: cardBackground }}>
      <div style={styles.headingRow}>
        <div>
          <div style={{ ...styles.microLabel, color: subtitleColor }}>Resource Comparison</div>
          <h3 style={{ ...styles.title, color: titleColor }}>{dashboardCopy.chart.resourceOverviewTitle}</h3>
        </div>
        <div
          style={{
            ...styles.statChip,
            background: darkMode ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.74)",
            border: `1px solid ${darkMode ? "rgba(157, 191, 179, 0.14)" : "rgba(160, 190, 180, 0.24)"}`,
            color: darkMode ? "#f4fbf8" : "#35514a",
          }}
        >
          4 tracked streams
        </div>
      </div>
      <p style={{ ...styles.subtitle, color: subtitleColor }}>{dashboardCopy.chart.resourceOverviewSubtitle}</p>
      <div style={styles.chartWrap}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

const styles = {
  card: {
    padding: "24px",
    borderRadius: "24px",
    boxShadow: "0 18px 40px rgba(12, 24, 21, 0.08)",
  },
  headingRow: {
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
    margin: 0,
    letterSpacing: "-0.03em",
  },
  subtitle: {
    marginTop: "8px",
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
  chartWrap: {
    height: "360px",
    marginTop: "10px",
  },
};

export default ResourceOverview;
