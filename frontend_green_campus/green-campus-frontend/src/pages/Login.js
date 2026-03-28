import React, { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { dashboardCopy } from "../config/dashboardConfig";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const data = await loginUser(username, password);

      if (data?.access_token) {
        localStorage.setItem("token", data.access_token);
        navigate("/dashboard");
      } else {
        alert(dashboardCopy.auth.loginInvalid);
      }
    } catch (error) {
      alert(error.message || dashboardCopy.auth.loginFailed);
    }
  };

return (
  <div style={{ textAlign: "center", marginTop: "150px" }}>
    <h2>{dashboardCopy.auth.loginTitle}</h2>

    <input
      placeholder="Username"
      onChange={(e) => setUsername(e.target.value)}
    />
    <br /><br />

    <input
      type="password"
      placeholder="Password"
      onChange={(e) => setPassword(e.target.value)}
    />
    <br /><br />

    <button onClick={handleLogin}>Login</button>

    <br /><br />

    <p>
      {dashboardCopy.auth.noAccountText}{" "}
      <a href="/register">{dashboardCopy.auth.registerPrompt}</a>
    </p>

  </div>
);

}

export default Login;
