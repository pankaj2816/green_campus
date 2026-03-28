import React from "react";
import { dashboardCopy } from "../config/dashboardConfig";

function Column({ title, items, renderItem, emptyText }) {
  return (
    <div style={styles.column}>
      <h4 style={styles.columnTitle}>{title}</h4>
      {items && items.length > 0 ? (
        items.map((item, index) => (
          <div key={`${title}-${index}`} style={styles.itemCard}>
            {renderItem(item)}
          </div>
        ))
      ) : (
        <p style={styles.emptyText}>{emptyText}</p>
      )}
    </div>
  );
}

function AIInsightsSection({ insightsData }) {
  if (!insightsData) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={{ margin: 0 }}>{dashboardCopy.insights.title}</h3>
        <span style={styles.scope}>{dashboardCopy.global.scopeLabel}: {insightsData.scope}</span>
      </div>

      <div style={styles.grid}>
        <Column
          title={dashboardCopy.insights.anomaliesTitle}
          items={insightsData.anomalies}
          emptyText={dashboardCopy.insights.anomaliesEmpty}
          renderItem={(item) => (
            <>
              <strong style={styles.label}>{item.resource}</strong>
              <p style={styles.message}>{item.message}</p>
            </>
          )}
        />

        <Column
          title={dashboardCopy.insights.opportunitiesTitle}
          items={insightsData.opportunities}
          emptyText={dashboardCopy.insights.opportunitiesEmpty}
          renderItem={(item) => (
            <>
              <strong style={styles.label}>{item.title}</strong>
              <p style={styles.metric}>
                {item.metric} {item.unit}
              </p>
              <p style={styles.message}>{item.message}</p>
            </>
          )}
        />

        <Column
          title={dashboardCopy.insights.recommendationsTitle}
          items={insightsData.recommendations}
          emptyText={dashboardCopy.insights.recommendationsEmpty}
          renderItem={(item) => (
            <>
              <strong style={styles.label}>
                {item.title} <span style={styles.priority}>{item.priority}</span>
              </strong>
              <p style={styles.message}>{item.message}</p>
            </>
          )}
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
    marginBottom: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "15px",
    flexWrap: "wrap",
  },
  scope: {
    color: "#4a615a",
    background: "#ecf4f1",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  column: {
    background: "#f8fbfa",
    borderRadius: "14px",
    padding: "16px",
  },
  columnTitle: {
    marginTop: 0,
    marginBottom: "12px",
    color: "#16302b",
  },
  itemCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "12px",
    marginBottom: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  },
  label: {
    color: "#173a33",
  },
  metric: {
    fontSize: "20px",
    fontWeight: "700",
    margin: "6px 0",
    color: "#1f5b4d",
  },
  message: {
    margin: "8px 0 0 0",
    color: "#5b6d67",
    lineHeight: 1.5,
  },
  priority: {
    textTransform: "uppercase",
    fontSize: "11px",
    color: "#b45309",
    marginLeft: "6px",
  },
  emptyText: {
    color: "#6b7f78",
    margin: 0,
  },
};

export default AIInsightsSection;
