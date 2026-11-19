import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScanOrderActions } from "@/features/radiologist/components/scan-order-actions";
import { renderWithProviders } from "@/test/render";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const pad = (n: number) => String(n).padStart(2, "0");
const tomorrowText = `${pad(tomorrow.getDate())}/${pad(tomorrow.getMonth() + 1)}/${tomorrow.getFullYear()}`;

describe("BookAppointmentDialog", () => {
  it("finds the patient by HIN, checks the details, then books the scan", async () => {
    const { user } = renderWithProviders(<ScanOrderActions />);
    await user.click(screen.getByRole("button", { name: "Book Appointment" }));

    const find = await screen.findByRole("dialog", { name: "Find patient" });
    const hin = within(find).getByLabelText(/Enter HIN/);
    await user.clear(hin);
    await user.type(hin, "99999999999");
    expect(await within(find).findByText("No HIN result “999-999-999-99”")).toBeInTheDocument();
    expect(within(find).queryByRole("button", { name: "Continue" })).not.toBeInTheDocument();

    // Chidi Okafor, on the mock's schedule.
    await user.clear(hin);
    await user.type(hin, "54145204211");
    expect(await within(find).findByRole("radio", { name: /Chidi Okafor/ })).toBeChecked();
    await user.click(within(find).getByRole("button", { name: "Continue" }));

    const details = await screen.findByRole("dialog", { name: "Appointment Details" });
    expect(within(details).getByText("Chidi Okafor")).toBeInTheDocument();
    const date = within(details).getByLabelText(/Date/);
    await user.clear(date);
    await user.click(within(details).getByRole("button", { name: "Book Appointment" }));
    expect(await within(details).findByText("Enter a date as DD/MM/YYYY")).toBeInTheDocument();

    await user.type(date, tomorrowText);
    const time = within(details).getByLabelText(/Time/);
    await user.clear(time);
    await user.type(time, "09:30");
    await user.click(within(details).getByRole("button", { name: "Book Appointment" }));

    expect(await screen.findByRole("dialog", { name: "Appointment booked!" })).toBeInTheDocument();
  });
});
