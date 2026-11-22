import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdmissionRequests } from "@/features/admissions/components/admission-requests";
import { renderWithProviders } from "@/test/render";

/** The table row for `name` (found even while a dialog hides the page from assistive tech). */
async function rowOf(name: string) {
  const table = await screen.findByRole("table", { hidden: true });
  return (await within(table).findByText(name)).closest("tr")!;
}

describe("AdmissionRequests", () => {
  it("admits a patient to the bed the doctor asked for", async () => {
    const { user } = renderWithProviders(<AdmissionRequests />);
    const row = await rowOf("Daniel Martins");
    expect(within(row).getByText("General ward")).toBeInTheDocument();
    expect(within(row).getByText("Dr. Raphael Jonnas")).toBeInTheDocument();

    await user.click(within(row).getByRole("button", { name: "Admit Daniel Martins" }));
    const dialog = await screen.findByRole("dialog", { name: "Admit patient" });
    await user.click(within(dialog).getByRole("button", { name: "Admit" }));
    expect(
      await screen.findByText("Daniel Martins is admitted to General ward · Bed 4."),
    ).toBeInTheDocument();
    const table = screen.getByRole("table");
    await waitFor(() =>
      expect(within(table).queryByText("Daniel Martins")).not.toBeInTheDocument(),
    );

    await user.click(screen.getByRole("tab", { name: /Admitted/ }));
    const admitted = await rowOf("Daniel Martins");
    expect(within(admitted).getByText(/Kemi Adewale/)).toBeInTheDocument();
  });

  it("needs a reason to reject, and shows it on the Rejected tab", async () => {
    const { user } = renderWithProviders(<AdmissionRequests />);
    const row = await rowOf("Blessing Okoi");
    await user.click(within(row).getByRole("button", { name: "Reject Blessing Okoi’s admission" }));
    const dialog = await screen.findByRole("dialog", { name: "Reject admission" });
    await user.click(within(dialog).getByRole("button", { name: "Reject request" }));
    expect(
      await within(dialog).findByText("Say why you’re rejecting this request"),
    ).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText(/Reason/), "No beds free in maternity.");
    await user.click(within(dialog).getByRole("button", { name: "Reject request" }));
    expect(
      await screen.findByText("Blessing Okoi’s admission request is rejected."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Rejected/ }));
    const rejected = await rowOf("Blessing Okoi");
    expect(within(rejected).getByText("Reason: No beds free in maternity.")).toBeInTheDocument();
  });
});
