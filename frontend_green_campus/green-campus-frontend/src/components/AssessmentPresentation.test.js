import { fireEvent, render, screen, within } from "@testing-library/react";
import DataQualityPanel from "./DataQualityPanel";
import AIForecastSection from "./AIForecastSection";
import DashboardCards from "./DashboardCards";
import ExecutiveReportView from "./ExecutiveReportView";
import { greenIndexNote } from "./assessmentPresentation";
import ResourceOverview from "./ResourceOverview";
import ResourceMixChart from "./ResourceMixChart";
import AIRiskSection from "./AIRiskSection";

jest.mock("react-chartjs-2", () => ({
  Line: ({ data }) => <div>{data.datasets.map((dataset, index) => <span key={index}>{dataset.label}</span>)}</div>,
  Bar: () => <div>Bar chart</div>,
  Doughnut: () => <div>Doughnut chart</div>,
}));

const quality = {
  overall_score: 70, trust_level: "Medium", history_months: 12, forecast_readiness: 50,
  issue_count: 1, resources: [{ resource: "energy", row_count: 12, covered_months: 12,
    missing_month_count: 0, score: 70, status: "usable", cadence: "daily",
    coverage_percent: 50, coverage_status: "partial", observed_intervals: 12,
    expected_intervals: 24, missing_interval_count: 12, longest_gap_intervals: 5,
    coverage_explanation: "Counts include boundary gaps.",
  }],
};
const summary = { energy: 100, water: 10, waste: 0, solar: 20, net_energy: 80, green_index: 85,
  green_index_details: { assessment: "partial", unavailable_resources: ["waste"], assessed_resources: ["energy", "water"] },
};

test("history availability is not presented as prediction accuracy and interval metadata reaches details", () => {
  const onOpenDetail = jest.fn();
  render(<DataQualityPanel qualityData={quality} onOpenDetail={onOpenDetail} />);
  expect(screen.getByText("History / Data Availability")).toBeInTheDocument();
  expect(screen.queryByText("Forecast Readiness")).not.toBeInTheDocument();
  expect(screen.getByText(/not prediction accuracy/)).toBeInTheDocument();
  expect(screen.getByText("Cadence: daily")).toBeInTheDocument();
  expect(screen.getByText("Interval coverage: 50% (partial)")).toBeInTheDocument();
  expect(screen.getByText("Observed / expected intervals: 12 / 24")).toBeInTheDocument();
  expect(screen.getByText("Missing intervals: 12")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /energy usable/ }));
  expect(onOpenDetail.mock.calls[0][0].points).toContain("Counts include boundary gaps.");
});

test("unknown coverage is not shown as zero or complete and old payloads still render", () => {
  const { rerender } = render(<DataQualityPanel qualityData={{ ...quality, resources: [{ ...quality.resources[0], cadence: "unknown", coverage_percent: null, observed_intervals: null, expected_intervals: null, missing_interval_count: null, coverage_status: "unknown" }] }} />);
  expect(screen.getByText("Interval coverage: Unknown (unknown)")).toBeInTheDocument();
  expect(screen.getByText("Missing intervals: Unknown")).toBeInTheDocument();
  rerender(<DataQualityPanel qualityData={{ ...quality, forecast_readiness: null, resources: [{ resource: "water", score: 0 }] }} />);
  expect(screen.getByText("Not available")).toBeInTheDocument();
  expect(screen.queryByText(/Cadence:/)).not.toBeInTheDocument();
});

test("forecast spreads disclose method and false occupancy adjustment without confidence claims", () => {
  render(<AIForecastSection granularity="monthly" forecastData={{ future_occupancy_average: 0, energy: {
    forecast_values: [10], forecast_lower: [8], forecast_upper: [12], forecast_labels: ["Next"],
    forecast_method: "seasonal_naive_with_recent_cycle_fallback", method_description: "Observed cycle method.",
    spread_type: "historical_variation_only", spread_backtest_cases: 0,
    occupancy_adjustment_applied: false, occupancy_note: "Separate what-if scenario only.",
    occupancy_scenario_values: [0],
    confidence_reasons: ["Stable history keeps the confidence range narrow."],
  } }} />);
  expect(screen.getAllByText("Forecast Spread")).toHaveLength(2);
  expect(screen.getByText(/not calibrated confidence intervals/)).toBeInTheDocument();
  const summaryToggle = screen.getByText("How this forecast works");
  expect(summaryToggle.parentElement).not.toHaveAttribute("open");
  expect(screen.getByText(/Separate occupancy what-if scenario \(Next\): 0 kWh/)).not.toBeVisible();
  fireEvent.click(summaryToggle);
  expect(summaryToggle.parentElement).toHaveAttribute("open");
  expect(screen.getByText(/Separate occupancy what-if scenario \(Next\): 0 kWh/)).toBeVisible();
  expect(screen.getByText("Method: seasonal naive with recent cycle fallback")).toBeInTheDocument();
  expect(screen.getByText(/Occupancy adjustment applied to main forecast: No\. The main forecast is the baseline/)).toBeInTheDocument();
  expect(screen.getByText("Historical error cases used for spread: 0")).toBeInTheDocument();
  expect(screen.getByText(/upcoming periods: 0%/)).toBeInTheDocument();
  expect(screen.queryByText(/confidence range/i)).not.toBeInTheDocument();
});

