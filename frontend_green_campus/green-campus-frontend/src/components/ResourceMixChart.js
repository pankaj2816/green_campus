import React from "react";
import { Doughnut } from "react-chartjs-2";

import { dashboardCopy } from "../config/dashboardConfig";

const { theme } = dashboardCopy;

const resourceItems = [
  { key: "energy", label: "Electricity", color: "#f59e0b", unit: "kWh" },
  { key: "water", label: "Water", color: "#0ea5e9", unit: "KL" },
  { key: "waste", label: "Waste", color: "#14b8a6", unit: "kg" },
  { key: "solar", label: "Solar", color: "#84cc16", unit: "kWh" },
];

function ResourceMixChart({ data }) {
  if (!data) {
    return null;
  }

  const total = resourceItems.reduce((sum, item) => sum + (Number(data[item.key]) || 0), 0);
  const largestItem = [...resourceItems].sort(
    (a, b) => (Number(data[b.key]) || 0) - (Number(data[a.key]) || 0)
  )[0];

  const chartData = {
    labels: resourceItems.map((item) => item.label),
    datasets: [
      {
        data: resourceItems.map((item) => data[item.key]),
        backgroundColor: resourceItems.map((item) => item.color),
        borderColor: "#f8fbfa",
        borderWidth: 4,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>{dashboardCopy.chart.resourceMixTitle}</h3>
        <p style={styles.subtitle}>{dashboardCopy.chart.resourceMixSubtitle}</p>
      </div>

      <div style={styles.layout}>
        <div style={styles.chartOuter}>
          <div style={styles.chartWrap}>
            <Doughnut data={chartData} options={options} />
            <div style={styles.centerLabel}>
              <strong style={styles.centerValue}>{total.toLocaleString()}</strong>
              <span style={styles.centerText}>{dashboardCopy.chart.resourceMixCenterLabel}</span>
            </div>
          </div>
        </div>

        <div style={styles.legendList}>
          {resourceItems.map((item) => {
            const rawValue = Number(data[item.key]) || 0;
            const percentage = total > 0 ? ((rawValue / total) * 100).toFixed(1) : "0.0";

            return (
              <div key={item.key} style={styles.legendCard}>
                <div style={styles.legendTop}>
                  <span style={{ ...styles.dot, background: item.color }} />
                  <strong>{item.label}</strong>
                </div>
                <div style={styles.legendValue}>
                  {rawValue.toLocaleString()} {item.unit}
                </div>
                <div style={styles.legendPercent}>{percentage}% of current mix</div>
              </div>
            );
          })}

          <div style={styles.highlightCard}>
            <strong>{dashboardCopy.chart.resourceMixLargestPrefix}</strong>
            <div style={styles.highlightValue}>{largestItem.label}</div>
            <div style={styles.highlightText}>
              {Number(data[largestItem.key] || 0).toLocaleString()} {largestItem.unit}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: theme.colors.surface,
    padding: "24px",
    borderRadius: theme.radius.card,
    boxShadow: "0 18px 40px rgba(12, 24, 21, 0.08)",
  },
  header: {
    marginBottom: "16px",
  },
  title: {
    margin: 0,
    color: theme.colors.primaryText,
  },
  subtitle: {
    marginTop: "8px",
    color: theme.colors.secondaryText,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
    alignItems: "center",
  },
  chartOuter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  chartWrap: {
    position: "relative",
    height: "320px",
    width: "100%",
    maxWidth: "320px",
  },
  centerLabel: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    pointerEvents: "none",
  },
  centerValue: {
    fontSize: theme.fontSizes.metricValue,
    color: theme.colors.primaryText,
  },
  centerText: {
    color: theme.colors.secondaryText,
    marginTop: "4px",
  },
  legendList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  legendCard: {
    background: theme.colors.softSurface,
    borderRadius: "14px",
    padding: "12px 14px",
  },
  legendTop: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    display: "inline-block",
  },
  legendValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: theme.colors.primaryText,
    marginTop: "6px",
  },
  legendPercent: {
    color: theme.colors.secondaryText,
    marginTop: "4px",
  },
  highlightCard: {
    background: "linear-gradient(135deg, #eef7f2, #edf4ff)",
    borderRadius: "14px",
    padding: "14px",
  },
  highlightValue: {
    fontSize: "20px",
    fontWeight: "700",
    marginTop: "6px",
    color: theme.colors.primaryText,
  },
  highlightText: {
    color: theme.colors.secondaryText,
    marginTop: "4px",
  },
};

export default ResourceMixChart;
