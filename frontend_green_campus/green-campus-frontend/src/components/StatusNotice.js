import React from "react";

const toneStyles = {
  success: {
    background: "#ecfdf5",
    border: "#bbf7d0",
    color: "#166534",
  },
  error: {
    background: "#fff1f2",
    border: "#fecdd3",
    color: "#9f1239",
  },
  info: {
    background: "#eff6ff",
    border: "#bfdbfe",
    color: "#1e3a8a",
  },
};

function StatusNotice({ tone = "info", message, onDismiss }) {
  if (!message) {
    return null;
  }

  const palette = toneStyles[tone] || toneStyles.info;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      style={{
        ...styles.notice,
        background: palette.background,
        borderColor: palette.border,
        color: palette.color,
      }}
    >
      <span style={styles.message}>{message}</span>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          style={{ ...styles.dismiss, color: palette.color }}
        >
          x
        </button>
      ) : null}
    </div>
  );
}

const styles = {
  notice: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    padding: "11px 12px",
    border: "1px solid",
    borderRadius: "12px",
    fontSize: "13px",
    lineHeight: 1.45,
  },
  message: {
    minWidth: 0,
  },
  dismiss: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontWeight: "700",
    lineHeight: 1,
    padding: "2px 4px",
  },
};

export default StatusNotice;
