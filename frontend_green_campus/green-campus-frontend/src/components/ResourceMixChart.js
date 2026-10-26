import React from "react";
import { Doughnut } from "react-chartjs-2";

import { dashboardCopy } from "../config/dashboardConfig";

const { theme } = dashboardCopy;

const electricityColors = {
  solar: "#84cc16",
  grid: "#f59e0b",
};

function ResourceMixChart({ data, darkMode = false }) {
  if (!data) {
    return null;
  }

  const titleColor = darkMode ? "#f4fbf8" : theme.colors.primaryText;
  const subtitleColor = darkMode ? "rgba(235,245,240,0.76)" : theme.colors.secondaryText;
  const cardBackground = darkMode
    ? "linear-gradient(180deg, rgba(20,38,34,0.98), rgba(18,32,29,0.96))"
    : "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,251,249,0.94))";
  const chipBackground = darkMode ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.74)";
  const chipBorder = darkMode ? "rgba(157, 191, 179, 0.14)" : "rgba(160, 190, 180, 0.24)";
  const legendCardBackground = darkMode
    ? "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))"
    : "linear-gradient(180deg, #ffffff 0%, #f7fbf9 100%)";
  const legendTextColor = darkMode ? "#f4fbf8" : theme.colors.primaryText;
  const mutedTextColor = darkMode ? "rgba(235,245,240,0.72)" : theme.colors.secondaryText;
  const highlightBackground = darkMode
    ? "linear-gradient(135deg, rgba(29,138,103,0.24), rgba(37,99,235,0.22))"
    : "linear-gradient(135deg, #eef7f2, #edf4ff)";

  const grossEnergy = Number(data.energy || 0);
  const solar = Number(data.solar || 0);
  const solarUsed = Math.min(solar, grossEnergy);
  const gridDraw = Math.max(grossEnergy - solar, 0);
  const exportKwh = Math.max(solar - grossEnergy, 0);
  const water = Number(data.water || 0);
  const waste = Number(data.waste || 0);
  const resourceItems = [
    { key: "solar", label: "Solar used", rawValue: solarUsed, unit: "kWh", color: electricityColors.solar },
    { key: "grid", label: "Grid draw", rawValue: gridDraw, unit: "kWh", color: electricityColors.grid },
  ];
  const total = solarUsed + gridDraw;
  const solarShare = total > 0 ? (solarUsed / total) * 100 : 0;
  const largestItem = [...resourceItems].sort((a, b) => b.rawValue - a.rawValue)[0];
  const rankedItems = resourceItems
    .map((item) => ({
      ...item,
      percentage: total > 0 ? (item.rawValue / total) * 100 : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage);
  const wasteTypes = Object.entries(data.waste_by_type || {});

  const chartData = {
    labels: resourceItems.map((item) => item.label),
    datasets: [
      {
        data: resourceItems.map((item) => item.rawValue),
        backgroundColor: resourceItems.map((item) => item.color),
        borderColor: darkMode ? "#18332d" : "#f8fbfa",
        borderWidth: 4,
        hoverOffset: 10,
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
      tooltip: {
        backgroundColor: darkMode ? "rgba(12, 24, 21, 0.94)" : "rgba(255,255,255,0.96)",
        titleColor: darkMode ? "#f4fbf8" : "#17342d",
        bodyColor: darkMode ? "#e8f5ef" : "#35514a",
        borderColor: darkMode ? "rgba(148, 182, 170, 0.24)" : "rgba(148, 182, 170, 0.2)",
        borderWidth: 1,
        padding: 12,
      },
    },
  };

  return (
    <div style={{ ...styles.card, background: cardBackground }}>
      <div style={styles.header}>
        <div style={styles.headingRow}>
          <div>
            <div style={{ ...styles.microLabel, color: subtitleColor }}>Mix Snapshot</div>
            <h3 style={{ ...styles.title, color: titleColor }}>{dashboardCopy.chart.resourceMixTitle}</h3>
          </div>
          <div style={{ ...styles.statChip, background: chipBackground, border: `1px solid ${chipBorder}` }}>
            Current distribution
          </div>
        </div>
        <p style={{ ...styles.subtitle, color: subtitleColor }}>{dashboardCopy.chart.resourceMixSubtitle}</p>
      </div>

      <div style={styles.layout} className="resource-mix-layout">
        <div style={styles.chartOuter}>
          <div style={styles.chartWrap}>
            <Doughnut data={chartData} options={options} />
            <div style={styles.centerLabel}>
              <strong style={styles.centerValue}>{solarShare.toFixed(0)}%</strong>
              <span style={styles.centerText}>{dashboardCopy.chart.resourceMixCenterLabel}</span>
            </div>
          </div>
        </div>

        <div style={styles.legendList}>
          {rankedItems.map((item) => {
            const percentage = item.percentage.toFixed(1);

            return (
              <div
                key={item.key}
                style={{ ...styles.legendCard, background: legendCardBackground }}
              >
                <div style={styles.legendTop}>
                  <span style={{ ...styles.dot, background: item.color }} />
                  <strong style={{ color: legendTextColor }}>{item.label}</strong>
                </div>
                <div style={{ ...styles.legendValue, color: legendTextColor }}>
                  {item.rawValue.toLocaleString()} {item.unit}
                </div>
                <div style={{ ...styles.legendPercent, color: mutedTextColor }}>{percentage}% of electricity</div>
                <div style={styles.shareRail}>
                  <span
                    style={{
                      ...styles.shareFill,
                      width: `${item.percentage}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}

          <div style={{ ...styles.highlightCard, background: highlightBackground }}>
            <strong>{dashboardCopy.chart.resourceMixLargestPrefix}</strong>
            <div style={{ ...styles.highlightValue, color: legendTextColor }}>{largestItem.label}</div>
            <div style={{ ...styles.highlightText, color: mutedTextColor }}>
              {largestItem.rawValue.toLocaleString()} {largestItem.unit}
            </div>
          </div>
        </div>
      </div>
      <div style={{ ...styles.highlightCard, background: highlightBackground, marginTop: "16px" }}>
        <strong>Other resources, kept in their own units</strong>
        <div style={{ ...styles.highlightText, color: mutedTextColor }}>
          Water {water.toLocaleString()} kl · Waste {waste.toLocaleString()} kg
          {exportKwh > 0 ? ` · Solar export ${exportKwh.toLocaleString()} kWh` : ""}
        </div>
        {wasteTypes.length ? (
          <div style={{ ...styles.highlightText, color: mutedTextColor }}>
            Waste types: {wasteTypes.map(([label, quantity]) => `${label} ${Number(quantity).toLocaleString()} kg`).join(" · ")}
          </div>
        ) : null}
      </div>
    </div>
  );
}

const styles = {
  card: {
    padding: "24px",
    borderRadius: theme.radius.card,
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
  header: {
    marginBottom: "16px",
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
    color: "#35514a",
    fontSize: "12px",
    fontWeight: "700",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(240px, 0.95fr) minmax(220px, 1.05fr)",
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
    letterSpacing: "-0.04em",
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
    background: "linear-gradient(180deg, #ffffff 0%, #f7fbf9 100%)",
    borderRadius: "14px",
    padding: "12px 14px",
    border: "1px solid rgba(160, 190, 180, 0.18)",
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
    wordBreak: "break-word",
  },
  legendPercent: {
    color: theme.colors.secondaryText,
    marginTop: "4px",
  },
  shareRail: {
    marginTop: "10px",
    width: "100%",
    height: "7px",
    borderRadius: "999px",
    background: "rgba(159, 188, 178, 0.18)",
    overflow: "hidden",
  },
  shareFill: {
    display: "block",
    height: "100%",
    borderRadius: "999px",
  },
  highlightCard: {
    background: "linear-gradient(135deg, #eef7f2, #edf4ff)",
    borderRadius: "14px",
    padding: "14px",
    border: "1px solid rgba(160, 190, 180, 0.18)",
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
