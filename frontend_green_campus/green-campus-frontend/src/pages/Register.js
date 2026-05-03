import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { dashboardCopy } from "../config/dashboardConfig";
import { registerUser } from "../services/api";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    setMessage("");

    try {
      await registerUser(username, password);
      setMessage(dashboardCopy.auth.registerSuccess);

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      setMessage(error.message || dashboardCopy.auth.registerServerError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page} className="app-shell-ambient auth-page-shell">
      <div style={styles.grid} className="auth-page-grid">
        <aside
          style={styles.sidePanel}
          className="premium-card stagger-in stagger-in-delay-1 auth-side-panel"
        >
          <div style={styles.sideGlow} />
          <span style={styles.badge}>{dashboardCopy.auth.authBadge}</span>
          <h1 style={styles.sideTitle}>
            {dashboardCopy.branding.appName} access for {dashboardCopy.branding.organization}
          </h1>
          <p style={styles.sideText}>
            New users can access live dashboards, export-ready data views, smart forecasts, and executive reporting in one place.
          </p>

          <div style={styles.featureGrid}>
            <Feature title="Monitor" text="Track energy, water, waste, and solar across the campus." />
            <Feature title="Predict" text="Use occupancy-aware forecasting and risk views for planning." />
            <Feature title="Explain" text="Open plain-language sections that help non-technical users understand the data." />
            <Feature title="Present" text="Use screenshot mode and executive report view during demos or reviews." />
          </div>

          <div style={styles.infoRail} className="auth-info-rail">
            <InfoStat label="Onboarding Path" value="Create account and start with Excel import" />
            <InfoStat label="Ideal Users" value="Facilities, sustainability teams, reviewers" />
            <InfoStat label="Output" value="Insights, alerts, comparison, executive views" />
          </div>
        </aside>

        <section
          style={styles.panel}
          className="premium-card stagger-in stagger-in-delay-2 auth-main-panel"
        >
          <div style={styles.panelGlow} />
          <h2 style={styles.title}>{dashboardCopy.auth.registerTitle}</h2>
          <p style={styles.subtitle}>{dashboardCopy.auth.registerSubtitle}</p>

          <label style={styles.field}>
            <span style={styles.label}>{dashboardCopy.auth.usernameLabel}</span>
            <input
              placeholder={dashboardCopy.auth.usernameLabel}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>{dashboardCopy.auth.passwordLabel}</span>
            <input
              type="password"
              placeholder={dashboardCopy.auth.passwordLabel}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </label>

          <button onClick={handleRegister} style={styles.primaryButton} disabled={loading}>
            {loading ? dashboardCopy.auth.registeringButton : dashboardCopy.auth.registerButton}
          </button>

          <p style={styles.message}>{message}</p>

          <p style={styles.footerText}>
            {dashboardCopy.auth.alreadyHaveAccountText}{" "}
            <span onClick={() => navigate("/")} style={styles.link}>
              {dashboardCopy.auth.registerLoginLink}
            </span>
          </p>
        </section>
      </div>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div style={styles.featureCard}>
      <strong style={styles.featureTitle}>{title}</strong>
      <span style={styles.featureText}>{text}</span>
    </div>
  );
}

function InfoStat({ label, value }) {
  return (
    <div style={styles.infoStat}>
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value}</strong>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "36px 20px",
    background:
      "radial-gradient(circle at top right, rgba(34,197,94,0.12), transparent 28%), linear-gradient(180deg, #eff7f3 0%, #edf1ff 100%)",
    display: "grid",
    placeItems: "center",
  },
  grid: {
    width: "min(1120px, 100%)",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 420px)",
    gap: "24px",
  },
  sidePanel: {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(160deg, #17342d 0%, #1d4f43 55%, #255b89 100%)",
    color: "#f5fbf8",
    borderRadius: "28px",
    padding: "30px",
    boxShadow: "0 24px 46px rgba(14, 30, 26, 0.14)",
  },
  sideGlow: {
    position: "absolute",
    left: "-52px",
    bottom: "-52px",
    width: "220px",
    height: "220px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(110,231,183,0.22), rgba(110,231,183,0))",
  },
  badge: {
    display: "inline-flex",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    color: "#dff8ef",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  sideTitle: {
    margin: "16px 0 10px",
    fontSize: "34px",
    lineHeight: 1.1,
  },
  sideText: {
    margin: 0,
    color: "rgba(245,251,248,0.84)",
    lineHeight: 1.7,
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
    marginTop: "24px",
  },
  featureCard: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "16px",
    display: "grid",
    gap: "8px",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  featureTitle: {
    color: "#ffffff",
  },
  featureText: {
    color: "rgba(245,251,248,0.82)",
    lineHeight: 1.55,
  },
  panel: {
    position: "relative",
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(12px)",
    borderRadius: "28px",
    padding: "30px",
    boxShadow: "0 24px 46px rgba(14, 30, 26, 0.10)",
  },
  panelGlow: {
    position: "absolute",
    right: "-38px",
    top: "-30px",
    width: "170px",
    height: "170px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(34,197,94,0.12), rgba(34,197,94,0))",
    pointerEvents: "none",
  },
  title: {
    margin: 0,
    color: "#17342d",
    fontSize: "32px",
  },
  subtitle: {
    margin: "10px 0 0",
    color: "#60756f",
    lineHeight: 1.7,
  },
  field: {
    display: "grid",
    gap: "8px",
    marginTop: "18px",
  },
  label: {
    color: "#35514a",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "14px",
    border: "1px solid #cfddd8",
    background: "#fbfefd",
    boxSizing: "border-box",
  },
  primaryButton: {
    width: "100%",
    marginTop: "18px",
    padding: "14px 18px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #1b7f62, #2563eb)",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  },
  message: {
    minHeight: "24px",
    marginTop: "12px",
    color: "#a62b34",
  },
  footerText: {
    color: "#60756f",
    marginBottom: 0,
  },
  link: {
    color: "#145ca8",
    cursor: "pointer",
    fontWeight: "700",
  },
  infoRail: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
    marginTop: "20px",
  },
  infoStat: {
    display: "grid",
    gap: "6px",
    padding: "14px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  infoLabel: {
    color: "rgba(245,251,248,0.66)",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  infoValue: {
    color: "#f5fbf8",
    fontSize: "15px",
    lineHeight: 1.5,
  },
};

export default Register;
