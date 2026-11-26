import { screen, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { AppointmentsCalendar } from "@/features/receptionist/components/appointments-calendar";
import { env } from "@/env";
import { server } from "@/mocks/node";
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

  it("shows the API's numbers for the current week", async () => {
    let period: string | null = null;
    server.use(
      http.get(`${env.VITE_API_URL}/api/hospital-ops/appointments-overview`, ({ request }) => {
        period = new URL(request.url).searchParams.get("period");
        return HttpResponse.json({
          appointments_booked: { count: 11, percent_change: -8.33 },
          in_progress_appointments: 2,
          cancelled_appointments: { count: 3, change: -1 },
        });
      }),
    );
    renderWithProviders(
      <AppointmentsCalendar view="week" date={new Date()} onNavigate={() => {}} />,
    );

    const summary = await screen.findByLabelText("Summary");
    expect(period).toBe("week");
    const card = (label: string) =>
      within(summary).getByText(label, { selector: "dt" }).nextElementSibling;
    expect(card("Booked this week")).toHaveTextContent("11Down8.33%vs. last week");
    expect(card("Checked in")).toHaveTextContent("22 of 11 appointments");
    expect(card("Cancelled")).toHaveTextContent("3Down1 fewervs. last week");
  });

  it("counts another span's numbers from its appointments", async () => {
    const requested = vi.fn();
    server.use(
      http.get(`${env.VITE_API_URL}/api/hospital-ops/appointments-overview`, () => {
        requested();
        return HttpResponse.json({}, { status: 500 });
      }),
    );
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1, 15);
    renderWithProviders(
      <AppointmentsCalendar view="month" date={lastMonth} onNavigate={() => {}} />,
    );

    const summary = await screen.findByLabelText("Summary");
    const booked = within(summary).getByText("Booked this month", { selector: "dt" });
    expect(booked.nextElementSibling).toHaveTextContent(/^\d+Not available yet$/);
    expect(requested).not.toHaveBeenCalled();
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

  it("opens an appointment and reschedules it, keeping the patient's note unless it changed", async () => {
    let sent: unknown = null;
    server.use(
      // Records the request, then lets the mock API answer it.
      http.patch(
        `${env.VITE_API_URL}/api/hospital-ops/appointments/:sqid/reschedule`,
        async ({ request }) => {
          sent = await request.clone().json();
        },
      ),
    );
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const { user } = renderWithProviders(
      <AppointmentsCalendar view="day" date={tomorrow} onNavigate={() => {}} />,
    );

    await user.click(await screen.findByRole("button", { name: /Amina Yusuf, 10:00 AM/ }));
    const details = await screen.findByRole("dialog", { name: "Appointment Details" });
    expect(await within(details).findByText("Booked with")).toBeInTheDocument();
    expect(within(details).getByText("Sarah Adeyemi")).toBeInTheDocument();

    await user.click(within(details).getByRole("button", { name: "Reschedule" }));
    const time = await screen.findByLabelText(/Time/);
    await user.clear(time);
    await user.type(time, "14:00");
    await user.click(screen.getByRole("button", { name: "Reschedule" }));

    const notified = await screen.findByRole("dialog", { name: "Patient Notified!" });
    expect(notified).toHaveTextContent(/Appointment moved to .*2:00 PM/);
    expect(notified).toHaveTextContent("Amina Yusuf has been notified.");
    expect(sent).toEqual({ scheduled_time: expect.any(String) });
  });

  it("checks the cancellation reason, then cancels and sends it", async () => {
    let sent: unknown = null;
    server.use(
      http.post(
        `${env.VITE_API_URL}/api/hospital-ops/appointments/:sqid/cancel`,
        async ({ request }) => {
          sent = await request.clone().json();
        },
      ),
    );
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
      await screen.findByText("Appointment cancelled. Halima Abubakar has been notified."),
    ).toBeInTheDocument();
    expect(sent).toEqual({ cancellation_reason: "Travelling that week" });
  });

  it("confirms a patient's pending booking with the staff member chosen", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const { user } = renderWithProviders(
      <AppointmentsCalendar view="day" date={tomorrow} onNavigate={() => {}} />,
    );

    await user.click(await screen.findByRole("button", { name: /Kelechi Nnamdi/ }));
    const details = await screen.findByRole("dialog", { name: "Appointment Details" });
    const confirmed = (await within(details).findByText("Confirmed")).closest("div");
    expect(confirmed).toHaveTextContent("Not yet");

    await user.click(within(details).getByRole("button", { name: "Confirm" }));
    const dialog = await screen.findByRole("dialog", { name: "Confirm appointment" });
    // Who they booked with, to start with.
    const staff = within(dialog).getByRole("combobox", { name: /Who they’ll see/ });
    expect(await within(staff).findByText("Dr. Sarah Adeyemi · Doctor")).toBeInTheDocument();
    await user.click(staff);
    await pickOption("Dr. Grace Effiong · Doctor");
    await user.click(within(dialog).getByRole("button", { name: "Confirm appointment" }));

    expect(
      await screen.findByText("Kelechi Nnamdi’s appointment is confirmed with Grace Effiong."),
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

  it("starts booking from a free slot, and asks who the patient will see", async () => {
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
    await user.click(within(details).getByRole("combobox", { name: /Who they’ll see/ }));
    await pickOption("Dr. Grace Effiong · Doctor");
    await user.click(within(details).getByRole("button", { name: "Book Appointment" }));
    expect(await screen.findByRole("dialog", { name: "Appointment booked!" })).toBeInTheDocument();
  });

  // TODO(api): desk signup requires a date of birth, which the design's form doesn't ask for, so
  // step 1 shows the API's error until that changes.
  it("registers a walk-in nobody has on file, with their date of birth", async () => {
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
    await user.clear(screen.getByLabelText(/Date of birth/));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(await screen.findByText("Enter a date as DD/MM/YYYY")).toBeInTheDocument();
    await fill(/Date of birth/, "12/04/1990");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // Step 2: the code, sent where the API says (masked).
    expect(
      await screen.findByText("Enter the 6 digit code sent to a***@email.com"),
    ).toBeInTheDocument();
    const code = screen.getByLabelText("Verification code");
    await user.clear(code);
    await user.type(code, "123456");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      await screen.findByRole("dialog", { name: "Contact & account details" }),
    ).toBeInTheDocument();
  });

  it("tells the receptionist when the patient already has an account", async () => {
    const { user } = renderWithProviders(
      <AppointmentsCalendar view="month" date={new Date()} onNavigate={() => {}} />,
    );
    await user.click(await screen.findByRole("button", { name: "New Appointment" }));
    const hin = await screen.findByLabelText(/Enter HIN/);
    await user.clear(hin);
    await user.type(hin, "99999999999");
    await user.click(await screen.findByRole("button", { name: "Register new patient" }));

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
    await fill(/Date of birth/, "12/04/1990");
    await fill(/Email/, "exists@email.com");
    await fill(/Phone Number/, "+2348031112233");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    const code = await screen.findByLabelText("Verification code");
    await user.clear(code);
    await user.type(code, "123456");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      await screen.findByText(
        "e***@email.com already has a DocuHealth account. Find the patient by their HIN instead.",
      ),
    ).toBeInTheDocument();
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
