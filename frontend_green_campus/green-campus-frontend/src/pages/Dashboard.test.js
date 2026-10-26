import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";
import { fetchAssumptions, fetchCurrentUser, fetchDashboardBundle } from "../services/api";

jest.mock("../services/api", () => ({
  fetchAssumptions: jest.fn(), fetchCurrentUser: jest.fn(), fetchDashboardBundle: jest.fn(),
  fetchDashboardSettings: jest.fn(), saveDashboardSettings: jest.fn(), saveDeviceReadiness: jest.fn(),
}));
jest.mock("react-chartjs-2", () => ({
  Bar: () => <div>Bar chart</div>, Line: () => <div>Line chart</div>, Doughnut: () => <div>Doughnut chart</div>,
}));

const summary = { scope: "Campus", has_data: true, energy: 100, solar: 20, net_energy: 80, water: 10, waste: 5, carbon: 65.6, gross_carbon: 82, solar_avoided_carbon: 16.4, green_index: 90, goal_progress: [] };
const bundle = {
  summary, buildingOptions: ["Lab A"], comparisonData: null, trendData: [], buildingData: [],
  performanceData: [], riskData: [], forecastData: null, insightsData: null, seasonalOutlook: null,
  alertsData: null, dataQuality: null, deviceReadiness: null, auditTrail: null, sectionErrors: {},
};

beforeEach(() => {
  jest.clearAllMocks();
  fetchCurrentUser.mockResolvedValue({ role: "viewer" });
  fetchAssumptions.mockResolvedValue({ constants: {}, glossary: [], settings: {} });
  fetchDashboardBundle.mockResolvedValue(bundle);
});

test("all dashboard views render when optional sections are unavailable", async () => {
  render(<MemoryRouter><Dashboard onLogout={jest.fn()} /></MemoryRouter>);
  await waitFor(() => expect(screen.queryByText("Loading Dashboard...")).not.toBeInTheDocument());
  for (const name of ["Intelligence", "Planning Studio", "Governance", "Executive Report", "Overview"]) {
    const buttons = screen.getAllByRole("button", { name: new RegExp(name, "i") });
    fireEvent.click(buttons[buttons.length - 1]);
    expect(screen.queryByText("Loading Dashboard...")).not.toBeInTheDocument();
  }
});

test("initial failure has a retry path", async () => {
  fetchDashboardBundle.mockRejectedValueOnce(new Error("Backend unavailable"));
  jest.spyOn(console, "error").mockImplementation(() => {});
  render(<MemoryRouter><Dashboard onLogout={jest.fn()} /></MemoryRouter>);
  fireEvent.click(await screen.findByRole("button", { name: "Try Again" }));
  await waitFor(() => expect(fetchDashboardBundle).toHaveBeenCalledTimes(2));
  await waitFor(() => expect(screen.queryByText("Dashboard could not load")).not.toBeInTheDocument());
  console.error.mockRestore();
});

test("a slow previous filter response cannot replace the newer scope", async () => {
  render(<MemoryRouter><Dashboard onLogout={jest.fn()} /></MemoryRouter>);
  await waitFor(() => expect(screen.queryByText("Loading Dashboard...")).not.toBeInTheDocument());
  let finishOld;
  fetchDashboardBundle.mockImplementationOnce(() => new Promise(resolve => { finishOld = resolve; }));
  const buildingSelect = screen.getAllByRole("combobox")[0];
  fireEvent.change(buildingSelect, { target: { value: "Lab A" } });
  await waitFor(() => expect(fetchDashboardBundle).toHaveBeenCalledTimes(2));
  fireEvent.change(buildingSelect, { target: { value: "" } });
  await waitFor(() => expect(fetchDashboardBundle).toHaveBeenCalledTimes(3));
  await act(async () => finishOld({ ...bundle, summary: { ...summary, scope: "OUTDATED SCOPE" } }));
  expect(screen.queryByText("OUTDATED SCOPE")).not.toBeInTheDocument();
});
