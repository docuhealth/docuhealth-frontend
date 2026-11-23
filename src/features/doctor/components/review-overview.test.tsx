import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DoctorOverview } from "@/features/doctor/components/doctor-overview";
import { LabResults } from "@/features/doctor/components/lab-results";
import { ResultReview } from "@/features/doctor/components/result-review";
import { renderWithRouter } from "@/test/render";

// Bisi Adewale (HIN 4200000000002) has a fasting glucose the lab admin has approved, and a chest
// X-ray report waiting. The tests go in order: the first approves the glucose.

describe("Doctor overview", () => {
  it("shows who's waiting, the period's totals and the months' admissions", async () => {
    renderWithRouter(<DoctorOverview firstName="Raphael" bannerUrl={null} />);
    const stats = await screen.findByRole("region", { name: "Overview" });
    expect(await within(stats).findByText("77")).toBeInTheDocument();
    expect(within(stats).getByText("Waiting patients")).toBeInTheDocument();
    expect(within(stats).getByText("40%")).toBeInTheDocument();
    expect(await screen.findByText("Admissions by month")).toBeInTheDocument();
    expect(screen.getByText("25 this year")).toBeInTheDocument();
  });
});

describe("Result review", () => {
  it("approves a lab result from the patient's lab tests", async () => {
    const { user } = renderWithRouter(<LabResults hin="4200000000002" />);
    expect(await screen.findByText("Ready for your review")).toBeInTheDocument();
    expect(screen.getByText("146 mg/dL")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Approve the Fasting Blood Glucose result" }),
    );
    expect(
      await screen.findByText("The Fasting Blood Glucose result is approved."),
    ).toBeInTheDocument();
    expect(await screen.findAllByText("Reviewed")).toHaveLength(2);
  });

  it("lists what's waiting, and rejects a scan report with a reason", async () => {
    const { user } = renderWithRouter(<ResultReview />);
    // The glucose was approved above, so no lab result waits.
    expect(await screen.findByText("Nothing is waiting for your review.")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Scan reports/ }));
    const report = (await screen.findByText("Chest X-ray, PA view")).closest("li")!;
    expect(within(report).getByText(/Bisi Adewale · HIN 4200000000002/)).toBeInTheDocument();
    expect(within(report).getByText("Right lower lobe pneumonia")).toBeInTheDocument();

    await user.click(
      within(report).getByRole("button", { name: "Reject the Chest X-ray, PA view report" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Reject result" });
    await user.click(within(dialog).getByRole("button", { name: "Reject result" }));
    expect(await within(dialog).findByText("Say why the result is rejected")).toBeInTheDocument();
    await user.type(within(dialog).getByLabelText(/Reason/), "Wrong side labelled");
    await user.click(within(dialog).getByRole("button", { name: "Reject result" }));
    expect(
      await screen.findByText("The Chest X-ray, PA view report is rejected and sent back."),
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Chest X-ray, PA view")).not.toBeInTheDocument());
  });
});
