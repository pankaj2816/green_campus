export const dashboardCopy = {
  branding: {
    appShort: "GC",
    appName: "Green Campus",
    organization: "Manipal Institute of Technology, Karnataka",
    tagline: "Sustainability Intelligence Platform",
    logoText: "Green Campus",
    logoSubtext: "College demo edition",
  },
  resources: {
    simpleGuidePdf: "/docs/green-campus-simple-guide.pdf",
    simpleGuideLabel: "Simple Guide PDF",
  },
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
    shadows: {
      card: "0 18px 40px rgba(12, 24, 21, 0.08)",
      hero: "0 24px 50px rgba(18, 34, 29, 0.08)",
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
    statusCards: {
      scope: "Current scope",
      forecast: "Forecast mode",
      live: "Workspace mode",
      period: "Date window",
    },
    sectionTabs: [
      { id: "overview", label: "Overview" },
      { id: "intelligence", label: "Intelligence" },
      { id: "planning", label: "Planning Studio" },
      { id: "governance", label: "Governance" },
      { id: "report", label: "Executive Report" },
    ],
    forecastOptions: [
      { value: "daily", label: "Daily Forecast" },
      { value: "monthly", label: "Monthly Forecast" },
      { value: "yearly", label: "Yearly Forecast" },
      { value: "seasonal", label: "Seasonal Forecast" },
    ],
    dateFromLabel: "From",
    dateToLabel: "To",
    clearDatesLabel: "Clear Dates",
    quickRangeLabel: "Quick ranges",
    quickRanges: [
      { id: "all", label: "All Data" },
      { id: "last180", label: "Last 180 Days" },
      { id: "ay2024", label: "AY 2024-25" },
    ],
    logoutLabel: "Logout",
  },
  dataControls: {
    title: "Data Controls",
    subtitle: "Reset the dataset or import a fresh Excel file.",
    importLabel: "Import Excel",
    importingLabel: "Importing...",
    exportLabel: "Export Excel",
    exportingLabel: "Exporting...",
    resetLabel: "Reset Data",
    resettingLabel: "Resetting...",
    resetConfirm:
      "Reset all imported campus resource data? This clears energy, water, waste, and solar records.",
    selectFileAlert: "Please select an Excel file",
    selectedFilePrefix: "Selected file",
    uploadSuccess: "Dataset uploaded successfully",
    exportSuccess: "Dataset exported successfully",
    uploadFailed: "Upload failed",
    exportFailed: "Export failed",
    resetFailed: "Reset failed",
    validationTitle: "Workbook Check",
    validationReady: "Workbook is ready to import.",
    validationNotReady: "Workbook needs fixes before import.",
    validationPending: "Select a workbook to preview sheet structure.",
    validationChecking: "Checking workbook...",
    rowsLabel: "rows",
    warningsTitle: "Warnings",
  },
  layout: {
    primarySection: {
      kicker: "Campus overview",
      title: "Operational picture and live controls",
      subtitle:
        "Start with the live campus state, then import, reset, or export the current workbook.",
      helpText:
        "Overview is the best place to understand the current campus situation quickly. It combines status, comparison, key metrics, and seasonal planning in one guided view.",
    },
    performanceSection: {
      kicker: "Performance intelligence",
      title: "Carbon, solar, alerts, and resource flow",
      subtitle:
        "Understand where emissions are coming from, how solar is helping, and where the next risks are forming.",
      helpText:
        "Intelligence focuses on deeper performance reading. Use it when you want to explain where resources are being used, what alerts are active, and how carbon and solar are behaving.",
    },
    planningSection: {
      kicker: "AI planning studio",
      title: "Forecasts, insights, and scenario testing",
      subtitle:
        "Use predictive views and simulation tools to shape campus operations before the next spike arrives.",
      helpText:
        "Planning Studio is for future-oriented decisions. It helps you understand forecasts, risk, recommendations, and what may happen if you change energy, water, waste, or solar behavior.",
    },
    governanceSection: {
      kicker: "Governance and reference",
      title: "Rankings, assumptions, and working logic",
      subtitle:
        "Review building-level standing and the settings that control the dashboard calculations.",
      helpText:
        "Governance explains how the system is working. It is the right place to edit assumptions, review formulas, and understand why the dashboard is giving a certain result.",
    },
    reportSection: {
      kicker: "Executive report",
      title: "Printable management-ready sustainability summary",
      subtitle:
        "Use this view for screenshots, meetings, and a cleaner one-page explanation of campus status.",
      helpText:
        "Executive Report is the presentation-friendly view. Use it for meetings, screenshots, print, and simple management discussion instead of raw dashboard exploration.",
    },
  },
  assumptions: {
    title: "Simple Explanations and Settings",
    subtitle:
      "This section explains the numbers in plain language and shows the settings that drive the dashboard.",
    settingsTitle: "Current Settings",
    formulasTitle: "How The Dashboard Calculates Values",
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
    resourceOverviewXAxis: "Resource type",
    resourceOverviewYAxis: "Value (mixed units: kWh / kl / kg)",
    trendTitle: "Energy and Solar Trend",
    trendSubtitle:
      "Monthly energy, solar generation, and remaining grid draw after offset.",
    trendXAxis: "Month",
    trendYAxis: "Energy and solar (kWh)",
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
      confidence: "Confidence Range",
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
      confidence: "Forecast Range",
      occupancy: "Occupancy Effect",
      projectedEnergy: "Projected Energy",
      projectedWindow: "Projected Window",
      projectedCost: "Projected Cost",
      projectedCarbon: "Projected Carbon",
    },
  },
  navigation: {
    title: "Dashboard Views",
    subtitle: "Switch between focused views instead of scanning one long page.",
  },
  presentation: {
    screenshotMode: "Screenshot Mode",
    normalMode: "Normal Mode",
    printReport: "Print Report",
    reportSubtitle: "Clean layout for screenshots, PDF printing, and stakeholder discussion.",
    quickSummaryTitle: "Executive Summary",
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
  comparison: {
    title: "Comparison Analytics",
    subtitle: "Compare the selected period with the immediately previous period of the same length.",
    noPrevious: "Choose both from/to dates to unlock previous-period comparison.",
    statusGood: "Improving",
    statusWatch: "Needs attention",
    statusFlat: "Stable",
    cards: {
      netEnergy: "Net Energy Change",
      water: "Water Change",
      waste: "Waste Change",
      carbon: "Carbon Change",
      greenIndex: "Green Index Change",
      cost: "Energy Cost Change",
    },
  },
  pulse: {
    title: "Campus Pulse",
    signalTitle: "Signal Summary",
    cards: {
      scope: "Scope",
      risk: "Risk",
      occupancy: "Forecast Occupancy",
      opportunity: "Top Opportunity",
      action: "Next Action",
    },
  },
  goals: {
    kicker: "Strategic Goals",
    title: "Target Progress Board",
    subtitle: "Set simple sustainability targets and track whether the current campus scope is moving in the right direction.",
  },
  actions: {
    kicker: "Action Board",
    title: "Recommendation Workflow",
    subtitle: "Turn AI recommendations into tracked actions so the dashboard supports follow-through, not just observation. This helps teams see what should happen next and what outcomes to expect.",
    empty: "No recommendations are available for the current scope yet.",
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
      "Water (kl)",
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
  occupancy: {
    title: "Occupancy and Campus Context",
    subtitle: "Edit the monthly activity assumptions and core campus planning values used by forecasts and benchmark-style metrics.",
    saveLabel: "Save Settings",
    savingLabel: "Saving...",
    savedLabel: "Settings saved",
    context: {
      student_population: "Student population",
      hostel_population: "Hostel population",
      built_up_area_sqm: "Built-up area (sqm)",
      monthly_energy_budget_rs: "Monthly energy budget (Rs)",
    },
  },
  auth: {
    loginTitle: "Green Campus Login",
    loginSubtitle: "Access live campus sustainability operations, forecasting, and management reporting in one place.",
    loginButton: "Login",
    signingInButton: "Signing in...",
    loginInvalid: "Invalid credentials",
    loginFailed: "Login failed",
    registerTitle: "Create Account",
    registerSubtitle: "Create a workspace account to explore the live campus intelligence dashboard.",
    registerButton: "Register",
    registeringButton: "Creating account...",
    registerSuccess: "Registration successful! Redirecting to login...",
    registerDefaultError: "Registration failed",
    registerServerError: "Server error. Please try again.",
    registerLoginLink: "Login here",
    noAccountText: "Don't have an account?",
    registerPrompt: "Register here",
    alreadyHaveAccountText: "Already have an account?",
    usernameLabel: "Username",
    passwordLabel: "Password",
    authBadge: "Campus Intelligence",
  },
};
