export const dashboardCopy = {
  theme: {
    colors: {
      primaryText: "#17342d",
      secondaryText: "#60756f",
      accent: "#1b7f62",
      accentBlue: "#0284c7",
      danger: "#a61f2d",
      surface: "#ffffff",
      softSurface: "#f8fbfa",
      heroStart: "#f4fbf7",
      heroMiddle: "#ecf5f2",
      heroEnd: "#eaf0ff",
    },
    fontSizes: {
      heroKicker: "12px",
      heroTitle: "44px",
      heroSubtitle: "16px",
      cardTitle: "14px",
      cardValue: "30px",
      cardSubtitle: "13px",
      sectionTitle: "28px",
      metricValue: "24px",
      body: "14px",
    },
    radius: {
      card: "24px",
      hero: "30px",
      button: "14px",
    },
  },
  global: {
    loadingDashboard: "Loading Dashboard...",
    scopeLabel: "Scope",
    noData: "No data available right now.",
  },
  header: {
    kicker: "Green Campus Command Center",
    title: "Operational Sustainability Intelligence",
    subtitle:
      "Monitor utilities, forecast demand, reset or import fresh datasets, and plan around academic occupancy changes with a clearer professional dashboard.",
    buildingPlaceholder: "All Buildings",
    forecastOptions: [
      { value: "daily", label: "Daily Forecast" },
      { value: "monthly", label: "Monthly Forecast" },
      { value: "yearly", label: "Yearly Forecast" },
      { value: "seasonal", label: "Seasonal Forecast" },
    ],
    logoutLabel: "Logout",
  },
  dataControls: {
    title: "Data Controls",
    subtitle: "Reset the dataset or import a fresh Excel file.",
    importLabel: "Import Excel",
    importingLabel: "Importing...",
    resetLabel: "Reset Data",
    resettingLabel: "Resetting...",
    resetConfirm:
      "Reset all imported campus resource data? This clears energy, water, waste, and solar records.",
    selectFileAlert: "Please select an Excel file",
    uploadFailed: "Upload failed",
    resetFailed: "Reset failed",
  },
  assumptions: {
    title: "Simple Explanations and Settings",
    subtitle:
      "This section explains the numbers in plain language and shows the settings that drive the dashboard.",
    settingsTitle: "Current Settings",
    glossaryTitle: "What These Terms Mean",
  },
  assumptionsLabels: {
    emission_factor_kg_per_kwh: {
      label: "Carbon per electricity unit",
      description: "How much carbon is counted for every 1 kWh of grid electricity.",
    },
    energy_cost_per_kwh: {
      label: "Electricity cost per unit",
      description: "Estimated rupee cost for every 1 kWh used from the grid.",
    },
    energy_benchmark: {
      label: "Energy benchmark",
      description: "Reference value used to score electricity performance.",
    },
    water_benchmark: {
      label: "Water benchmark",
      description: "Reference value used to score water performance.",
    },
    waste_benchmark: {
      label: "Waste benchmark",
      description: "Reference value used to score waste performance.",
    },
    compliance_energy_limit: {
      label: "Compliance energy limit",
      description: "Energy limit used for compliance-style scoring.",
    },
    compliance_water_limit: {
      label: "Compliance water limit",
      description: "Water limit used for compliance-style scoring.",
    },
    compliance_waste_limit: {
      label: "Compliance waste limit",
      description: "Waste limit used for compliance-style scoring.",
    },
    weights: {
      label: "Score weights",
      description: "How much energy, water, and waste each influence the Green Index.",
    },
    anomaly_threshold_percent: {
      label: "Alert threshold",
      description: "The percentage change after which the system starts calling a reading unusual.",
    },
    high_anomaly_threshold_percent: {
      label: "High alert threshold",
      description: "The percentage change after which an unusual reading becomes a high alert.",
    },
    academic_occupancy_factors: {
      label: "Month-wise campus occupancy",
      description: "Expected campus activity month by month. Lower values mean fewer students and lower demand.",
    },
  },
  chart: {
    resourceMixTitle: "Resource Mix Snapshot",
    resourceMixSubtitle:
      "A quick view of how the current campus totals are distributed across electricity, water, waste, and solar.",
    resourceMixCenterLabel: "Tracked Resources",
    resourceMixLargestPrefix: "Largest share",
    resourceOverviewTitle: "Operational Resource Comparison",
    resourceOverviewSubtitle:
      "Side-by-side totals for energy, water, waste, and solar generation.",
    resourceOverviewLabels: ["Energy", "Water", "Waste", "Solar"],
    trendTitle: "Energy and Solar Trend",
    trendSubtitle:
      "Monthly energy, solar generation, and remaining grid draw after offset.",
    trendNoData: "No energy trend data available",
    trendSeries: {
      energy: "Energy",
      solar: "Solar",
      net: "Net Grid Energy",
    },
    forecastNoData: "No forecast data",
    forecastSeries: {
      historical: "Historical",
      forecast: "Forecast",
    },
  },
  carbon: {
    title: "Advanced Carbon Footprint",
    subtitle:
      "Net emissions, avoided emissions through solar, and export-ready energy visibility.",
    exportLabel: "Export Potential",
    netLabel: "Net scope 2 footprint",
    cards: {
      gross: "Gross Carbon",
      avoided: "Solar Avoided Carbon",
      net: "Net Carbon",
      offset: "Solar Offset",
    },
  },
  solar: {
    title: "Solar Operations",
    subtitle:
      "Track on-campus generation, carbon avoidance, cost shielding, and possible export capacity.",
    cards: {
      contribution: "Solar Contribution",
      avoided: "Carbon Avoided",
      savings: "Cost Shielding",
      export: "Grid Export",
    },
  },
  kpis: {
    grossEnergy: {
      title: "Gross Energy",
      subtitle: "Campus electricity demand before solar offset",
    },
    water: {
      title: "Water Consumption",
      subtitle: "Campus water draw in the current filtered view",
    },
    waste: {
      title: "Waste Generated",
      subtitle: "Tracked waste volume across imported records",
    },
    solar: {
      title: "Solar Generated",
      subtitleSuffix: "of gross energy covered by solar",
    },
    net: {
      title: "Net Grid Energy",
      subtitle: "Electricity still required after solar contribution",
    },
    greenIndex: {
      title: "Green Index",
      subtitle: "Composite sustainability score for the current scope",
    },
  },
  insights: {
    title: "Advanced AI Insights",
    anomaliesTitle: "Anomalies",
    opportunitiesTitle: "Opportunities",
    recommendationsTitle: "Recommendations",
    anomaliesEmpty: "No significant anomalies detected.",
    opportunitiesEmpty: "No opportunity cards available yet.",
    recommendationsEmpty: "No recommendations generated.",
  },
  risk: {
    title: "AI Risk Engine",
    cards: {
      level: "Risk Level",
      trend: "Trend Direction",
      growth: "Growth",
      volatility: "Volatility",
      projectedEnergy: "Projected Energy",
      projectedCost: "Projected Cost",
      projectedCarbon: "Projected Carbon",
    },
  },
  alerts: {
    title: "Alert Center",
    subtitle:
      "Active campus warnings plus the best near-term days when solar could exceed daily demand.",
    exportTitle: "Export-Ready Days",
    exportCountLabel: "Days with solar surplus",
    noExportDays: "No export-ready days were detected in the current filtered data.",
    noAlerts: "No important alerts are active right now.",
  },
  forecast: {
    title: "AI Forecast Studio",
    subtitlePrefix: "using",
    subtitleMiddle: "aggregation for",
    cards: {
      energy: "Energy Forecast",
      water: "Water Forecast",
      waste: "Waste Forecast",
      solar: "Solar Forecast",
    },
  },
  ranking: {
    title: "Sustainability Ranking",
    empty: "No performance data available",
    headers: [
      "Rank",
      "Building",
      "Energy (kWh)",
      "Solar (kWh)",
      "Net Energy (kWh)",
      "Water (KL)",
      "Waste (kg)",
      "Carbon (kg CO2)",
      "Efficiency",
    ],
  },
  seasonal: {
    title: "Seasonal Intelligence",
    cards: {
      currentOccupancy: "Current Occupancy",
      nextOccupancy: "Next Occupancy",
      nextEnergy: "Next Energy Forecast",
      exportPotential: "Solar Export Potential",
    },
    captions: {
      seasonalForecast: "Seasonal forecast",
      possibleExcess: "Possible excess generation",
    },
  },
  simulator: {
    title: "Scenario Simulator",
    subtitle:
      "Test how operational changes affect carbon, energy cost, and sustainability score.",
    runLabel: "Run Simulation",
    runningLabel: "Running...",
    sliders: {
      energyReduction: "Energy Reduction %",
      waterReduction: "Water Reduction %",
      wasteReduction: "Waste Reduction %",
      solarIncrease: "Solar Increase %",
    },
    sections: {
      baseline: "Baseline",
      projected: "Projected",
      impact: "Impact",
    },
    metrics: {
      netEnergy: "Net Energy",
      carbon: "Carbon",
      energyCost: "Energy Cost",
      greenIndex: "Green Index",
      carbonSaved: "Carbon Saved",
      costSaved: "Cost Saved",
      greenIndexGain: "Green Index Gain",
      scope: "Scope",
    },
    failed: "Simulation failed",
  },
  auth: {
    loginTitle: "Green Campus Login",
    loginInvalid: "Invalid credentials",
    loginFailed: "Login failed",
    registerTitle: "Create Account",
    registerSuccess: "Registration successful! Redirecting to login...",
    registerDefaultError: "Registration failed",
    registerServerError: "Server error. Please try again.",
    registerLoginLink: "Login here",
    noAccountText: "Don't have an account?",
    registerPrompt: "Register here",
    alreadyHaveAccountText: "Already have an account?",
  },
};
