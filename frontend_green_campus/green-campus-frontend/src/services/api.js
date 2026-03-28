const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

const buildUrl = (endpoint, params = {}) => {
  const url = new URL(`${API_BASE}${endpoint}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

const getAuthHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem("token");

  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/";
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Request failed");
  }

  return data;
};

export const loginUser = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(buildUrl("/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  return handleResponse(response);
};

export const registerUser = async (username, password) => {
  const response = await fetch(buildUrl("/auth/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  return handleResponse(response);
};

export const apiGet = async (endpoint, params = {}) => {
  const response = await fetch(buildUrl(endpoint, params), {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const uploadCampusDataset = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(buildUrl("/admin/upload-campus-excel"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  return handleResponse(response);
};

export const resetCampusDataset = async () => {
  const response = await fetch(buildUrl("/admin/reset-campus-data"), {
    method: "POST",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const apiPost = async (endpoint, body = {}) => {
  const response = await fetch(buildUrl(endpoint), {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(body),
  });

  return handleResponse(response);
};

export const fetchDashboardBundle = async ({ building, granularity }) => {
  const params = { building };

  const [
    summary,
    trendData,
    buildingOptions,
    buildingData,
    performanceData,
    riskData,
    forecastData,
    insightsData,
    seasonalOutlook,
    alertsData,
  ] = await Promise.all([
    apiGet("/dashboard/summary", params),
    apiGet("/energy/trend", params),
    apiGet("/dashboard/all-buildings"),
    apiGet("/energy/by-building"),
    apiGet("/dashboard/building-performance", params),
    apiGet("/ai/risk/energy", { ...params, granularity }),
    apiGet("/ai/forecast/resources", { ...params, granularity }),
    apiGet("/insights", { ...params, granularity }),
    apiGet("/ai/seasonal-outlook", params),
    apiGet("/ai/alerts/overview", params),
  ]);

  return {
    summary,
    trendData,
    buildingOptions,
    buildingData,
    performanceData,
    riskData,
    forecastData,
    insightsData,
    seasonalOutlook,
    alertsData,
  };
};

export const fetchAssumptions = async () => apiGet("/meta/assumptions");

export const runSimulation = async (payload) => apiPost("/ai/simulate/impact", payload);
