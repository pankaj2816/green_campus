import { fireEvent, render, screen, within } from "@testing-library/react";
import ComparisonSection from "./ComparisonSection";

const metric = { current: 0, previous: 50, change: -50, change_percent: -100 };
const payload = (item) => ({ previous: {}, delta: { waste: item } });

test("non-comparable metrics hide arithmetic and improvement claims, including in details", () => {
  const comparison_note = "Missing waste observations; arithmetic is not measured change.";
  const onOpenDetail = jest.fn();
  render(<ComparisonSection comparisonData={payload({ ...metric, comparable: false, comparison_note })} onOpenDetail={onOpenDetail} />);
  const card = screen.getByRole("button", { name: /Waste Change/ });
  expect(within(card).getByText("Not comparable")).toBeInTheDocument();
  expect(within(card).getByText(comparison_note)).toBeInTheDocument();
  expect(card).not.toHaveTextContent(/-50|-100|Current:|Previous:|Improving|Stable|Needs attention/);
  fireEvent.click(card);
  expect(onOpenDetail).toHaveBeenCalledWith({
    title: "Waste Change", category: "Comparison Insight", summary: "Not comparable", points: [comparison_note],
  });
});

test.each([true, undefined])("comparable=%s preserves the existing numeric display", (comparable) => {
  render(<ComparisonSection comparisonData={payload({ ...metric, comparable })} />);
  const card = screen.getByRole("button", { name: /Waste Change/ });
  expect(within(card).getByText("-50 kg")).toBeInTheDocument();
  expect(within(card).getByText("-100% vs previous period")).toBeInTheDocument();
  expect(within(card).getByText("Improving")).toBeInTheDocument();
  expect(within(card).queryByText("Not comparable")).not.toBeInTheDocument();
});

test("non-comparable metrics without a reason use an availability explanation", () => {
  render(<ComparisonSection comparisonData={payload({ ...metric, comparable: false })} />);
  expect(screen.getByText("Missing observations or different assessed resources prevent a measured comparison.")).toBeInTheDocument();
});
