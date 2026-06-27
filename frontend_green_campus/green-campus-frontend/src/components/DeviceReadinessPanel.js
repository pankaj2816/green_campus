import React, { useEffect, useState } from "react";
import { saveDeviceReadiness } from "../services/api";
import InfoHint from "./InfoHint";

const statusOptions = [
  { value: "healthy", label: "Healthy" },
  { value: "warning", label: "Warning" },
  { value: "manual", label: "Manual" },
  { value: "planned", label: "Planned" },
  { value: "offline", label: "Offline" },
];

const sourceOptions = [
  { value: "smart_meter", label: "Smart Meter" },
  { value: "manual_log", label: "Manual Log" },
  { value: "inverter_api", label: "Inverter API" },
  { value: "bms_feed", label: "BMS Feed" },
  { value: "gateway", label: "Gateway" },
];

function statusTone(status) {
  switch (status) {
    case "healthy":
      return { bg: "#e8f7f1", text: "#166534" };
    case "warning":
      return { bg: "#fff6e9", text: "#b45309" };
    case "offline":
      return { bg: "#fdeef1", text: "#a61f2d" };
    case "manual":
      return { bg: "#edf6ff", text: "#145ca8" };
    default:
      return { bg: "#eff4f2", text: "#35514a" };
  }
}

function syncLabel(syncState) {
  if (syncState === "ok") return "Sync healthy";
  if (syncState === "stale") return "Sync stale";
  if (syncState === "missing") return "Missing sync";
  if (syncState === "planned") return "Planned source";
  return "Unknown";
}

function toDatetimeLocal(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return adjusted.toISOString().slice(0, 16);
}

function fromDatetimeLocal(value) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function blankDevice() {
  return {
    id: null,
    name: "",
    category: "Energy Meter",
    building: "",
    source_type: "smart_meter",
    status: "planned",
    expected_frequency_minutes: 1440,
    last_sync_at: null,
    notes: "",
    is_critical: false,
    readiness_score: 40,
    sync_state: "planned",
  };
}

