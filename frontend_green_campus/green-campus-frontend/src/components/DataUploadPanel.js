import React, { useState } from "react";

import {
  exportCampusDataset,
  resetCampusDataset,
  uploadCampusDataset,
  validateCampusDataset,
} from "../services/api";
import { dashboardCopy } from "../config/dashboardConfig";
import StatusNotice from "./StatusNotice";

function DataUploadPanel({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState(null);
  const [notice, setNotice] = useState(null);

  const handleFileChange = async (nextFile) => {
    setFile(nextFile);
    setValidation(null);

    if (!nextFile) {
      return;
    }

    setValidating(true);
    try {
      const result = await validateCampusDataset(nextFile);
      setValidation(result);
    } catch (error) {
      setValidation({
        ready: false,
        warnings: [error.message || dashboardCopy.dataControls.validationNotReady],
        sheet_summaries: [],
      });
    } finally {
      setValidating(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setNotice({ tone: "error", message: dashboardCopy.dataControls.selectFileAlert });
      return;
    }

    setNotice(null);
    setLoading(true);

    try {
      const data = await uploadCampusDataset(file);
      setNotice({ tone: "success", message: data.message || dashboardCopy.dataControls.uploadSuccess });
      setValidation(data.validation || validation);
      onUploadSuccess();
    } catch (error) {
      console.error(error);
      setNotice({ tone: "error", message: error.message || dashboardCopy.dataControls.uploadFailed });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setNotice(null);
    setExporting(true);

    try {
      const data = await exportCampusDataset();
      setNotice({ tone: "success", message: data.message || dashboardCopy.dataControls.exportSuccess });
    } catch (error) {
      console.error(error);
      setNotice({ tone: "error", message: error.message || dashboardCopy.dataControls.exportFailed });
    } finally {
      setExporting(false);
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm(dashboardCopy.dataControls.resetConfirm);

    if (!confirmed) {
      return;
    }

    setNotice(null);
    setResetting(true);

    try {
      const data = await resetCampusDataset();
      setNotice({ tone: "success", message: data.message || "Campus data reset successfully" });
      onUploadSuccess();
    } catch (error) {
      console.error(error);
      setNotice({ tone: "error", message: error.message || dashboardCopy.dataControls.resetFailed });
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
          onChange={(e) => handleFileChange(e.target.files[0])}
          style={styles.hiddenInput}
        />
        <span style={styles.filePickerLabel}>{dashboardCopy.dataControls.importLabel}</span>
        <span style={styles.filePickerHint}>
          {file
            ? `${dashboardCopy.dataControls.selectedFilePrefix}: ${file.name}`
            : dashboardCopy.dataControls.subtitle}
        </span>
      </label>

      <StatusNotice
        tone={notice?.tone}
        message={notice?.message}
        onDismiss={() => setNotice(null)}
      />

      <div style={styles.validationCard}>
        <strong style={styles.validationTitle}>{dashboardCopy.dataControls.validationTitle}</strong>
        <span style={styles.validationText}>
          {validating
            ? dashboardCopy.dataControls.validationChecking
            : validation
              ? validation.ready
                ? dashboardCopy.dataControls.validationReady
                : dashboardCopy.dataControls.validationNotReady
              : dashboardCopy.dataControls.validationPending}
        </span>

        {validation?.sheet_summaries?.length > 0 ? (
          <div style={styles.summaryGrid}>
            {validation.sheet_summaries.map((item) => (
              <div key={item.sheet} style={styles.summaryItem}>
                <strong>{item.sheet}</strong>
                <span>
                  {item.rows} {dashboardCopy.dataControls.rowsLabel}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {validation?.warnings?.length > 0 ? (
          <div style={styles.warningList}>
            <strong>{dashboardCopy.dataControls.warningsTitle}</strong>
            {validation.warnings.map((warning) => (
              <span key={warning}>{warning}</span>
            ))}
          </div>
        ) : null}
      </div>

      <div style={styles.actions}>
        <button
          onClick={handleUpload}
          style={styles.primaryButton}
          disabled={loading || validating || (validation && validation.ready === false)}
        >
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
  validationCard: {
    display: "grid",
    gap: "8px",
    padding: "12px 14px",
    background: "#f8fbfa",
    borderRadius: "14px",
    border: "1px solid #deebe6",
  },
  validationTitle: {
    color: "#17342d",
    fontSize: "13px",
  },
  validationText: {
    color: "#60756f",
    fontSize: "13px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
    gap: "8px",
  },
  summaryItem: {
    background: "#ffffff",
    borderRadius: "10px",
    padding: "8px 10px",
    display: "grid",
    gap: "2px",
    color: "#35514a",
    fontSize: "12px",
  },
  warningList: {
    display: "grid",
    gap: "4px",
    color: "#8a3d45",
    fontSize: "12px",
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
