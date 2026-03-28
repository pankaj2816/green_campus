import React from "react";
import DashboardCards from "./DashboardCards";

function KPISection({ data }) {

  return (
    <div>
      <DashboardCards data={data} />
    </div>
  );
}

export default KPISection; 