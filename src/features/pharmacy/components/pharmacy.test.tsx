import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PharmacyDashboard } from "@/features/pharmacy/components/pharmacy-dashboard";
import { PrescriptionDetails } from "@/features/pharmacy/components/prescription-details";
import { Prescriptions } from "@/features/pharmacy/components/prescriptions";
import { renderWithRouter } from "@/test/render";

// The mock: rx-1 and rx-2 pending (rx-1 with two drugs and a penicillin allergy), rx-3 and rx-4
// settled (rx-4 with one drug unavailable).

/** The table row for `name` (found even while a dialog hides the page from assistive tech). */
async function rowOf(name: string | RegExp) {
  const table = await screen.findByRole("table", { hidden: true });
  return (await within(table).findByText(name)).closest("tr")!;
}

describe("PharmacyDashboard", () => {
  it("shows the prescriptions waiting, drugs dispensed and recent patients", async () => {
    renderWithRouter(<PharmacyDashboard />);
    const pending = (await screen.findByText("Pending prescriptions")).closest(
      "div",
    )!.parentElement!;
    expect(pending).toHaveTextContent("2");
    expect(
      await screen.findByRole("table", { name: /Dispensed drugs/ }, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Ibrahim Lawal")).toBeInTheDocument();
  });
});

describe("Prescriptions", () => {
  it("lists pending prescriptions, then settled ones", async () => {
    const { user } = renderWithRouter(<Prescriptions />);
    const row = await rowOf("Daniel Martins");
    expect(within(row).getByText("2 medications")).toBeInTheDocument();
    expect(within(row).getByText("Amoxicillin, Paracetamol")).toBeInTheDocument();
    expect(within(row).getByText("Dr. Raphael Jonnas")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Settled/ }));
    const settled = await rowOf("Fatima Bello");
    expect(within(settled).getByText("Partly dispensed")).toBeInTheDocument();
  });
});

describe("PrescriptionDetails", () => {
  it("shows the drugs, allergies and vitals", async () => {
    renderWithRouter(<PrescriptionDetails prescriptionId="rx-1" />);
    const row = await rowOf("Amoxicillin");
    expect(within(row).getByText("Three times daily")).toBeInTheDocument();
    expect(within(row).getByText("5 days")).toBeInTheDocument();
    expect(screen.getByText("Penicillin")).toBeInTheDocument();
    expect(screen.getByText("120/80")).toBeInTheDocument();
  });

  it("dispenses one drug and marks the other unavailable with a reason", async () => {
    const { user } = renderWithRouter(<PrescriptionDetails prescriptionId="rx-1" />);
    await rowOf("Amoxicillin");
    expect(screen.getByRole("button", { name: /Mark dispensed/ })).toBeDisabled();

    await user.click(screen.getByRole("checkbox", { name: "Select Amoxicillin" }));
    await user.click(screen.getByRole("button", { name: /Mark dispensed/ }));
    let dialog = await screen.findByRole("dialog", { name: "Mark dispensed" });
    await user.click(within(dialog).getByRole("button", { name: "Mark dispensed" }));
    expect(await screen.findByText("Amoxicillin is dispensed.")).toBeInTheDocument();
    await waitFor(async () =>
      expect(within(await rowOf("Amoxicillin")).getByText("Dispensed")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("checkbox", { name: "Select Paracetamol" }));
    await user.click(screen.getByRole("button", { name: /Mark unavailable/ }));
    dialog = await screen.findByRole("dialog", { name: "Mark unavailable" });
    await user.type(within(dialog).getByLabelText(/Reason/), "Out of stock until Friday");
    await user.click(within(dialog).getByRole("button", { name: "Mark unavailable" }));
    expect(await screen.findByText("Paracetamol is marked unavailable.")).toBeInTheDocument();
    expect(
      await within(await rowOf("Paracetamol")).findByText("Out of stock until Friday"),
    ).toBeInTheDocument();
    // Nothing's left to dispense.
    expect(
      await screen.findByText("Every drug has been dispensed or marked unavailable."),
    ).toBeInTheDocument();
  });
});
