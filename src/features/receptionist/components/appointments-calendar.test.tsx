import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppointmentsCalendar } from "@/features/receptionist/components/appointments-calendar";
import { formatLongDate } from "@/lib/format";
import { renderWithProviders } from "@/test/render";

describe("AppointmentsCalendar", () => {
  it("shows today's numbers and appointments, and switches views", async () => {
    const onNavigate = vi.fn();
    const { user } = renderWithProviders(
      <AppointmentsCalendar view="day" date={new Date()} onNavigate={onNavigate} />,
    );

    expect(await screen.findByText("Booked this day")).toBeInTheDocument();
    const table = screen.getByRole("table", { name: /Appointments on/ });
    expect(
      within(table).getByRole("button", { name: /Olumide Ajayi, .*Cancelled/ }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Week" }));
    expect(onNavigate).toHaveBeenCalledWith({ view: "week" });

    await user.click(screen.getByRole("button", { name: "Next day" }));
    expect(onNavigate).toHaveBeenLastCalledWith({ date: expect.any(Date) });
  });

  it("starts a new appointment by finding the patient, and can change them", async () => {
    const { user } = renderWithProviders(
      <AppointmentsCalendar view="month" date={new Date()} onNavigate={() => {}} />,
    );

    await user.click(await screen.findByRole("button", { name: "New Appointment" }));
    const find = await screen.findByRole("dialog", { name: "Find patient" });
    const continueButton = within(find).getByRole("button", { name: "Continue" });
    const hin = within(find).getByLabelText(/Enter HIN/);
    await user.clear(hin);
    expect(continueButton).toBeDisabled();

    await user.type(hin, "12334567890");
    expect(await within(find).findByText("1 match")).toBeInTheDocument();
    expect(within(find).getByRole("radio", { name: /Adeola Williams/ })).toBeChecked();
    await user.click(continueButton);

    const details = await screen.findByRole("dialog", { name: "Appointment Details" });
    expect(within(details).getByText("Adeola Williams")).toBeInTheDocument();

    await user.click(within(details).getByRole("button", { name: "Change" }));
    expect(await screen.findByLabelText(/Enter HIN/)).toHaveValue("123-345-678-90");
  });

  it("opens an appointment, reschedules it and tells the patient", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const { user } = renderWithProviders(
      <AppointmentsCalendar view="day" date={tomorrow} onNavigate={() => {}} />,
    );

    await user.click(await screen.findByRole("button", { name: /Amina Yusuf, 10:00 AM/ }));
    const details = await screen.findByRole("dialog", { name: "Appointment Details" });
    expect(await within(details).findByText("Booked with")).toBeInTheDocument();

    await user.click(within(details).getByRole("button", { name: "Reschedule" }));
    const time = await screen.findByLabelText(/Time/);
    await user.clear(time);
    await user.type(time, "14:00");
    await user.click(screen.getByRole("button", { name: "Reschedule" }));

    expect(await screen.findByRole("dialog", { name: "Patient Notified!" })).toHaveTextContent(
      /moved to .*2:00 PM.*Amina Yusuf has been notified/,
    );
  });

  it("cancels an appointment with a reason and tells the patient", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const { user } = renderWithProviders(
      <AppointmentsCalendar view="day" date={tomorrow} onNavigate={() => {}} />,
    );

    await user.click(await screen.findByRole("button", { name: /Halima Abubakar/ }));
    await user.click(await screen.findByRole("button", { name: "Cancel appointment" }));
    const dialog = await screen.findByRole("dialog", { name: "Cancel appointment?" });

    await user.click(within(dialog).getByRole("radio", { name: "Other" }));
    await user.click(within(dialog).getByRole("button", { name: "Cancel appointment" }));
    expect(
      await within(dialog).findByText("Say why the appointment is being cancelled"),
    ).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText(/Specify reason/), "Travelling that week");
    await user.click(within(dialog).getByRole("button", { name: "Cancel appointment" }));

    expect(await screen.findByRole("dialog", { name: "Patient Notified!" })).toHaveTextContent(
      "Appointment cancelled. Halima Abubakar has been notified.",
    );
  });

  it("goes back to the details from “Keep appointment”", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const { user } = renderWithProviders(
      <AppointmentsCalendar view="day" date={tomorrow} onNavigate={() => {}} />,
    );

    await user.click(await screen.findByRole("button", { name: /Folasade Ojo/ }));
    await user.click(await screen.findByRole("button", { name: "Cancel appointment" }));
    await user.click(await screen.findByRole("button", { name: "Keep appointment" }));

    expect(await screen.findByText("Booked with")).toBeInTheDocument();
  });

  it("adds an appointment from a free slot: find the patient, then book that slot", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const { user } = renderWithProviders(
      <AppointmentsCalendar view="day" date={tomorrow} onNavigate={() => {}} />,
    );

    await user.click(await screen.findByRole("button", { name: /^Book .* at 02:30 PM$/ }));
    const find = await screen.findByRole("dialog", { name: "Find patient" });
    const hin = within(find).getByLabelText(/Enter HIN/);
    await user.clear(hin);
    await user.type(hin, "12334567890");
    await within(find).findByText("1 match");
    await user.click(within(find).getByRole("button", { name: "Continue" }));

    const details = await screen.findByRole("dialog", { name: "Appointment Details" });
    expect(within(details).getByLabelText(/Time/)).toHaveValue("14:30");
    await user.click(within(details).getByRole("button", { name: "Book Appointment" }));

    expect(await screen.findByRole("dialog", { name: "Appointment booked!" })).toBeInTheDocument();
  });

  it("registers a walk-in nobody has on file, then books them", async () => {
    const { user } = renderWithProviders(
      <AppointmentsCalendar view="month" date={new Date()} onNavigate={() => {}} />,
    );

    await user.click(await screen.findByRole("button", { name: "New Appointment" }));
    const hin = await screen.findByLabelText(/Enter HIN/);
    await user.clear(hin);
    await user.type(hin, "99999999999");
    expect(await screen.findByText("No HIN result “999-999-999-99”")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continue" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Register new patient" }));

    // Step 1: who they are.
    await screen.findByRole("dialog", { name: "Patient Information" });
    const fill = async (label: RegExp, value: string) => {
      const field = screen.getByLabelText(label);
      await user.clear(field);
      await user.type(field, value);
    };
    await fill(/First name/, "Ada");
    await fill(/Last name/, "Obi");
    await user.click(screen.getByRole("combobox", { name: /Gender/ }));
    // The list ignores the pointer while it animates open, so click the option directly.
    fireEvent.click(await screen.findByRole("option", { name: "Female" }));
    await fill(/Email/, "ada.obi@email.com");
    await fill(/Phone Number/, "+2348031112233");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // Step 2: the emailed code (the mock accepts 123456).
    await screen.findByRole("dialog", { name: "Verify account" });
    const code = screen.getByLabelText("Verification code");
    await user.clear(code);
    await user.type(code, "123456");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // Step 3: NIN and password.
    await screen.findByRole("dialog", { name: "Contact & account details" });
    await fill(/^NIN/, "12345678901");
    await fill(/^Password/, "Welcome123!");
    await fill(/Confirm Password/, "Welcome123!");
    await user.click(screen.getByRole("button", { name: "Register and Continue" }));

    const details = await screen.findByRole("dialog", { name: "Appointment Details" });
    expect(within(details).getByText("Ada Obi")).toBeInTheDocument();
    expect(within(details).getByRole("button", { name: "Change" })).toBeInTheDocument();
  });

  it("lists each patient's age, sex and HIN, and copies the HIN without opening the appointment", async () => {
    const { user } = renderWithProviders(
      <AppointmentsCalendar view="list" date={new Date()} onNavigate={() => {}} />,
    );

    const today = await screen.findByRole("region", { name: formatLongDate(new Date()) });
    const row = within(today)
      .getByRole("button", { name: /Olumide Ajayi, .*Cancelled/ })
      .closest("li");
    if (!row) throw new Error("No row for Olumide Ajayi");
    expect(within(row).getByText(/^\d+ yrs · Male$/)).toBeInTheDocument();
    expect(within(row).getByText(/^HIN \d{3}-\d{3}-\d{3}-\d{2}$/)).toBeInTheDocument();

    await user.click(within(row).getByRole("button", { name: "Copy HIN" }));
    expect(await within(row).findByRole("button", { name: "HIN copied" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Appointment Details" })).not.toBeInTheDocument();

    await user.click(within(row).getByRole("button", { name: /Olumide Ajayi/ }));
    expect(await screen.findByRole("dialog", { name: "Appointment Details" })).toBeInTheDocument();
  });
});
