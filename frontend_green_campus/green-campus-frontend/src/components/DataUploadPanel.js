import React, { useState } from "react";

import { resetCampusDataset, uploadCampusDataset } from "../services/api";
import { dashboardCopy } from "../config/dashboardConfig";

function DataUploadPanel({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an Excel file");
      return;
    }

    setLoading(true);

    try {
      const data = await uploadCampusDataset(file);
      alert(data.message || "Dataset uploaded successfully");
      onUploadSuccess();
    } catch (error) {
      console.error(error);
      alert(error.message || "Upload failed");
    } finally {
      setLoading(false);
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
      alert(error.message || "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.labelBlock}>
        <strong style={styles.title}>{dashboardCopy.dataControls.title}</strong>
        <span style={styles.caption}>{dashboardCopy.dataControls.subtitle}</span>
      </div>

      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files[0])}
        style={styles.input}
      />

      <button onClick={handleUpload} style={styles.primaryButton}>
        {loading
          ? dashboardCopy.dataControls.importingLabel
          : dashboardCopy.dataControls.importLabel}
      </button>

      <button onClick={handleReset} style={styles.secondaryButton}>
        {resetting
          ? dashboardCopy.dataControls.resettingLabel
          : dashboardCopy.dataControls.resetLabel}
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
    background: "rgba(255,255,255,0.92)",
    padding: "12px 14px",
    borderRadius: "16px",
    boxShadow: "0 10px 28px rgba(15, 32, 28, 0.08)",
  },
  labelBlock: {
    display: "flex",
    flexDirection: "column",
    minWidth: "150px",
  },
  title: {
    color: "#17342d",
  },
  caption: {
    color: "#678079",
    fontSize: "12px",
  },
  input: {
    maxWidth: "240px",
  },
  primaryButton: {
    padding: "10px 14px",
    background: "linear-gradient(135deg, #1b7f62, #2ea26f)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "10px 14px",
    background: "#eef4f1",
    color: "#a61f2d",
    border: "1px solid #ead2d6",
    borderRadius: "10px",
    cursor: "pointer",
  },
};

export default DataUploadPanel;
