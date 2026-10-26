import { act, fireEvent, render, screen } from "@testing-library/react";
import DataUploadPanel from "./DataUploadPanel";
import { validateCampusDataset } from "../services/api";

jest.mock("../services/api", () => ({
  validateCampusDataset: jest.fn(), uploadCampusDataset: jest.fn(), exportCampusDataset: jest.fn(), resetCampusDataset: jest.fn(),
}));

test("import is disabled until a selected workbook passes validation", () => {
  render(<DataUploadPanel onUploadSuccess={jest.fn()} />);
  expect(screen.getByRole("button", { name: "Import Excel" })).toBeDisabled();
});

test("an old validation response cannot approve a newer invalid workbook", async () => {
  let finishOld;
  validateCampusDataset.mockImplementationOnce(() => new Promise(resolve => { finishOld = resolve; }));
  validateCampusDataset.mockResolvedValueOnce({ ready: false, warnings: ["New workbook is invalid"], sheet_summaries: [] });
  const { container } = render(<DataUploadPanel onUploadSuccess={jest.fn()} />);
  fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [new File(["a"], "old.xlsx")] } });
  fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [new File(["b"], "new.xlsx")] } });
  await screen.findByText("New workbook is invalid");
  await act(async () => finishOld({ ready: true, warnings: [], sheet_summaries: [] }));
  expect(screen.getByRole("button", { name: "Import Excel" })).toBeDisabled();
  expect(screen.getByText("New workbook is invalid")).toBeInTheDocument();
});
