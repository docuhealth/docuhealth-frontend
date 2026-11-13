import { screen, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ScanOrderDetails } from "@/features/radiologist/components/scan-order-details";
import { renderWithRouter } from "@/test/render";

// Pending orders in the mock are 1–20; these tests use ones no other test does.

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const pad = (n: number) => String(n).padStart(2, "0");
const tomorrowText = `${pad(tomorrow.getDate())}/${pad(tomorrow.getMonth() + 1)}/${tomorrow.getFullYear()}`;

async function accept(user: UserEvent) {
  await user.click(await screen.findByRole("button", { name: "Accept request" }));
  const confirm = await screen.findByRole("dialog", { name: "Confirm Test Acceptance" });
  await user.click(within(confirm).getByRole("button", { name: "Accept & Log Imaging Time" }));
  return screen.findByRole("dialog", { name: "Imaging Info" });
}

async function logTime(user: UserEvent, dialog: HTMLElement, date: string, time: string) {
  const dateInput = within(dialog).getByLabelText(/Date of imaging/);
  await user.clear(dateInput);
  await user.type(dateInput, date);
  const timeInput = within(dialog).getByLabelText(/Time of imaging/);
  await user.clear(timeInput);
  await user.type(timeInput, time);
  await user.click(within(dialog).getByRole("button", { name: /Submit Entry/ }));
}

describe("AcceptOrderFlow", () => {
  it("accepts an order, logs its imaging time and says it's approved", async () => {
    const { user } = renderWithRouter(<ScanOrderDetails orderId="scan-order-5" />);
    const dialog = await accept(user);
    expect(within(dialog).getByText("Hauwa Garba")).toBeInTheDocument();

    // Not before the doctor asked for it.
    await logTime(user, dialog, "01/01/2020", "10:30");
    expect(
      await within(dialog).findByText("Pick a date from the day it was requested on"),
    ).toBeInTheDocument();

    await logTime(user, dialog, tomorrowText, "10:30");
    const approved = await screen.findByRole("dialog", { name: "Order Approved!" });
    expect(approved).toHaveTextContent(/booked for .*10:30 AM/);
    await user.click(within(approved).getByRole("button", { name: "Done" }));

    expect(await screen.findByRole("button", { name: "Upload test result" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change the imaging time" })).toBeInTheDocument();
  });

  it("leaves the order accepted when the imaging time is put off", async () => {
    const { user } = renderWithRouter(<ScanOrderDetails orderId="scan-order-6" />);
    const dialog = await accept(user);
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    expect(await screen.findByText(/Log the imaging time when it’s set/)).toBeInTheDocument();
    expect(screen.getAllByText("Not scheduled yet")).not.toHaveLength(0);

    // Logged later from the order page.
    await user.click(screen.getByRole("button", { name: "Log the imaging time" }));
    await logTime(
      user,
      await screen.findByRole("dialog", { name: "Imaging Info" }),
      tomorrowText,
      "14:00",
    );
    expect(await screen.findByText("Imaging time saved.")).toBeInTheDocument();

    // Opening it again is an edit of that time.
    await user.click(screen.getByRole("button", { name: "Change the imaging time" }));
    const edit = await screen.findByRole("dialog", { name: "Change imaging time" });
    expect(edit).toHaveTextContent(/Currently booked for: .*2:00 PM/);
    expect(within(edit).getByLabelText(/Time of imaging/)).toHaveValue("14:00");
    await user.clear(within(edit).getByLabelText(/Time of imaging/));
    await user.type(within(edit).getByLabelText(/Time of imaging/), "15:30");
    await user.click(within(edit).getByRole("button", { name: "Save changes" }));
    expect(await screen.findByText("Imaging time updated.")).toBeInTheDocument();
  });
});
