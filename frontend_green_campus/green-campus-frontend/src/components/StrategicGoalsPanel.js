import React, { useEffect, useState } from "react";

import { dashboardCopy } from "../config/dashboardConfig";
import { saveDashboardSettings } from "../services/api";

const goalFields = [
  { key: "green_index_target", label: "Green Index Target", unit: "%" },
  { key: "solar_offset_target_percent", label: "Solar Offset Target", unit: "%" },
  { key: "water_per_student_target_kl", label: "Water / Student Target", unit: "kl" },
  { key: "monthly_energy_cost_target_rs", label: "Monthly Energy Cost Target", unit: "Rs" },
];

function toneForStatus(status) {
  if (status === "on_track") {
    return {
      bar: "#1b7f62",
      badgeBg: "#e8f7f1",
      badgeText: "#176b53",
      track: "#d6eee3",
    };
  }

  return {
    bar: "#d97706",
    badgeBg: "#fff4e5",
    badgeText: "#b45309",
    track: "#f4dfbc",
  };
}

export default function StrategicGoalsPanel({ summaryData, settings, onSaved, onOpenDetail }) {
  const [goals, setGoals] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setGoals(settings?.sustainability_goals || {});
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await saveDashboardSettings({
        sustainability_goals: Object.fromEntries(
          Object.entries(goals || {}).map(([key, value]) => [key, Number(value || 0)])
        ),
      });
      setMessage("Goals saved");
      onSaved?.();
    } catch (error) {
      setMessage(error.message || "Saving failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.card} className="premium-card lift-card stagger-in stagger-in-delay-1">
      <div style={styles.header}>
        <div>
          <span style={styles.kicker}>{dashboardCopy.goals.kicker}</span>
          <h3 style={styles.title}>{dashboardCopy.goals.title}</h3>
          <p style={styles.subtitle}>{dashboardCopy.goals.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() =>
            onOpenDetail?.({
              title: "Strategic Goal Tracking",
              category: "Governance",
              summary:
                "These targets convert the dashboard from monitoring into management. They show what success should look like for the current campus program.",
              points: [
                "Green Index target helps set a simple sustainability score goal.",
                "Solar offset target tells the team how much demand should be covered by solar.",
                "Water per student target normalizes performance by occupancy.",
                "Energy cost target helps align operations with budget expectations.",
              ],
            })
          }
          style={styles.linkButton}
        >
          Explain
        </button>
      </div>

      <div style={styles.progressGrid}>
        {(summaryData?.goal_progress || []).map((goal) => {
          const tone = toneForStatus(goal.status);
          return (
            <button
              key={goal.key}
              type="button"
              style={styles.progressCardButton}
              onClick={() =>
                onOpenDetail?.({
                  title: goal.label,
                  category: "Strategic Goal",
                  summary: `Current ${goal.label.toLowerCase()} is ${goal.current} ${goal.unit}. Target is ${goal.target} ${goal.unit}.`,
                  points: [
                    `Completion is ${goal.completion_percent}% toward the selected target.`,
                    goal.higher_is_better
                      ? "A higher value is better for this goal."
                      : "A lower value is better for this goal.",
                    goal.status === "on_track"
                      ? "This goal is currently on track."
                      : "This goal needs attention in the current scope.",
                  ],
                })
              }
            >
              <div style={styles.progressCardTop}>
                <strong style={styles.goalLabel}>{goal.label}</strong>
                <span
                  style={{
                    ...styles.goalBadge,
                    background: tone.badgeBg,
                    color: tone.badgeText,
                  }}
                >
                  {goal.status === "on_track" ? "On track" : "Watch"}
                </span>
              </div>
              <div style={styles.goalMetricRow}>
                <span style={styles.goalCurrent}>
                  {goal.current} {goal.unit}
                </span>
                <span style={styles.goalTarget}>
                  Target {goal.target} {goal.unit}
                </span>
              </div>
              <div style={{ ...styles.progressTrack, background: tone.track }}>
                <div
                  style={{
                    ...styles.progressBar,
                    width: `${Math.max(8, Math.min(goal.completion_percent, 100))}%`,
                    background: tone.bar,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <div style={styles.formGrid}>
        {goalFields.map((field) => (
          <label key={field.key} style={styles.field}>
            <span style={styles.fieldLabel}>
              {field.label} <span style={styles.unit}>{field.unit}</span>
            </span>
            <input
              type="number"
              step="0.01"
              value={goals?.[field.key] ?? ""}
              onChange={(event) =>
                setGoals((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }))
              }
              style={styles.input}
            />
          </label>
        ))}
      </div>

      <div style={styles.footer}>
        <button type="button" onClick={handleSave} style={styles.saveButton} disabled={saving}>
          {saving ? "Saving..." : "Save Goals"}
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
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "start",
    flexWrap: "wrap",
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
  linkButton: {
    border: "1px solid #d8e5df",
    background: "#f8fbfa",
    color: "#17342d",
    borderRadius: "999px",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: "700",
  },
  progressGrid: {
    display: "grid",
    gap: "12px",
    marginTop: "18px",
  },
  progressCardButton: {
    display: "grid",
    gap: "10px",
    background: "#f8fbfa",
    border: "1px solid #deebe6",
    borderRadius: "18px",
    padding: "14px",
    textAlign: "left",
    cursor: "pointer",
  },
  progressCardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  goalLabel: {
    color: "#17342d",
  },
  goalBadge: {
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  goalMetricRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  goalCurrent: {
    color: "#17342d",
    fontWeight: "700",
  },
  goalTarget: {
    color: "#60756f",
    fontSize: "13px",
  },
  progressTrack: {
    width: "100%",
    height: "10px",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: "999px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "12px",
    marginTop: "18px",
  },
  field: {
    display: "grid",
    gap: "6px",
  },
  fieldLabel: {
    color: "#35514a",
    fontSize: "13px",
    fontWeight: "600",
  },
  unit: {
    color: "#60756f",
    fontWeight: "500",
  },
  input: {
    padding: "11px 12px",
    borderRadius: "12px",
    border: "1px solid #d5e1dc",
    background: "#fbfdfc",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "18px",
    flexWrap: "wrap",
  },
  saveButton: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #1b7f62, #2563eb)",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  },
  message: {
    color: "#1b7f62",
    fontSize: "13px",
    fontWeight: "600",
  },
};
