import React, { useEffect, useMemo, useState } from "react";

import { dashboardCopy } from "../config/dashboardConfig";
import InfoHint from "./InfoHint";
import { saveDashboardSettings } from "../services/api";

const statuses = [
  { value: "suggested", label: "Suggested" },
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

function statusTone(status) {
  if (status === "completed") {
    return { bg: "#e8f7f1", color: "#176b53" };
  }
  if (status === "in_progress") {
    return { bg: "#eaf2ff", color: "#1d4ed8" };
  }
  if (status === "planned") {
    return { bg: "#fff4e5", color: "#b45309" };
  }
  return { bg: "#f0f5f3", color: "#35514a" };
}

export default function ActionTrackerPanel({ recommendations, settings, onSaved, onOpenDetail }) {
  const [tracker, setTracker] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setTracker(settings?.action_tracker || {});
  }, [settings]);

  const items = useMemo(
    () =>
      (recommendations || []).map((item) => ({
        ...item,
        currentStatus: tracker?.[item.action_key] || "suggested",
      })),
    [recommendations, tracker]
  );

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await saveDashboardSettings({ action_tracker: tracker });
      setMessage("Action statuses saved");
      onSaved?.();
    } catch (error) {
      setMessage(error.message || "Saving failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.card} className="premium-card lift-card stagger-in stagger-in-delay-2">
      <div style={styles.header}>
        <div>
          <span style={styles.kicker}>{dashboardCopy.actions.kicker}</span>
          <h3 style={styles.title}>
            {dashboardCopy.actions.title}
            <InfoHint
              title="What Action Board means"
              text="This section helps the team move from recommendation to execution. Use it to mark whether an action is only suggested, already planned, in progress, or completed."
              width={320}
            />
          </h3>
          <p style={styles.subtitle}>{dashboardCopy.actions.subtitle}</p>
        </div>
      </div>

      <div style={styles.legendBox}>
        <div style={styles.legendItem}>
          <strong>Suggested</strong>
          <span>The system is recommending this action but nothing has started yet.</span>
        </div>
        <div style={styles.legendItem}>
          <strong>Planned</strong>
          <span>The team has decided to do it and should assign ownership or timeline next.</span>
        </div>
        <div style={styles.legendItem}>
          <strong>In Progress</strong>
          <span>The action is being implemented, so future charts and comparisons may start improving.</span>
        </div>
        <div style={styles.legendItem}>
          <strong>Completed</strong>
          <span>The action is finished. Later period comparisons should be checked to confirm the expected benefit.</span>
        </div>
      </div>

      <div style={styles.list}>
        {items.length > 0 ? (
          items.map((item) => {
            const tone = statusTone(item.currentStatus);
            return (
              <div key={item.action_key} style={styles.row}>
                <button
                  type="button"
                  style={styles.rowInfo}
                  onClick={() =>
                    onOpenDetail?.({
                      title: item.title,
                      category: "Action Board",
                      summary: item.message,
                      points: [
                        `Priority: ${item.priority}`,
                        `Estimated savings: ${item.estimated_savings_kwh} kWh`,
                        `Estimated cost impact: Rs ${item.estimated_savings_rs}`,
                        `Estimated carbon impact: ${item.estimated_savings_carbon} kg CO2`,
                      ],
                    })
                  }
                >
                  <div style={styles.rowTop}>
                    <strong style={styles.rowTitle}>{item.title}</strong>
                    <span style={{ ...styles.statusPill, background: tone.bg, color: tone.color }}>
                      {statuses.find((status) => status.value === item.currentStatus)?.label}
                    </span>
                  </div>
                  <p style={styles.rowText}>{item.message}</p>
                  <div style={styles.impactText}>
                    Impact {item.impact_score} | {item.estimated_savings_kwh} kWh | Rs {item.estimated_savings_rs}
                  </div>
                  <div style={styles.expectationText}>
                    {item.currentStatus === "completed"
                      ? "Expected outcome: this change should begin reducing future energy, cost, or carbon in later comparisons."
                      : item.currentStatus === "in_progress"
                        ? "Expected outcome: implementation is underway, so watch the next comparison window and alerts."
                        : item.currentStatus === "planned"
                          ? "Expected outcome: assign responsibility and timeline so the idea becomes an operational change."
                          : "Expected outcome: review this suggestion and decide whether it should become a planned action."}
                  </div>
                </button>

                <select
                  value={item.currentStatus}
                  onChange={(event) =>
                    setTracker((current) => ({
                      ...current,
                      [item.action_key]: event.target.value,
                    }))
                  }
                  style={styles.select}
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          })
        ) : (
          <p style={styles.emptyText}>{dashboardCopy.actions.empty}</p>
        )}
      </div>

      <div style={styles.footer}>
        <button type="button" onClick={handleSave} style={styles.saveButton} disabled={saving}>
          {saving ? "Saving..." : "Save Actions"}
        </button>
        {message ? <span style={styles.message}>{message}</span> : null}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 18px 40px rgba(12, 24, 21, 0.08)",
  },
  header: {
    marginBottom: "14px",
  },
  kicker: {
    color: "#1b7f62",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: "700",
  },
  title: {
    margin: "8px 0 6px",
    color: "#17342d",
  },
  subtitle: {
    margin: 0,
    color: "#60756f",
    lineHeight: 1.6,
  },
  list: {
    display: "grid",
    gap: "12px",
  },
  legendBox: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "10px",
    marginBottom: "14px",
  },
  legendItem: {
    background: "#f7fbf9",
    border: "1px solid #deebe6",
    borderRadius: "16px",
    padding: "12px 14px",
    display: "grid",
    gap: "4px",
    color: "#60756f",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 160px",
    gap: "12px",
    alignItems: "stretch",
  },
  rowInfo: {
    border: "1px solid #deebe6",
    borderRadius: "18px",
    background: "#f8fbfa",
    padding: "14px",
    textAlign: "left",
    cursor: "pointer",
  },
  rowTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  rowTitle: {
    color: "#17342d",
  },
  statusPill: {
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
  },
  rowText: {
    margin: "8px 0 0",
    color: "#60756f",
    lineHeight: 1.55,
  },
  impactText: {
    marginTop: "10px",
    color: "#1b7f62",
    fontSize: "13px",
    fontWeight: "600",
  },
  expectationText: {
    marginTop: "10px",
    color: "#35514a",
    fontSize: "12px",
    lineHeight: 1.5,
  },
  select: {
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1px solid #d5e1dc",
    background: "#ffffff",
    color: "#17342d",
    fontWeight: "600",
    alignSelf: "start",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "16px",
    flexWrap: "wrap",
  },
  saveButton: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "none",
    background: "#17342d",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  },
  message: {
    color: "#1b7f62",
    fontSize: "13px",
    fontWeight: "600",
  },
  emptyText: {
    margin: 0,
    color: "#60756f",
  },
};
