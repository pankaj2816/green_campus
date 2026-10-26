import { render, screen } from "@testing-library/react";

jest.mock("./pages/Dashboard", () => () => <div>Dashboard</div>);
jest.mock("./pages/Register", () => () => <div>Register</div>);

import App from "./App";

test("shows the login screen", () => {
  localStorage.clear();
  render(<App />);
  expect(screen.getByRole("heading", { name: /MGCD Login/i })).toBeInTheDocument();
});
