import React, { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { dashboardCopy } from "../config/dashboardConfig";

function Login() {
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
        localStorage.setItem("token", data.access_token);
        window.location.assign("/dashboard");
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
  <div style={styles.container}>
    <h2>{dashboardCopy.auth.loginTitle}</h2>

    <input
      placeholder="Username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      style={styles.input}
    />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      style={styles.input}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !loading) {
          handleLogin();
        }
      }}
    />

    <button onClick={handleLogin} style={styles.button} disabled={loading}>
      {loading ? "Signing in..." : "Login"}
    </button>

    <p style={styles.message}>{message}</p>

    <p>
      {dashboardCopy.auth.noAccountText}{" "}
      <span
        onClick={() => navigate("/register")}
        style={{ color: "blue", cursor: "pointer" }}
      >
        {dashboardCopy.auth.registerPrompt}
      </span>
    </p>

  </div>
);

}

const styles = {
  container: {
    width: "min(360px, calc(100vw - 32px))",
    margin: "120px auto",
    textAlign: "center",
    padding: "30px",
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 14px 32px rgba(15, 32, 28, 0.12)",
  },
  input: {
    display: "block",
    width: "100%",
    padding: "12px",
    margin: "12px 0",
    borderRadius: "8px",
    border: "1px solid #c9d6d2",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "12px 18px",
    background: "linear-gradient(135deg, #1b7f62, #2ea26f)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
  message: {
    minHeight: "24px",
    marginTop: "12px",
    color: "#a62b34",
  },
};

export default Login;
