import React from "react";
import { render, screen } from "@testing-library/react";
import StrategicGoalsPanel from "./StrategicGoalsPanel";

jest.mock("../services/api", () => ({ saveDashboardSettings: jest.fn() }));

test("missing readings are not displayed as an achieved zero-use goal", () => {
  render(<StrategicGoalsPanel settings={{}} summaryData={{ goal_progress: [{
    key: "water_per_student_target_kl", label: "Water Per Student", current: 0,
    target: 0.22, unit: "kl", status: "no_data", completion_percent: 0,
  }] }} />);
  expect(screen.getByText("No data")).toBeInTheDocument();
  expect(screen.getByText("Not assessed")).toBeInTheDocument();
  expect(screen.queryByText("On track")).not.toBeInTheDocument();
});

test("a genuine measured zero can still meet a lower-is-better target", () => {
  render(<StrategicGoalsPanel settings={{}} summaryData={{ goal_progress: [{
    key: "monthly_energy_cost_target_rs", label: "Monthly Energy Cost", current: 0,
    target: 1000, unit: "Rs", status: "on_track", completion_percent: 100,
  }] }} />);
  expect(screen.getByText("On track")).toBeInTheDocument();
  expect(screen.getByText("0 Rs")).toBeInTheDocument();
});
