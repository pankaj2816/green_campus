const normalizeApiBase = (value) => (value || "http://127.0.0.1:8000").replace(/\/+$/, "");
const API_BASE = normalizeApiBase(process.env.REACT_APP_API_BASE_URL);
const NETWORK_ERROR_MESSAGE =
  "Cannot reach the backend service. Please check that the API URL and backend deployment are working.";

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

const performFetch = async (endpoint, options = {}, params = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90000);
  try {
    return await fetch(buildUrl(endpoint, params), { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The backend took too long to respond. Please try again.");
    }
    if (error instanceof TypeError) {
      throw new Error(NETWORK_ERROR_MESSAGE);
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
};

const handleResponse = async (response, redirectOnUnauthorized = true) => {
  if (response.status === 401 && redirectOnUnauthorized) {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("mgcd:session-expired"));
    throw new Error("Your session has expired. Please log in again.");
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

  const response = await performFetch("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  return handleResponse(response, false);
};

export const registerUser = async (username, password) => {
  const response = await performFetch("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  return handleResponse(response, false);
};

export const apiGet = async (endpoint, params = {}) => {
  const response = await performFetch(endpoint, { headers: getAuthHeaders() }, params);
  return handleResponse(response);
};

export const uploadCampusDataset = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await performFetch("/admin/upload-campus-excel", {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  return handleResponse(response);
};

export const validateCampusDataset = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await performFetch("/admin/validate-campus-excel", {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  return handleResponse(response);
};

export const resetCampusDataset = async () => {
  const response = await performFetch("/admin/reset-campus-data", {
    method: "POST",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const exportCampusDataset = async () => {
  const response = await performFetch("/admin/export-campus-excel", {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) await handleResponse(response);
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
  const response = await performFetch(endpoint, {
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
  const bundle = await apiGet("/dashboard/bundle", {
    building,
    granularity,
    date_from: dateFrom,
    date_to: dateTo,
  });

  const sectionErrors = bundle?.errors || {};
  if (!bundle?.summary) {
    const failedSections = Object.keys(sectionErrors);
    throw new Error(
      failedSections.length
        ? `Unable to load the dashboard. Failed sections: ${failedSections.join(", ")}.`
        : "Unable to load the dashboard."
    );
  }

  return {
    summary: bundle.summary,
    comparisonData: bundle.comparison,
    trendData: bundle.trend || [],
    buildingOptions: bundle.buildings || [],
    buildingData: bundle.building_energy || [],
    performanceData: bundle.performance || [],
    riskData: bundle.risk || [],
    forecastData: bundle.forecast,
    insightsData: bundle.insights,
    seasonalOutlook: bundle.seasonal,
    alertsData: bundle.alerts,
    dataQuality: bundle.data_quality,
    deviceReadiness: bundle.devices,
    auditTrail: bundle.audit,
    sectionErrors,
  };
};

export const fetchAssumptions = async () => apiGet("/meta/assumptions");
export const fetchCurrentUser = async () => apiGet("/auth/me");
export const saveDashboardSettings = async (payload) => apiPost("/meta/settings", payload);
export const saveDeviceReadiness = async (payload) => apiPost("/operations/devices", payload);

export const runSimulation = async (payload) => apiPost("/ai/simulate/impact", payload);
