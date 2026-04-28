import React, { useEffect, useState } from "react";

import { dashboardCopy } from "../config/dashboardConfig";
import { saveDashboardSettings } from "../services/api";

const monthLabels = [
  { key: 1, label: "Jan" },
  { key: 2, label: "Feb" },
  { key: 3, label: "Mar" },
  { key: 4, label: "Apr" },
  { key: 5, label: "May" },
  { key: 6, label: "Jun" },
  { key: 7, label: "Jul" },
  { key: 8, label: "Aug" },
  { key: 9, label: "Sep" },
  { key: 10, label: "Oct" },
  { key: 11, label: "Nov" },
  { key: 12, label: "Dec" },
];

export default function OccupancySettingsPanel({ settings, onSaved }) {
  const [occupancy, setOccupancy] = useState({});
  const [context, setContext] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setOccupancy(settings?.academic_occupancy_factors || {});
    setContext(settings?.campus_context || {});
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const payload = await saveDashboardSettings({
        academic_occupancy_factors: occupancy,
        campus_context: {
          ...context,
          student_population: Number(context.student_population || 0),
          hostel_population: Number(context.hostel_population || 0),
          built_up_area_sqm: Number(context.built_up_area_sqm || 0),
          monthly_energy_budget_rs: Number(context.monthly_energy_budget_rs || 0),
        },
      });
      setMessage(dashboardCopy.occupancy.savedLabel);
      onSaved?.(payload);
    } catch (error) {
      setMessage(error.message || "Saving failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.card} className="premium-card lift-card stagger-in">
      <h3 style={styles.title}>{dashboardCopy.occupancy.title}</h3>
      <p style={styles.subtitle}>{dashboardCopy.occupancy.subtitle}</p>

      <div style={styles.monthGrid}>
        {monthLabels.map((month) => (
          <label key={month.key} style={styles.monthField}>
            <span style={styles.monthLabel}>{month.label}</span>
            <input
              type="number"
              min="0"
              max="1.2"
              step="0.01"
              value={occupancy?.[month.key] ?? ""}
              onChange={(event) =>
                setOccupancy((current) => ({
                  ...current,
                  [month.key]: Number(event.target.value),
                }))
              }
              style={styles.input}
            />
          </label>
        ))}
      </div>

      <div style={styles.contextGrid}>
        {Object.entries(dashboardCopy.occupancy.context).map(([key, label]) => (
          <label key={key} style={styles.contextField}>
            <span style={styles.contextLabel}>{label}</span>
            <input
              type="number"
              value={context?.[key] ?? ""}
              onChange={(event) =>
                setContext((current) => ({
                  ...current,
                  [key]: event.target.value,
                }))
              }
              style={styles.input}
            />
          </label>
        ))}
      </div>

      <div style={styles.footer}>
        <button onClick={handleSave} style={styles.saveButton} disabled={saving}>
          {saving ? dashboardCopy.occupancy.savingLabel : dashboardCopy.occupancy.saveLabel}
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
    padding: "24px",
    boxShadow: "0 18px 40px rgba(12, 24, 21, 0.08)",
    marginTop: "20px",
  },
  title: {
    margin: 0,
    color: "#17342d",
  },
  subtitle: {
    marginTop: "8px",
    color: "#60756f",
    lineHeight: 1.6,
  },
  monthGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(92px, 1fr))",
    gap: "10px",
    marginTop: "18px",
  },
  monthField: {
    display: "grid",
    gap: "6px",
  },
  monthLabel: {
    color: "#35514a",
    fontSize: "13px",
    fontWeight: "600",
  },
  contextGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    marginTop: "18px",
  },
  contextField: {
    display: "grid",
    gap: "6px",
  },
  contextLabel: {
    color: "#35514a",
    fontSize: "13px",
    fontWeight: "600",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid #d5e1dc",
    background: "#fbfdfc",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "18px",
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
