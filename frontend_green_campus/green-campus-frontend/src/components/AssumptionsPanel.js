import React, { useEffect, useMemo, useState } from "react";

import { dashboardCopy } from "../config/dashboardConfig";
import { saveDashboardSettings } from "../services/api";

const { theme } = dashboardCopy;

const editableParameterKeys = [
  "emission_factor_kg_per_kwh",
  "energy_cost_per_kwh",
  "energy_benchmark",
  "water_benchmark",
  "waste_benchmark",
  "anomaly_threshold_percent",
  "high_anomaly_threshold_percent",
];

function formatValue(key, value) {
  if (key === "weights" && typeof value === "object") {
    return Object.entries(value)
      .map(([itemKey, itemValue]) => `${itemKey}: ${itemValue}`)
      .join(" | ");
  }

  if (key === "academic_occupancy_factors" && typeof value === "object") {
    return "Month-by-month campus activity values";
  }

  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function safeNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export default function AssumptionsPanel({ assumptions, settings, onSaved }) {
  const [metricOverrides, setMetricOverrides] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMetricOverrides(settings?.metric_overrides || {});
  }, [settings]);

  const constants = useMemo(() => assumptions?.constants || {}, [assumptions]);
  const glossary = assumptions?.glossary || [];
  const formulas = assumptions?.formulas || [];

  const weights = useMemo(
    () => ({
      energy: metricOverrides?.weights?.energy ?? constants?.weights?.energy ?? 0,
      water: metricOverrides?.weights?.water ?? constants?.weights?.water ?? 0,
      waste: metricOverrides?.weights?.waste ?? constants?.weights?.waste ?? 0,
    }),
    [metricOverrides, constants]
  );

  if (!assumptions) {
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const payload = {
        metric_overrides: {
          ...metricOverrides,
          weights: {
            energy: safeNumber(weights.energy),
            water: safeNumber(weights.water),
            waste: safeNumber(weights.waste),
          },
        },
      };
      await saveDashboardSettings(payload);
      setMessage("Parameters saved");
      onSaved?.();
    } catch (error) {
      setMessage(error.message || "Saving failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container} className="premium-card lift-card stagger-in stagger-in-delay-2">
      <div style={styles.header}>
        <h3 style={{ margin: 0 }}>{dashboardCopy.assumptions.title}</h3>
        <p style={styles.subtext}>{dashboardCopy.assumptions.subtitle}</p>
      </div>

      <div style={styles.grid}>
        <div style={styles.panel}>
          <h4>{dashboardCopy.assumptions.settingsTitle}</h4>
          <p style={styles.panelHint}>
            You can now change the most important live calculation parameters here. These values affect dashboard outputs like carbon, estimated cost, Green Index, and anomaly sensitivity.
          </p>
          <div style={styles.editGrid}>
            {editableParameterKeys.map((key) => {
              const meta = dashboardCopy.assumptionsLabels[key] || {
                label: key,
                description: "Setting used by the dashboard.",
              };
              return (
                <label key={key} style={styles.editField} title={meta.description}>
                  <span style={styles.term}>{meta.label}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={metricOverrides?.[key] ?? constants?.[key] ?? ""}
                    onChange={(event) =>
                      setMetricOverrides((current) => ({
                        ...current,
                        [key]: safeNumber(event.target.value),
                      }))
                    }
                    style={styles.input}
                  />
                  <span style={styles.fieldHelp}>{meta.description}</span>
                </label>
              );
            })}
          </div>

          <div style={styles.weightsBox}>
            <strong style={styles.weightsTitle}>Green Index weights</strong>
            <p style={styles.weightsHint}>
              These control how much energy, water, and waste affect the Green Index. Higher weight means bigger influence.
            </p>
            <div style={styles.weightGrid}>
              {["energy", "water", "waste"].map((key) => (
                <label key={key} style={styles.editField}>
                  <span style={styles.term}>{key[0].toUpperCase() + key.slice(1)} weight</span>
                  <input
                    type="number"
                    step="0.01"
                    value={weights[key]}
                    onChange={(event) =>
                      setMetricOverrides((current) => ({
                        ...current,
                        weights: {
                          ...weights,
                          [key]: safeNumber(event.target.value),
                        },
                      }))
                    }
                    style={styles.input}
                  />
                </label>
              ))}
            </div>
          </div>

          <div style={styles.footer}>
            <button type="button" onClick={handleSave} style={styles.saveButton} disabled={saving}>
              {saving ? "Saving..." : "Save Parameters"}
            </button>
            {message ? <span style={styles.message}>{message}</span> : null}
          </div>

          <div style={styles.readonlyList}>
            {Object.entries(constants)
              .filter(([key]) => !editableParameterKeys.includes(key) && key !== "weights")
              .map(([key, value]) => {
                const meta = dashboardCopy.assumptionsLabels[key] || {
                  label: key,
                  description: "Setting used by the dashboard.",
                };

                return (
                  <div key={key} style={styles.settingCard}>
                    <div style={styles.settingTop}>
                      <span style={styles.term}>{meta.label}</span>
                      <span style={styles.value}>{formatValue(key, value)}</span>
                    </div>
                    <p style={styles.description}>{meta.description}</p>
                  </div>
                );
              })}
          </div>
        </div>

        <div style={styles.panel}>
          <h4>{dashboardCopy.assumptions.formulasTitle}</h4>
          <div style={styles.list}>
            {formulas.map((item) => (
              <div key={item.term} style={styles.formulaCard}>
                <strong>{item.term}</strong>
                <code style={styles.formulaCode}>{item.formula}</code>
                <p style={styles.glossaryText}>{item.meaning}</p>
              </div>
            ))}
          </div>

          <h4 style={{ marginTop: "18px" }}>{dashboardCopy.assumptions.glossaryTitle}</h4>
          <div style={styles.list}>
            {glossary.map((item) => (
              <div key={item.term} style={styles.glossaryCard}>
                <strong>{item.term}</strong>
                <p style={styles.glossaryText}>{item.meaning}</p>
              </div>
            ))}
          </div>
        </div>
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
  header: {
    marginBottom: "16px",
  },
  subtext: {
    color: theme.colors.secondaryText,
    marginTop: "8px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "16px",
  },
  panel: {
    background: theme.colors.softSurface,
    borderRadius: "18px",
    padding: "18px",
  },
  panelHint: {
    color: theme.colors.secondaryText,
    marginTop: "8px",
    lineHeight: 1.55,
  },
  editGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    marginTop: "16px",
  },
  editField: {
    display: "grid",
    gap: "6px",
    background: theme.colors.surface,
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid #e0ebe6",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid #d5e1dc",
    background: "#fbfdfc",
  },
  fieldHelp: {
    color: theme.colors.secondaryText,
    fontSize: "12px",
    lineHeight: 1.5,
  },
  weightsBox: {
    marginTop: "16px",
    background: "#ffffff",
    padding: "16px",
    borderRadius: "16px",
    border: "1px solid #e0ebe6",
  },
  weightsTitle: {
    color: theme.colors.primaryText,
  },
  weightsHint: {
    color: theme.colors.secondaryText,
    marginTop: "8px",
    lineHeight: 1.5,
  },
  weightGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "10px",
    marginTop: "12px",
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
  readonlyList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "16px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  settingCard: {
    background: theme.colors.surface,
    borderRadius: "10px",
    padding: "14px",
  },
  settingTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
  },
  term: {
    color: theme.colors.primaryText,
    fontWeight: "600",
  },
  value: {
    color: theme.colors.accent,
    textAlign: "right",
    fontWeight: "700",
  },
  description: {
    marginBottom: 0,
    color: theme.colors.secondaryText,
    lineHeight: 1.5,
  },
  formulaCard: {
    background: theme.colors.surface,
    borderRadius: "12px",
    padding: "14px",
  },
  formulaCode: {
    display: "inline-block",
    marginTop: "8px",
    background: "#eef5f2",
    padding: "6px 10px",
    borderRadius: "8px",
    color: "#17342d",
  },
  glossaryCard: {
    background: theme.colors.surface,
    borderRadius: "10px",
    padding: "14px",
  },
  glossaryText: {
    marginBottom: 0,
    color: theme.colors.secondaryText,
    lineHeight: 1.5,
  },
};