export default function DeviceReadinessPanel({ deviceReadiness, onSaved }) {
  const [devices, setDevices] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setDevices(deviceReadiness?.devices || []);
  }, [deviceReadiness]);

  const summary = deviceReadiness?.summary || {};
  const statusBreakdown = summary.status_breakdown || {};
  const healthyRatio = (() => {
    const total = summary.total_devices || 0;
    if (!total) return 0;
    return Math.round(((summary.healthy_devices || 0) / total) * 100);
  })();

  const handleDeviceChange = (index, key, value) => {
    setDevices((current) =>
      current.map((device, deviceIndex) =>
        deviceIndex === index
          ? {
              ...device,
              [key]: value,
            }
          : device
      )
    );
  };

  const handleAddDevice = () => {
    setDevices((current) => [...current, blankDevice()]);
  };

  const handleRemoveDevice = (index) => {
    setDevices((current) => current.filter((_, deviceIndex) => deviceIndex !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        devices: devices.map((device) => ({
          id: device.id,
          name: device.name.trim(),
          category: device.category.trim(),
          building: device.building.trim(),
          source_type: device.source_type,
          status: device.status,
          expected_frequency_minutes: Number(device.expected_frequency_minutes || 1440),
          last_sync_at: fromDatetimeLocal(device.last_sync_at),
          notes: device.notes || "",
          is_critical: Boolean(device.is_critical),
        })),
      };
      const result = await saveDeviceReadiness(payload);
      setDevices(result.devices || []);
      setMessage("Device readiness saved");
      onSaved?.(result);
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
          <span style={styles.kicker}>Operations Readiness</span>
          <h3 style={styles.title}>
            Device Readiness Layer
            <InfoHint
              title="What device readiness means"
              text="This section tracks which meters, logs, and digital sources are ready for live monitoring. It helps you plan what can become real-time first and what still depends on manual reporting."
              width={330}
              placement="top"
            />
          </h3>
          <p style={styles.subtitle}>
            Track the campus devices and data sources that can support live sustainability monitoring.
          </p>
        </div>
        <button type="button" style={styles.addButton} onClick={handleAddDevice}>
          Add Device
        </button>
      </div>

      <div style={styles.summaryGrid}>
        <SummaryStat label="Readiness Score" value={`${summary.readiness_score ?? 0}%`} />
        <SummaryStat label="Healthy Devices" value={`${summary.healthy_devices ?? 0}/${summary.total_devices ?? 0}`} />
        <SummaryStat label="Critical Devices" value={summary.critical_devices ?? 0} />
        <SummaryStat label="Healthy Ratio" value={`${healthyRatio}%`} />
      </div>

      <div style={styles.breakdownRow}>
        {Object.entries(statusBreakdown).map(([status, count]) => {
          const tone = statusTone(status);
          return (
            <span key={status} style={{ ...styles.breakdownChip, background: tone.bg, color: tone.text }}>
              {status.charAt(0).toUpperCase() + status.slice(1)}: {count}
            </span>
          );
        })}
      </div>

      <div style={styles.deviceGrid}>
        {devices.map((device, index) => {
          const tone = statusTone(device.status);
          return (
            <div key={`${device.id || "new"}-${index}`} style={styles.deviceCard}>
              <div style={styles.deviceTop}>
                <div>
                  <strong style={styles.deviceName}>{device.name || "New device"}</strong>
                  <div style={styles.deviceMetaLine}>
                    <span style={{ ...styles.statusBadge, background: tone.bg, color: tone.text }}>
                      {statusOptions.find((item) => item.value === device.status)?.label || device.status}
                    </span>
                    <span style={styles.syncBadge}>{syncLabel(device.sync_state)}</span>
                  </div>
                </div>
                <button type="button" onClick={() => handleRemoveDevice(index)} style={styles.removeButton}>
                  Remove
                </button>
              </div>

              <div style={styles.formGrid}>
                <label style={styles.field}>
                  <span style={styles.fieldLabel}>Device name</span>
                  <input
                    value={device.name || ""}
                    onChange={(event) => handleDeviceChange(index, "name", event.target.value)}
                    style={styles.input}
                  />
                </label>
                <label style={styles.field}>
                  <span style={styles.fieldLabel}>Category</span>
                  <input
                    value={device.category || ""}
                    onChange={(event) => handleDeviceChange(index, "category", event.target.value)}
                    style={styles.input}
                  />
                </label>
                <label style={styles.field}>
                  <span style={styles.fieldLabel}>Building / scope</span>
                  <input
                    value={device.building || ""}
                    onChange={(event) => handleDeviceChange(index, "building", event.target.value)}
                    style={styles.input}
                  />
                </label>
                <label style={styles.field}>
                  <span style={styles.fieldLabel}>Source type</span>
                  <select
                    value={device.source_type || "smart_meter"}
                    onChange={(event) => handleDeviceChange(index, "source_type", event.target.value)}
                    style={styles.input}
                  >
                    {sourceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={styles.field}>
                  <span style={styles.fieldLabel}>Status</span>
                  <select
                    value={device.status || "planned"}
                    onChange={(event) => handleDeviceChange(index, "status", event.target.value)}
                    style={styles.input}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={styles.field}>
                  <span style={styles.fieldLabel}>Expected sync (minutes)</span>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={device.expected_frequency_minutes ?? 1440}
                    onChange={(event) =>
                      handleDeviceChange(index, "expected_frequency_minutes", event.target.value)
                    }
                    style={styles.input}
                  />
                </label>
                <label style={styles.field}>
                  <span style={styles.fieldLabel}>Last sync time</span>
                  <input
                    type="datetime-local"
                    value={toDatetimeLocal(device.last_sync_at)}
                    onChange={(event) => handleDeviceChange(index, "last_sync_at", event.target.value)}
                    style={styles.input}
                  />
                </label>
                <label style={styles.checkboxField}>
                  <input
                    type="checkbox"
                    checked={Boolean(device.is_critical)}
                    onChange={(event) => handleDeviceChange(index, "is_critical", event.target.checked)}
                  />
                  <span>Critical for campus live view</span>
                </label>
              </div>

              <label style={styles.field}>
                <span style={styles.fieldLabel}>Notes</span>
                <textarea
                  value={device.notes || ""}
                  onChange={(event) => handleDeviceChange(index, "notes", event.target.value)}
                  style={styles.textarea}
                />
              </label>

              <div style={styles.deviceFooter}>
                <span style={styles.scoreText}>Readiness score: {device.readiness_score ?? 0}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.footer}>
        <button type="button" onClick={handleSave} style={styles.saveButton} disabled={saving}>
          {saving ? "Saving..." : "Save Device Registry"}
        </button>
        {message ? <span style={styles.message}>{message}</span> : null}
      </div>
    </div>
  );
}

function SummaryStat({ label, value }) {
  return (
    <div style={styles.summaryCard}>
      <span style={styles.summaryLabel}>{label}</span>
      <strong style={styles.summaryValue}>{value}</strong>
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
    gap: "14px",
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
  addButton: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #d5e1dc",
    background: "#f8fbfa",
    color: "#17342d",
    fontWeight: "700",
    cursor: "pointer",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
    marginTop: "18px",
  },
  summaryCard: {
    display: "grid",
    gap: "4px",
    padding: "14px",
    borderRadius: "16px",
    background: "#f7fbf9",
    border: "1px solid #deebe6",
  },
  summaryLabel: {
    color: "#60756f",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: "700",
  },
  summaryValue: {
    color: "#17342d",
    fontSize: "20px",
  },
  breakdownRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "14px",
  },
  breakdownChip: {
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
  },
  deviceGrid: {
    display: "grid",
    gap: "14px",
    marginTop: "16px",
  },
  deviceCard: {
    background: "#f8fbfa",
    border: "1px solid #deebe6",
    borderRadius: "20px",
    padding: "16px 16px 14px",
    display: "grid",
    gap: "12px",
  },
  deviceTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "start",
    flexWrap: "wrap",
  },
  deviceName: {
    color: "#17342d",
    fontSize: "17px",
  },
  deviceMetaLine: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "8px",
  },
  statusBadge: {
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
  },
  syncBadge: {
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
    background: "#edf5ff",
    color: "#145ca8",
  },
  removeButton: {
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid #f0d1d6",
    background: "#fff5f6",
    color: "#a61f2d",
    fontWeight: "700",
    cursor: "pointer",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "12px",
  },
  field: {
    display: "grid",
    gap: "6px",
    minWidth: 0,
  },
  fieldLabel: {
    color: "#35514a",
    fontSize: "13px",
    fontWeight: "600",
  },
  input: {
    padding: "11px 12px",
    borderRadius: "12px",
    border: "1px solid #d5e1dc",
    background: "#ffffff",
    width: "100%",
    boxSizing: "border-box",
  },
  checkboxField: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#35514a",
    fontSize: "13px",
    fontWeight: "600",
    flexWrap: "wrap",
    gridColumn: "1 / -1",
    padding: "4px 0 0",
  },
  textarea: {
    minHeight: "72px",
    padding: "11px 12px",
    borderRadius: "12px",
    border: "1px solid #d5e1dc",
    background: "#ffffff",
    resize: "vertical",
    width: "100%",
    boxSizing: "border-box",
  },
  deviceFooter: {
    display: "flex",
    justifyContent: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  scoreText: {
    color: "#1b7f62",
    fontWeight: "700",
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
