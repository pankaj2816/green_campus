import React from "react";

export default function InsightDetailDrawer({ detail, onClose }) {
  if (!detail) {
    return null;
  }

  return (
    <>
      <button type="button" style={styles.overlay} onClick={onClose} aria-label="Close detail drawer" />
      <aside style={styles.drawer} className="premium-card">
        <div style={styles.header}>
          <div>
            <span style={styles.kicker}>{detail.category || "Detail"}</span>
            <h3 style={styles.title}>{detail.title}</h3>
          </div>
          <button type="button" onClick={onClose} style={styles.closeButton}>
            Close
          </button>
        </div>

        <p style={styles.summary}>{detail.summary}</p>

        {detail.points?.length ? (
          <div style={styles.points}>
            {detail.points.map((point, index) => (
              <div key={`${detail.title}-${index}`} style={styles.pointCard}>
                {point}
              </div>
            ))}
          </div>
        ) : null}
      </aside>
    </>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(14, 24, 22, 0.34)",
    border: "none",
    zIndex: 45,
    cursor: "pointer",
  },
  drawer: {
    position: "fixed",
    top: "24px",
    right: "24px",
    bottom: "24px",
    width: "min(420px, calc(100vw - 24px))",
    background: "#ffffff",
    borderRadius: "28px",
    padding: "22px",
    zIndex: 50,
    boxShadow: "0 28px 60px rgba(10, 22, 20, 0.22)",
    overflowY: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "start",
  },
  kicker: {
    color: "#1b7f62",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: "700",
  },
  title: {
    margin: "8px 0 0",
    color: "#17342d",
    fontSize: "28px",
    lineHeight: 1.15,
  },
  closeButton: {
    border: "1px solid #d5e1dc",
    background: "#f7fbf9",
    color: "#17342d",
    borderRadius: "999px",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: "700",
  },
  summary: {
    color: "#45605a",
    lineHeight: 1.7,
    marginTop: "18px",
  },
  points: {
    display: "grid",
    gap: "10px",
    marginTop: "18px",
  },
  pointCard: {
    padding: "14px 16px",
    borderRadius: "16px",
    background: "#f8fbfa",
    border: "1px solid #deebe6",
    color: "#17342d",
    lineHeight: 1.6,
  },
};
