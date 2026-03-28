import React from "react";

function getRiskColor(level) {
  if (level === "HIGH") return "#f8d7da";
  if (level === "MEDIUM") return "#fff3cd";
  return "#d4edda";
}

function getRiskTextColor(level) {
  if (level === "HIGH") return "#721c24";
  if (level === "MEDIUM") return "#856404";
  return "#155724";
}

function AIRiskPanel({ riskData }) {

  if (!riskData) {
    return <p>No AI risk data available</p>;
  }

  return (
    <div style={styles.card}>

      <table style={styles.table}>

        <thead>
          <tr>
            <th>Risk Level</th>
            <th>Growth %</th>
            <th>Projected Energy</th>
            <th>Projected Cost</th>
            <th>Projected Carbon</th>
          </tr>
        </thead>

        <tbody>

          <tr>

            <td>
              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: "8px",
                  background: getRiskColor(riskData.risk_level),
                  color: getRiskTextColor(riskData.risk_level),
                  fontWeight: "bold"
                }}
              >
                {riskData.risk_level}
              </span>
            </td>

            <td>{riskData.growth_percent}%</td>

            <td>{riskData.projected_energy} kWh</td>

            <td>₹ {riskData.projected_cost}</td>

            <td>{riskData.projected_carbon} kg CO₂</td>

          </tr>

        </tbody>

      </table>

      <p style={{marginTop:"10px"}}>
        {riskData.message}
      </p>

    </div>
  );
}

const styles = {

  card: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0px 4px 12px rgba(0,0,0,0.1)"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "center"
  }

};

export default AIRiskPanel;