import React from "react";
import { dashboardCopy } from "../config/dashboardConfig";
import InfoHint from "./InfoHint";

const { theme } = dashboardCopy;

function Column({ title, items, renderItem, emptyText, onOpenDetail }) {
  return (
    <div style={styles.column}>
      <h4 style={styles.columnTitle}>{title}</h4>
      {items && items.length > 0 ? (
        items.map((item, index) => (
          <button
            type="button"
            key={`${title}-${index}`}
            style={styles.itemCard}
            onClick={() => onOpenDetail?.(item)}
          >
            {renderItem(item)}
          </button>
        ))
      ) : (
        <p style={styles.emptyText}>{emptyText}</p>
      )}
    </div>
  );
}

function AIInsightsSection({ insightsData, onOpenDetail }) {
  if (!insightsData) {
    return null;
  }

  return (
    <div style={styles.container} className="premium-card lift-card stagger-in stagger-in-delay-1">
      <div style={styles.header}>
        <div>
          <h3 style={{ margin: 0 }}>
            {dashboardCopy.insights.title}
            <InfoHint
              title="What AI Insights means"
              text="This section turns raw numbers into plain-language anomaly notes, opportunities, and recommended actions so the dashboard is easier to explain."
              width={310}
            />
          </h3>
          {insightsData.peer_context ? (
            <p style={styles.peerText}>
              Peer comparison: {insightsData.peer_context.building} is {insightsData.peer_context.delta_percent}% vs peer average net energy.
            </p>
          ) : null}
        </div>
        <span style={styles.scope}>{dashboardCopy.global.scopeLabel}: {insightsData.scope}</span>
      </div>

      <div style={styles.grid}>
        <Column
          title={dashboardCopy.insights.anomaliesTitle}
          items={insightsData.anomalies}
          emptyText={dashboardCopy.insights.anomaliesEmpty}
          onOpenDetail={(item) =>
            onOpenDetail?.({
              title: `${item.resource} anomaly`,
              category: "AI anomaly",
              summary: item.message,
              points: [
                `Severity: ${item.severity}`,
                `Deviation: ${item.deviation_percent}%`,
                `Impact score: ${item.impact_score}`,
              ],
            })
          }
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
          onOpenDetail={(item) =>
            onOpenDetail?.({
              title: item.title,
              category: "Opportunity",
              summary: item.message,
              points: [
                `Metric: ${item.metric} ${item.unit}`,
                `Impact score: ${item.impact_score}`,
                "Use this opportunity to decide where the next improvement effort should focus.",
              ],
            })
          }
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
          onOpenDetail={(item) =>
            onOpenDetail?.({
              title: item.title,
              category: "Recommendation",
              summary: item.message,
              points: [
                `Priority: ${item.priority}`,
                `Estimated savings: ${item.estimated_savings_kwh} kWh`,
                `Estimated cost effect: Rs ${item.estimated_savings_rs}`,
                `Estimated carbon effect: ${item.estimated_savings_carbon} kg CO2`,
              ],
            })
          }
          renderItem={(item) => (
            <>
              <strong style={styles.label}>
                {item.title} <span style={styles.priority}>{item.priority}</span>
              </strong>
              <p style={styles.message}>{item.message}</p>
              <p style={styles.savings}>
                Estimated impact: {item.estimated_savings_kwh} kWh | Rs {item.estimated_savings_rs} | {item.estimated_savings_carbon} kg CO2
              </p>
            </>
          )}
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: theme.colors.surface,
    padding: "22px",
    borderRadius: theme.radius.card,
    boxShadow: theme.shadows.card,
    marginBottom: "20px",
  },
  peerText: {
    margin: "8px 0 0",
    color: theme.colors.secondaryText,
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
    color: theme.colors.secondaryText,
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
    background: theme.colors.softSurface,
    borderRadius: "18px",
    padding: "18px",
  },
  columnTitle: {
    marginTop: 0,
    marginBottom: "12px",
    color: theme.colors.primaryText,
  },
  itemCard: {
    background: theme.colors.surface,
    borderRadius: "12px",
    padding: "14px",
    marginBottom: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
    border: "none",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
  },
  label: {
    color: theme.colors.primaryText,
  },
  metric: {
    fontSize: "20px",
    fontWeight: "700",
    margin: "6px 0",
    color: theme.colors.accent,
  },
  message: {
    margin: "8px 0 0 0",
    color: theme.colors.secondaryText,
    lineHeight: 1.5,
  },
  priority: {
    textTransform: "uppercase",
    fontSize: "11px",
    color: "#b45309",
    marginLeft: "6px",
  },
  savings: {
    margin: "10px 0 0",
    color: theme.colors.accent,
    fontWeight: "600",
    lineHeight: 1.5,
  },
  emptyText: {
    color: theme.colors.secondaryText,
    margin: 0,
  },
};

export default AIInsightsSection;
