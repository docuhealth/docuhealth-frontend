import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScanOrderDetails } from "@/features/radiologist/components/scan-order-details";
import { renderWithRouter } from "@/test/render";

// The mock's orders by stage: pending 1–20, in progress 21–24, completed 25–56, rejected 57–59.

function progressSteps() {
  const progress = screen.getByRole("region", { name: "Progress" });
  return within(progress)
    .getAllByRole("listitem")
    .map((step) => step.textContent);
}

describe("ScanOrderDetails", () => {
  it("asks the radiologist to accept or reject a pending order", async () => {
    renderWithRouter(<ScanOrderDetails orderId="scan-order-3" />);

    expect(await screen.findByRole("heading", { name: "Emeka Uche" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject request" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept request" })).toBeInTheDocument();
    expect(screen.getAllByText("Not scheduled yet")).not.toHaveLength(0);
    expect(progressSteps()).toEqual([
      expect.stringContaining("Request received, Done"),
      expect.stringContaining("Waiting for you to accept, Current step"),
      expect.stringContaining("Imaging done, Not yet"),
      expect.stringContaining("Result uploaded, Not yet"),
    ]);
  });

  it("lets the radiologist upload the result of a scan in progress", async () => {
    renderWithRouter(<ScanOrderDetails orderId="scan-order-22" />);

    expect(await screen.findByRole("button", { name: "Upload test result" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change the imaging time" })).toBeInTheDocument();
    expect(progressSteps()[2]).toContain("Imaging in progress, Current step");
  });

  it("shows a completed order's report and files", async () => {
    renderWithRouter(<ScanOrderDetails orderId="scan-order-27" />);

    expect(await screen.findByRole("region", { name: "Impression" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Progress" })).not.toBeInTheDocument();
    const files = within(screen.getByRole("list", { name: "Images and documents" }));
    expect(files.getByText("Radiology report (PDF)", { selector: "p" })).toBeInTheDocument();
    expect(files.getByRole("link", { name: "Download Radiology report (PDF)" })).toHaveAttribute(
      "download",
    );
    expect(screen.getByText("Dr. Emeka Obi", { selector: "dd" })).toBeInTheDocument();
  });

  it("explains why an order was rejected", async () => {
    renderWithRouter(<ScanOrderDetails orderId="scan-order-57" />);

    const reason = await screen.findByRole("region", { name: "Reason for rejection" });
    expect(reason).toHaveTextContent("doesn’t match the clinical question");
    expect(progressSteps()[1]).toContain("Request rejected, Rejected");
    expect(screen.getByRole("button", { name: "Re-upload result" })).toBeInTheDocument();
  });
});
