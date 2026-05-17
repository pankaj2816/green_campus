import React from "react";
import { Bar } from "react-chartjs-2";
import { dashboardCopy } from "../config/dashboardConfig";

function ResourceOverview({ data }) {
  if (!data) return null;

  const chartData = {
    labels: dashboardCopy.chart.resourceOverviewLabels,
    datasets: [
      {
        label: "Campus Total",
        data: [data.energy, data.water, data.waste, data.solar],
        backgroundColor: ["#f59e0b", "#0284c7", "#14b8a6", "#84cc16"],
        borderRadius: 14,
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
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: dashboardCopy.chart.resourceOverviewXAxis,
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: dashboardCopy.chart.resourceOverviewYAxis,
        },
      },
    },
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{dashboardCopy.chart.resourceOverviewTitle}</h3>
      <p style={styles.subtitle}>{dashboardCopy.chart.resourceOverviewSubtitle}</p>
      <div style={styles.chartWrap}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "24px",
    boxShadow: "0 18px 40px rgba(12, 24, 21, 0.08)",
  },
  title: {
    margin: 0,
    color: "#18332d",
  },
  subtitle: {
    color: "#60756f",
    marginTop: "8px",
  },
  chartWrap: {
    height: "360px",
    marginTop: "6px",
  },
};

export default ResourceOverview;
