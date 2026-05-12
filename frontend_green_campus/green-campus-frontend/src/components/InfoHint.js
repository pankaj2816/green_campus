import React, { useState } from "react";

export default function InfoHint({ title = "What this means", text, width = 280 }) {
  const [open, setOpen] = useState(false);

  return (
    <span
      style={styles.wrapper}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        style={styles.button}
        aria-label={title}
        onClick={() => setOpen((current) => !current)}
      >
        !
      </button>
      {open ? (
        <span style={{ ...styles.tooltip, width }}>
          <strong style={styles.tooltipTitle}>{title}</strong>
          <span style={styles.tooltipText}>{text}</span>
        </span>
      ) : null}
    </span>
  );
}

const styles = {
  wrapper: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    marginLeft: "8px",
    verticalAlign: "middle",
  },
  button: {
    width: "22px",
    height: "22px",
    borderRadius: "999px",
    border: "1px solid #b8d2c8",
    background: "#f5fbf8",
    color: "#1b7f62",
    fontWeight: "800",
    fontSize: "12px",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    lineHeight: 1,
  },
  tooltip: {
    position: "absolute",
    top: "30px",
    left: 0,
    zIndex: 25,
    background: "#17342d",
    color: "#f5fbf8",
    borderRadius: "16px",
    padding: "12px 14px",
    boxShadow: "0 18px 36px rgba(8, 18, 16, 0.28)",
    display: "grid",
    gap: "6px",
  },
  tooltipTitle: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#9ee8c8",
  },
  tooltipText: {
    fontSize: "13px",
    lineHeight: 1.6,
  },
};
