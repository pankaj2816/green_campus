import { fireEvent, render, screen } from "@testing-library/react";
import InfoHint from "./InfoHint";

test("help remains visible after focus and click, and closes on Escape", () => {
  render(<InfoHint title="Carbon help" text="Carbon is based on grid energy." />);
  const button = screen.getByRole("button", { name: "Carbon help" });
  fireEvent.focus(button);
  fireEvent.click(button);
  expect(screen.getByRole("tooltip")).toHaveTextContent("Carbon is based on grid energy.");
  expect(screen.getByRole("tooltip").style.position).toBe("fixed");
  fireEvent.keyDown(button, { key: "Escape" });
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});
