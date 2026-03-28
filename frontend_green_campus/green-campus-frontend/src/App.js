import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const handleLogin = (nextToken) => {
    localStorage.setItem("token", nextToken);
    setToken(nextToken);
  };

  return (
    <Router>

      <Routes>

        <Route
          path="/"
          element={token ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
        />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/" />}
        />

        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/"} />} />

      </Routes>

    </Router>
  );

}

export default App;
