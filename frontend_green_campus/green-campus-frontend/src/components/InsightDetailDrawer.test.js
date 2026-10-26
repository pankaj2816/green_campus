import { fireEvent, render, screen } from "@testing-library/react";
import InsightDetailDrawer from "./InsightDetailDrawer";

test("the detail dialog accepts keyboard focus and closes with Escape", () => {
  const close = jest.fn();
  render(<InsightDetailDrawer detail={{ title: "Energy change", summary: "Usage increased." }} onClose={close} />);
  expect(screen.getByRole("dialog", { name: "Energy change" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Close", exact: true })).toHaveFocus();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(close).toHaveBeenCalledTimes(1);
});
