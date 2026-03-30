import React, { useState } from "react";

import {
  exportCampusDataset,
  resetCampusDataset,
  uploadCampusDataset,
} from "../services/api";
import { dashboardCopy } from "../config/dashboardConfig";

function DataUploadPanel({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert(dashboardCopy.dataControls.selectFileAlert);
      return;
    }

    setLoading(true);

    try {
      const data = await uploadCampusDataset(file);
      alert(data.message || dashboardCopy.dataControls.uploadSuccess);
      onUploadSuccess();
    } catch (error) {
      console.error(error);
      alert(error.message || dashboardCopy.dataControls.uploadFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      const data = await exportCampusDataset();
      alert(data.message || dashboardCopy.dataControls.exportSuccess);
    } catch (error) {
      console.error(error);
      alert(error.message || dashboardCopy.dataControls.exportFailed);
    } finally {
      setExporting(false);
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm(dashboardCopy.dataControls.resetConfirm);

    if (!confirmed) {
      return;
    }

    setResetting(true);

    try {
      const data = await resetCampusDataset();
      alert(data.message || "Campus data reset successfully");
      onUploadSuccess();
    } catch (error) {
      console.error(error);
      alert(error.message || dashboardCopy.dataControls.resetFailed);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div style={styles.container} className="premium-card">
      <div style={styles.labelBlock}>
        <strong style={styles.title}>{dashboardCopy.dataControls.title}</strong>
        <span style={styles.caption}>{dashboardCopy.dataControls.subtitle}</span>
      </div>

      <label style={styles.filePicker}>
        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => setFile(e.target.files[0])}
          style={styles.hiddenInput}
        />
        <span style={styles.filePickerLabel}>{dashboardCopy.dataControls.importLabel}</span>
        <span style={styles.filePickerHint}>
          {file
            ? `${dashboardCopy.dataControls.selectedFilePrefix}: ${file.name}`
            : dashboardCopy.dataControls.subtitle}
        </span>
      </label>

      <div style={styles.actions}>
        <button onClick={handleUpload} style={styles.primaryButton} disabled={loading}>
          {loading
            ? dashboardCopy.dataControls.importingLabel
            : dashboardCopy.dataControls.importLabel}
        </button>

        <button onClick={handleExport} style={styles.tertiaryButton} disabled={exporting}>
          {exporting
            ? dashboardCopy.dataControls.exportingLabel
            : dashboardCopy.dataControls.exportLabel}
        </button>

        <button onClick={handleReset} style={styles.secondaryButton} disabled={resetting}>
          {resetting
            ? dashboardCopy.dataControls.resettingLabel
            : dashboardCopy.dataControls.resetLabel}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "grid",
    gap: "14px",
    background: "rgba(255,255,255,0.92)",
    padding: "16px",
    borderRadius: "20px",
    boxShadow: "0 10px 28px rgba(15, 32, 28, 0.08)",
    width: "100%",
  },
  labelBlock: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    color: "#17342d",
    fontSize: "15px",
  },
  caption: {
    color: "#678079",
    fontSize: "12px",
  },
  filePicker: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "14px 16px",
    borderRadius: "16px",
    background: "linear-gradient(180deg, #f7fbf9 0%, #eff7f3 100%)",
    border: "1px dashed #b7d0c8",
    cursor: "pointer",
  },
  hiddenInput: {
    display: "none",
  },
  filePickerLabel: {
    color: "#17342d",
    fontWeight: "700",
  },
  filePickerHint: {
    color: "#60756f",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  actions: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "10px",
  },
  primaryButton: {
    padding: "11px 14px",
    background: "linear-gradient(135deg, #1b7f62, #2ea26f)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
  secondaryButton: {
    padding: "11px 14px",
    background: "#eef4f1",
    color: "#a61f2d",
    border: "1px solid #ead2d6",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
  tertiaryButton: {
    padding: "11px 14px",
    background: "#edf5ff",
    color: "#145ca8",
    border: "1px solid #c5dcfb",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default DataUploadPanel;
