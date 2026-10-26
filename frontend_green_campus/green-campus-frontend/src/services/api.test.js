import { apiGet, fetchDashboardBundle, loginUser, registerUser } from "./api";

const response = (status, body) => ({ status, ok: status >= 200 && status < 300, headers: { get: () => "application/json" }, json: async () => body });

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn();
});

afterEach(() => { jest.useRealTimers(); });

test("incorrect login displays the server error without expiring a session", async () => {
  const listener = jest.fn();
  window.addEventListener("mgcd:session-expired", listener);
  fetch.mockResolvedValue(response(401, { detail: "Invalid credentials" }));
  await expect(loginUser("admin", "wrong")).rejects.toThrow("Invalid credentials");
  expect(listener).not.toHaveBeenCalled();
  window.removeEventListener("mgcd:session-expired", listener);
});

test("duplicate registration propagates the error", async () => {
  fetch.mockResolvedValue(response(400, { detail: "Username already exists" }));
  await expect(registerUser("admin", "password")).rejects.toThrow("Username already exists");
});

test("protected API expiry removes the token and notifies the app", async () => {
  localStorage.setItem("token", "expired");
  const listener = jest.fn();
  window.addEventListener("mgcd:session-expired", listener);
  fetch.mockResolvedValue(response(401, { detail: "Invalid token" }));
  await expect(apiGet("/dashboard/bundle")).rejects.toThrow("session has expired");
  expect(localStorage.getItem("token")).toBeNull();
  expect(listener).toHaveBeenCalledTimes(1);
  window.removeEventListener("mgcd:session-expired", listener);
});

test("network failures and request timeouts produce readable errors", async () => {
  fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
  await expect(apiGet("/dashboard/bundle")).rejects.toThrow("Cannot reach the backend");
  jest.useFakeTimers();
  fetch.mockImplementationOnce((url, options) => new Promise((resolve, reject) => {
    options.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
  }));
  const assertion = expect(apiGet("/dashboard/bundle")).rejects.toThrow("too long");
  jest.advanceTimersByTime(90000);
  await assertion;
});

test("bundle filters and partial errors survive mapping", async () => {
  fetch.mockResolvedValue(response(200, { summary: { energy: 100 }, errors: { forecast: "Unavailable" } }));
  const bundle = await fetchDashboardBundle({ building: "Lab A", granularity: "daily", dateFrom: "2025-01-01" });
  const url = new URL(fetch.mock.calls[0][0]);
  expect(url.searchParams.get("building")).toBe("Lab A");
  expect(url.searchParams.get("date_from")).toBe("2025-01-01");
  expect(bundle.sectionErrors).toEqual({ forecast: "Unavailable" });
  expect(bundle.trendData).toEqual([]);
});