test("missing waste forecast records are unassessed, not a zero baseline", () => {
  render(<AIForecastSection granularity="monthly" forecastData={{ waste: {
    historical_values: [], forecast_values: [], baseline_mean: 0, recent_mean: 0, variability_score: 0,
  } }} />);
  expect(screen.getByText("Waste Forecast")).toBeInTheDocument();
  expect(screen.getByText("No measured records; forecast not assessed.")).toBeInTheDocument();
  expect(screen.queryByText(/Baseline:/)).not.toBeInTheDocument();
  expect(screen.queryByText("How this forecast works")).not.toBeInTheDocument();
});

test("partial Green Index warning appears on the main score card and report", () => {
  const { unmount } = render(<DashboardCards data={summary} />);
  const card = screen.getByRole("button", { name: /Campus KPI Green Index/ });
  expect(within(card).getByText(/Partial score: waste unavailable/)).toBeInTheDocument();
  expect(within(card).getByText(/assessed weights are normalized/)).toBeInTheDocument();
  unmount();
  render(<ExecutiveReportView data={summary} />);
  expect(screen.getByText(/Partial score: waste unavailable/)).toBeInTheDocument();
});

test("complete and legacy scores have no partial warning; unavailable score has no numeric performance", () => {
  expect(greenIndexNote({})).toBeNull();
  expect(greenIndexNote({ green_index_details: { assessment: "complete" } })).toBeNull();
  render(<DashboardCards data={{ ...summary, green_index: 0, green_index_details: { assessment: "unavailable" } }} />);
  const card = screen.getByRole("button", { name: /Campus KPI Green Index/ });
  expect(within(card).getByText("Not available")).toBeInTheDocument();
  expect(within(card).queryByText("0 %")).not.toBeInTheDocument();
});

test("explicitly missing waste is unavailable across summaries, but measured zero remains zero", () => {
  const data = { ...summary, resource_availability: { waste: false } };
  const { rerender } = render(<DashboardCards data={data} />);
  let card = screen.getByRole("button", { name: /Campus KPI Waste Generated/ });
  expect(within(card).getByText("Not available")).toBeInTheDocument();
  expect(within(card).queryByText("0 kg")).not.toBeInTheDocument();
  rerender(<DashboardCards data={{ ...data, resource_availability: { waste: true } }} />);
  card = screen.getByRole("button", { name: /Campus KPI Waste Generated/ });
  expect(within(card).getByText("0 kg")).toBeInTheDocument();
  rerender(<DashboardCards data={summary} />);
  expect(screen.getByText("0 kg")).toBeInTheDocument();
  rerender(<ExecutiveReportView data={data} />);
  expect(screen.getByText("Not available")).toBeInTheDocument();
  expect(screen.queryByText("0 kg")).not.toBeInTheDocument();
  rerender(<ResourceOverview data={data} />);
  expect(screen.getByText("Not available")).toBeInTheDocument();
  expect(screen.queryByText("0 kg")).not.toBeInTheDocument();
  rerender(<ResourceMixChart data={data} />);
  expect(screen.getByText(/Waste not available \(no readings\)/)).toBeInTheDocument();
});

test("risk displays the supplied heuristic note and occupancy adjustment status", () => {
  render(<AIRiskSection riskData={[{ risk_note: "Heuristic planning indicator, not a validated probability.", occupancy_adjustment_applied: false }]} />);
  expect(screen.getByText("Heuristic planning indicator, not a validated probability.")).toBeInTheDocument();
  expect(screen.getByText("Occupancy adjustment applied to main forecast: No.")).toBeInTheDocument();
  expect(screen.getByText("Forecast Spread Width")).toBeInTheDocument();
});

test("backend accounting caveats appear on the net energy card, in its details, and in the report", () => {
  const accounting_note = "Carbon/cost are assumption-based estimates using period-level electricity-minus-solar netting. Verify tariff and emission factor. A touched-month average is not a full-month bill.";
  const data = { ...summary, accounting_note };
  const onOpenDetail = jest.fn();
  const { rerender } = render(<DashboardCards data={data} onOpenDetail={onOpenDetail} />);
  const card = screen.getByRole("button", { name: /Campus KPI Net Grid Energy/ });
  expect(within(card).getByText(accounting_note)).toBeInTheDocument();
  fireEvent.click(card);
  expect(onOpenDetail.mock.calls[0][0].points).toContain(accounting_note);
  rerender(<ExecutiveReportView data={data} />);
  expect(screen.getByText(accounting_note)).toBeInTheDocument();
});
