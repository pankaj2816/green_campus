import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { dashboardCopy } from "../config/dashboardConfig";
import { loginUser } from "../services/api";

function AuthShell({ title, subtitle, children, sideTitle, sideText, badge }) {
  return (
    <div style={styles.page} className="app-shell-ambient">
      <div style={styles.grid}>
        <section style={styles.panel} className="premium-card stagger-in">
      <span style={styles.badge}>{badge}</span>
          <h1 style={styles.title}>{title}</h1>
          <p style={styles.subtitle}>{subtitle}</p>
          {children}
        </section>

        <aside style={styles.sidePanel} className="premium-card stagger-in stagger-in-delay-2">
          <div style={styles.sideGlow} />
          <span style={styles.sideKicker}>Live Platform</span>
          <h2 style={styles.sideTitle}>{sideTitle}</h2>
          <p style={styles.sideText}>{sideText}</p>

          <div style={styles.sideList}>
            <Feature text="Building-wise sustainability visibility" />
            <Feature text="AI forecasts with occupancy-aware trends" />
            <Feature text="Import, export, and reset Excel workflows" />
            <Feature text="Management-ready report and screenshot views" />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Feature({ text }) {
  return (
    <div style={styles.feature}>
      <span style={styles.featureDot} />
      <span>{text}</span>
    </div>
  );
}

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");

    try {
      const data = await loginUser(username, password);

      if (data?.access_token) {
        onLogin?.(data.access_token);
        navigate("/dashboard");
      } else {
        setMessage(dashboardCopy.auth.loginInvalid);
      }
    } catch (error) {
      setMessage(error.message || dashboardCopy.auth.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={dashboardCopy.auth.loginTitle}
      subtitle={dashboardCopy.auth.loginSubtitle}
      badge={dashboardCopy.auth.authBadge}
      sideTitle={`${dashboardCopy.branding.appName} for ${dashboardCopy.branding.organization}`}
      sideText="Use this portal to move from raw utility data to decisions that are easier to explain during meetings, audits, demos, and reviews."
    >
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) {
              handleLogin();
            }
          }}
        />
      </label>

      <button onClick={handleLogin} style={styles.primaryButton} disabled={loading}>
        {loading ? dashboardCopy.auth.signingInButton : dashboardCopy.auth.loginButton}
      </button>

      <p style={styles.message}>{message}</p>

      <p style={styles.footerText}>
        {dashboardCopy.auth.noAccountText}{" "}
        <span onClick={() => navigate("/register")} style={styles.link}>
          {dashboardCopy.auth.registerPrompt}
        </span>
      </p>
    </AuthShell>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "36px 20px",
    background:
      "radial-gradient(circle at top left, rgba(59,130,246,0.10), transparent 28%), linear-gradient(180deg, #eff7f3 0%, #edf1ff 100%)",
    display: "grid",
    placeItems: "center",
  },
  grid: {
    width: "min(1120px, 100%)",
    display: "grid",
    gridTemplateColumns: "minmax(0, 430px) minmax(0, 1fr)",
    gap: "24px",
    alignItems: "stretch",
  },
  panel: {
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(12px)",
    borderRadius: "28px",
    padding: "30px",
    boxShadow: "0 24px 46px rgba(14, 30, 26, 0.10)",
  },
  badge: {
    display: "inline-flex",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#e9f7f1",
    color: "#1b7f62",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  title: {
    margin: "16px 0 8px",
    color: "#17342d",
    fontSize: "34px",
    lineHeight: 1.08,
  },
  subtitle: {
    margin: 0,
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
    width: "220px",
    height: "220px",
    right: "-40px",
    top: "-40px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(74, 222, 128, 0.24), rgba(74, 222, 128, 0))",
  },
  sideKicker: {
    position: "relative",
    color: "rgba(245,251,248,0.72)",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  sideTitle: {
    position: "relative",
    margin: "14px 0 12px",
    fontSize: "34px",
    lineHeight: 1.1,
  },
  sideText: {
    position: "relative",
    color: "rgba(245,251,248,0.84)",
    lineHeight: 1.7,
    maxWidth: "520px",
  },
  sideList: {
    position: "relative",
    display: "grid",
    gap: "12px",
    marginTop: "24px",
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.08)",
  },
  featureDot: {
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    background: "#6ee7b7",
    display: "inline-block",
  },
};

export default Login;
