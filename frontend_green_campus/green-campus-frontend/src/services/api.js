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

const readResponseBody = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { detail: text } : {};
};

const getDetailMessage = (data, fallbackMessage) => {
  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => item.msg || item.message || JSON.stringify(item))
      .join(", ");
  }

  return data?.detail || data?.message || fallbackMessage;
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/";
    return null;
  }

  const data = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(getDetailMessage(data, "Request failed"));
  }

  return data;
};

const extractErrorMessage = async (response, fallbackMessage) => {
  try {
    const data = await readResponseBody(response);
    return getDetailMessage(data, fallbackMessage);
  } catch (error) {
    return fallbackMessage;
  }
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

export const validateCampusDataset = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(buildUrl("/admin/validate-campus-excel"), {
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

export const exportCampusDataset = async () => {
  const response = await fetch(buildUrl("/admin/export-campus-excel"), {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Export failed"));
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = "green_campus_export.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);

  return { message: "Dataset exported successfully" };
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

export const fetchDashboardBundle = async ({
  building,
  granularity,
  dateFrom,
  dateTo,
}) => {
  const params = { building, date_from: dateFrom, date_to: dateTo };

  const [
    summary,
    comparisonData,
    trendData,
    buildingOptions,
    buildingData,
    performanceData,
    riskData,
    forecastData,
    insightsData,
    seasonalOutlook,
    alertsData,
    dataQuality,
  ] = await Promise.all([
    apiGet("/dashboard/summary", params),
    apiGet("/dashboard/comparison", params),
    apiGet("/energy/trend", params),
    apiGet("/dashboard/all-buildings"),
    apiGet("/energy/by-building", params),
    apiGet("/dashboard/building-performance", params),
    apiGet("/ai/risk/energy", { ...params, granularity }),
    apiGet("/ai/forecast/resources", { ...params, granularity }),
    apiGet("/insights", { ...params, granularity }),
    apiGet("/ai/seasonal-outlook", params),
    apiGet("/ai/alerts/overview", params),
    apiGet("/ai/data-quality", params),
  ]);

  return {
    summary,
    comparisonData,
    trendData,
    buildingOptions,
    buildingData,
    performanceData,
    riskData,
    forecastData,
    insightsData,
    seasonalOutlook,
    alertsData,
    dataQuality,
  };
};

export const fetchAssumptions = async () => apiGet("/meta/assumptions");
export const fetchDashboardSettings = async () => apiGet("/meta/settings");
export const saveDashboardSettings = async (payload) => apiPost("/meta/settings", payload);

export const runSimulation = async (payload) => apiPost("/ai/simulate/impact", payload);
