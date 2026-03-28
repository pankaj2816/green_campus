import React from "react";

export default function SectionWrapper({ title, children }) {
  return (
    <div style={{ textAlign: "center", marginTop: "60px" }}>
      <h2>{title}</h2>
      <div
        style={{
          width: "700px",
          height: "350px",
          margin: "30px auto",
          background: "#ffffff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}