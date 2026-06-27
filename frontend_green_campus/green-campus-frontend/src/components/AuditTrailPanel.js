import React from "react";

import InfoHint from "./InfoHint";

function eventTone(eventType) {
  switch (eventType) {
    case "dataset":
      return { bg: "#edf6ff", text: "#145ca8" };
    case "settings":
      return { bg: "#e8f7f1", text: "#176b53" };
    case "device_registry":
      return { bg: "#fff6e9", text: "#b45309" };
    default:
      return { bg: "#eff4f2", text: "#35514a" };
  }
}

function formatTimestamp(value) {
  if (!value) return "Unknown time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AuditTrailPanel({ auditTrail }) {
  const records = auditTrail?.records || [];

  return (
    <div style={styles.card} className="premium-card lift-card stagger-in">
      <div style={styles.header}>
        <div>
          <span style={styles.kicker}>Governance Activity</span>
          <h3 style={styles.title}>
            Audit Trail
            <InfoHint
              title="What audit trail means"
              text="This is a simple action history. It records important operations such as settings changes, dataset imports, data resets, and device registry updates so teams can understand what changed and when."
              width={330}
              align="right"
            />
          </h3>
          <p style={styles.subtitle}>
            Review important operations so governance changes are easier to explain and verify.
          </p>
        </div>
      </div>

      {records.length ? (
        <div style={styles.timeline}>
          {records.map((record) => {
            const tone = eventTone(record.event_type);
            return (
              <div key={record.id} style={styles.item}>
                <div style={styles.dotColumn}>
                  <span style={{ ...styles.dot, background: tone.text }} />
                  <span style={styles.line} />
                </div>

                <div style={styles.itemBody}>
                  <div style={styles.itemTop}>
                    <div style={styles.itemMeta}>
                      <span style={{ ...styles.typeBadge, background: tone.bg, color: tone.text }}>
                        {record.event_type.replace("_", " ")}
                      </span>
                      <strong style={styles.summary}>{record.summary}</strong>
                    </div>
                    <span style={styles.time}>{formatTimestamp(record.created_at)}</span>
                  </div>

                  <div style={styles.secondaryRow}>
                    <span>Actor: {record.actor_username || "System"}</span>
                    <span>Action: {record.action}</span>
                    <span>Scope: {record.scope}</span>
                  </div>

                  {record.details && Object.keys(record.details).length ? (
                    <div style={styles.detailGrid}>
                      {Object.entries(record.details).map(([key, value]) => (
                        <div key={key} style={styles.detailChip}>
                          <strong>{key.replace(/_/g, " ")}:</strong>{" "}
                          <span>{Array.isArray(value) ? value.join(", ") || "None" : String(value)}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={styles.empty}>No tracked governance activity is available yet.</p>
      )}
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
    marginBottom: "16px",
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
  timeline: {
    display: "grid",
    gap: "14px",
  },
  item: {
    display: "grid",
    gridTemplateColumns: "20px minmax(0, 1fr)",
    gap: "12px",
  },
  dotColumn: {
    display: "grid",
    justifyItems: "center",
    alignContent: "start",
  },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    marginTop: "6px",
  },
  line: {
    width: "2px",
    minHeight: "100%",
    background: "#dbe8e2",
    marginTop: "6px",
  },
  itemBody: {
    border: "1px solid #deebe6",
    borderRadius: "18px",
    padding: "14px",
    background: "#f8fbfa",
    display: "grid",
    gap: "10px",
  },
  itemTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "start",
    flexWrap: "wrap",
  },
  itemMeta: {
    display: "grid",
    gap: "8px",
  },
  typeBadge: {
    display: "inline-flex",
    alignItems: "center",
    width: "fit-content",
    padding: "5px 10px",
    borderRadius: "999px",
    textTransform: "uppercase",
    fontWeight: "700",
    fontSize: "11px",
    letterSpacing: "0.05em",
  },
  summary: {
    color: "#17342d",
  },
  time: {
    color: "#60756f",
    fontSize: "12px",
    whiteSpace: "nowrap",
  },
  secondaryRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px 16px",
    color: "#35514a",
    fontSize: "13px",
  },
  detailGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  detailChip: {
    padding: "8px 10px",
    borderRadius: "12px",
    background: "#ffffff",
    border: "1px solid #e2ece8",
    color: "#35514a",
    fontSize: "12px",
  },
  empty: {
    margin: 0,
    color: "#60756f",
  },
};
