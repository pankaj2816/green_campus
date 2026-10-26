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
  const electricity = [
    { label: "Energy", value: Number(data.energy || 0), unit: "kWh", color: "#f59e0b" },
    { label: "Solar", value: Number(data.solar || 0), unit: "kWh", color: "#84cc16" },
    { label: "Net grid", value: Number(data.net_energy || 0), unit: "kWh", color: "#2563eb" },
  ];
  const resources = [
    ...electricity,
    { label: "Water", value: Number(data.water || 0), unit: "kl", color: "#0284c7" },
    { label: "Waste", value: Number(data.waste || 0), unit: "kg", color: "#14b8a6" },
  ];
  const solarCoverage = Number(data.energy || 0) > 0
    ? ((Number(data.solar || 0) / Number(data.energy || 0)) * 100).toFixed(1)
    : "0.0";

  const chartData = {
    labels: dashboardCopy.chart.resourceOverviewLabels,
    datasets: [
      {
        label: "Electricity",
        data: electricity.map((item) => item.value),
        backgroundColor: electricity.map((item) => item.color),
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
            return `${context.label}: ${value} kWh`;
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
          Solar coverage {solarCoverage}%
        </div>
      </div>
      <p style={{ ...styles.subtitle, color: subtitleColor }}>{dashboardCopy.chart.resourceOverviewSubtitle}</p>
      <div style={styles.chartWrap}>
        <Bar data={chartData} options={options} />
      </div>
      <div style={styles.metricGrid}>
        {resources.map((item) => (
          <div key={item.label} style={styles.metricCard}>
            <div style={styles.metricTop}>
              <span style={{ ...styles.metricDot, background: item.color }} />
              <span style={{ ...styles.metricName, color: titleColor }}>{item.label}</span>
            </div>
            <strong style={{ ...styles.metricValue, color: titleColor }}>
              {item.value.toLocaleString()} {item.unit}
            </strong>
          </div>
        ))}
      </div>
      <div
        style={{
          ...styles.footerNote,
          background: darkMode ? "rgba(255,255,255,0.05)" : "rgba(239,247,243,0.9)",
          color: subtitleColor,
        }}
      >
        The bars compare electricity only, in kWh. Water and waste stay in the figures below because they use different units.
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
  metricGrid: {
    marginTop: "14px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "10px",
  },
  metricCard: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(243,249,246,0.9))",
    borderRadius: "16px",
    padding: "12px 14px",
    border: "1px solid rgba(160, 190, 180, 0.18)",
    boxShadow: "0 10px 22px rgba(12, 24, 21, 0.04)",
  },
  metricTop: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  metricDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  metricName: {
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  metricValue: {
    display: "block",
    marginTop: "8px",
    fontSize: "18px",
    lineHeight: 1.35,
    letterSpacing: "-0.02em",
  },
  footerNote: {
    marginTop: "12px",
    borderRadius: "14px",
    padding: "10px 12px",
    fontSize: "12px",
    lineHeight: 1.55,
  },
};

export default ResourceOverview;
