import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppointmentsCalendar } from "@/features/receptionist/components/appointments-calendar";
import { formatLongDate } from "@/lib/format";
import { pickOption, renderWithProviders } from "@/test/render";

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

  // TODO(api): no reschedule endpoint yet, so the dialog says so instead of notifying the patient.
  it("opens an appointment and says rescheduling isn't available yet", async () => {
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

    expect(
      await screen.findByText(/Rescheduling appointments isn’t available yet/),
    ).toBeInTheDocument();
  });

  // TODO(api): no cancel endpoint yet, so the reason is checked and then the dialog says so.
  it("checks the cancellation reason, then says cancelling isn't available yet", async () => {
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

    expect(
      await screen.findByText(/Cancelling appointments isn’t available yet/),
    ).toBeInTheDocument();
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

  // TODO(api): the API requires the staff member it's with, which the design doesn't ask for, so
  // booking shows the API's error until that changes.
  it("starts booking from a free slot, and shows the API's error", async () => {
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

    expect(await screen.findByText("staff: This field is required.")).toBeInTheDocument();
  });

  // TODO(api): desk signup requires a date of birth, which the design's form doesn't ask for, so
  // step 1 shows the API's error until that changes.
  it("starts registering a walk-in nobody has on file, and shows the API's error", async () => {
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
    await pickOption("Female");
    await fill(/Email/, "ada.obi@email.com");
    await fill(/Phone Number/, "+2348031112233");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(await screen.findByText("dob: This field is required.")).toBeInTheDocument();
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
