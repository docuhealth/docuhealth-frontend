import { screen, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as Pending from "@/features/patient/api/pending-appointments";
import type { AppointmentExtras } from "@/features/patient/api/pending-appointments";
import { AppointmentDetails } from "@/features/patient/components/appointment-details";
import { AppointmentsPage } from "@/features/patient/components/appointments-page";
import { env } from "@/env";
import { server } from "@/mocks/node";
import { useAuthStore } from "@/stores/auth-store";
import { pickOption, renderWithRouter } from "@/test/render";

// The API's appointments come from src/mocks/patient.ts (Dr. Isaac Adeyemi soon, Dr. Adaeze
// Okafor in 20 days, a pending eye clinic visit at Reddington Hospital, and a cancelled one), and
// booking, rescheduling and cancelling from src/mocks/patient-appointments.ts. A hospital's staff
// list is set per test. The extras and free times are TODO(api) and empty off the mock dev server,
// so they're handed to the pending queries here.
const pending = vi.hoisted(() => ({
  extras: { details: [] } as unknown,
  slots: [] as string[],
  /** `GET /api/hospital-ops/<hospital>/staff` rows. */
  staff: [] as {
    sqid: string;
    firstname: string;
    lastname: string;
    role: string;
    specialization: string | null;
  }[],
}));

vi.mock("@/features/patient/api/pending-appointments", async (importOriginal) => {
  const actual = await importOriginal<typeof Pending>();
  return {
    ...actual,
    appointmentExtrasQuery: () => ({
      ...actual.appointmentExtrasQuery(),
      queryFn: () => Promise.resolve(pending.extras as AppointmentExtras),
    }),
    slotsQuery: (facility: string, day: string) => ({
      ...actual.slotsQuery(facility, day),
      queryFn: () => Promise.resolve(pending.slots),
    }),
  };
});

const daysFromNow = (days: number, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const detail = (appointmentId: string, fields: object) => ({
  appointmentId,
  department: null,
  reason: null,
  clinicianRole: null,
  clinicianPhoto: null,
  facilityArea: "Ikeja",
  facilityAddress: null,
  facilityPhoto: null,
  clinic: "Clinic 3",
  minutes: 30,
  fee: 15000,
  reminders: [
    { before: "1 day before", channels: "Push and SMS" },
    { before: "2 hours before", channels: "Push" },
  ],
  cancellation: null,
  ...fields,
});

const demoExtras = {
  details: [
    detail("appt-2", {
      department: "Internal Medicine",
      clinicianRole: "Consultant Physician",
      facilityAddress: "14 Obafemi Awolowo Way, Ikeja, Lagos",
    }),
    detail("appt-eye", { department: "Ophthalmology", reason: "Eye check" }),
    detail("appt-past", {
      department: "Internal Medicine",
      cancellation: { at: daysFromNow(-36), fee: 0, sentTo: "•••• 4821" },
    }),
  ],
};

/** Records what the app sends to `path`, then lets the mock API answer. */
function recordBody(method: "post" | "patch", path: string) {
  const sent: { body: unknown } = { body: null };
  server.use(
    http[method](`${env.VITE_API_URL}${path}`, async ({ request }) => {
      sent.body = await request.clone().json();
    }),
  );
  return sent;
}

beforeEach(() => {
  pending.extras = { details: [] };
  pending.slots = [];
  pending.staff = [];
  server.use(
    http.get(`${env.VITE_API_URL}/api/hospital-ops/:hospital/staff`, () =>
      HttpResponse.json({
        count: pending.staff.length,
        next: null,
        previous: null,
        results: pending.staff,
      }),
    ),
  );
  useAuthStore.getState().setSession({
    accountType: "patient",
    actingAs: [{ as: "self" }],
    user: {
      id: "me",
      name: "Chinonso Okafor",
      email: "c@example.com",
      role: "patient",
      hin: "1234567890123",
    },
  });
});

describe("Appointments", () => {
  it("says nothing is booked yet and offers to book", async () => {
    server.use(
      http.get(`${env.VITE_API_URL}/api/hospital-ops/appointments/mine`, () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] }),
      ),
    );
    renderWithRouter(<AppointmentsPage />);
    expect(await screen.findByText("No appointments yet")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Upcoming (0)" })).toBeInTheDocument();
    expect(
      screen.getByText("Your upcoming appointments will appear here once you book one."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Book an appointment" })).toBeInTheDocument();
  });

  it("lists upcoming ones with what can be done, and cancelled ones under Past", async () => {
    pending.extras = demoExtras;
    const { user } = renderWithRouter(<AppointmentsPage />);
    const okafor = await screen.findByRole("article", { name: "Dr. Adaeze Okafor" });
    expect(okafor).toHaveTextContent("Internal Medicine · ABC Hospital, Ikeja");
    expect(okafor).toHaveTextContent("Confirmed");
    expect(within(okafor).getByRole("button", { name: "Reschedule" })).toBeInTheDocument();
    expect(within(okafor).getByRole("link", { name: "View details" })).toHaveAttribute(
      "href",
      "/patient/appointments/appt-2",
    );

    const eye = screen.getByRole("article", { name: "Ophthalmology clinic" });
    expect(eye).toHaveTextContent("Eye check · Reddington Hospital, Ikeja");
    expect(eye).toHaveTextContent("Pending");
    // TODO(api): no patient endpoint to confirm attendance; it says so off the mock server.
    await user.click(within(eye).getByRole("button", { name: "Confirm attendance" }));
    expect(
      await screen.findByText(/Confirming attendance isn’t available yet/),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Upcoming (3)" })).toBeInTheDocument();

    await user.type(screen.getByRole("searchbox", { name: "Search appointments" }), "eye");
    expect(screen.queryByRole("article", { name: "Dr. Adaeze Okafor" })).not.toBeInTheDocument();
    await user.clear(screen.getByRole("searchbox", { name: "Search appointments" }));

    await user.click(screen.getByRole("tab", { name: "Past (1)" }));
    expect(screen.getByRole("article", { name: "Dr. Adaeze Okafor" })).toHaveTextContent(
      "Cancelled",
    );
  });

  it("books at a facility with someone there, and says the facility will confirm it", async () => {
    pending.slots = ["10:30", "14:30"];
    pending.staff = [
      {
        sqid: "staff-bello",
        firstname: "Tunde",
        lastname: "Bello",
        role: "doctor",
        specialization: "General Medicine",
      },
    ];
    const sent = recordBody("post", "/api/hospital-ops/appointments/request");
    const { user } = renderWithRouter(<AppointmentsPage />);
    await user.click(await screen.findByRole("button", { name: "Book appointment" }));

    const details = await screen.findByRole("dialog", { name: "Book appointment" });
    await user.click(within(details).getByRole("button", { name: "Continue" }));
    expect(
      await within(details).findByText("Choose where you’d like to be seen"),
    ).toBeInTheDocument();
    await user.click(within(details).getByRole("combobox", { name: /Where would you like/ }));
    await pickOption("ABC Hospital");
    await user.click(within(details).getByRole("button", { name: "Continue" }));
    expect(await within(details).findByText("Choose who you’d like to see")).toBeInTheDocument();
    await user.click(within(details).getByRole("combobox", { name: /Who would you like/ }));
    await pickOption("Dr. Tunde Bello · General Medicine");
    await user.type(within(details).getByLabelText("Note"), "Knee pain");
    await user.click(within(details).getByRole("button", { name: "Continue" }));

    const time = await screen.findByRole("dialog", { name: "Pick a date and time" });
    // Next week, so the time is in the future whatever the time now.
    await user.click(within(time).getByRole("button", { name: "Next week" }));
    await user.click(within(time).getByRole("button", { name: "10:30 AM" }));
    await user.click(within(time).getByRole("button", { name: /^Confirm .*10:30 AM/ }));

    const done = await screen.findByRole("dialog", { name: "You’re booked!" });
    expect(done).toHaveTextContent(
      "ABC Hospital will confirm your appointment. Until then it shows as pending.",
    );
    expect(sent.body).toEqual({
      hospital: "hosp-abc",
      staff: "staff-bello",
      scheduled_time: expect.any(String),
      note: "Knee pain",
    });
  });

  it("won't go on when no one at the hospital can be booked", async () => {
    const { user } = renderWithRouter(<AppointmentsPage />);
    await user.click(await screen.findByRole("button", { name: "Book appointment" }));
    const details = await screen.findByRole("dialog", { name: "Book appointment" });
    await user.click(within(details).getByRole("combobox", { name: /Where would you like/ }));
    await pickOption("LUTH");
    expect(
      await within(details).findByText(/No one at this hospital can be booked yet. Try another/),
    ).toBeInTheDocument();
    await user.click(within(details).getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("dialog", { name: "Book appointment" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Pick a date and time" })).not.toBeInTheDocument();
  });

  it("reschedules a confirmed one, which goes back to pending", async () => {
    pending.extras = demoExtras;
    pending.slots = ["10:30", "14:30"];
    const sent = recordBody("patch", "/api/hospital-ops/appointments/:sqid/reschedule");
    const { user } = renderWithRouter(<AppointmentsPage />);
    const okafor = await screen.findByRole("article", { name: "Dr. Adaeze Okafor" });
    await user.click(within(okafor).getByRole("button", { name: "Reschedule" }));
    const dialog = await screen.findByRole("dialog", { name: "Pick a new date and time" });
    await user.click(within(dialog).getByRole("button", { name: "Next week" }));
    expect(within(dialog).getByText("Morning")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "10:30 AM" }));
    await user.click(within(dialog).getByRole("button", { name: /^Confirm .*10:30 AM/ }));

    const done = await screen.findByRole("dialog", { name: "You’re rescheduled!" });
    expect(done).toHaveTextContent(
      "ABC Hospital will confirm the new time. Until then it shows as pending.",
    );
    // The booking's note isn't sent, so it stays as it was.
    expect(sent.body).toEqual({ scheduled_time: expect.any(String) });
  });
});

describe("Appointment detail", () => {
  it("shows a pending appointment's place, details, note and reminders", async () => {
    pending.extras = demoExtras;
    renderWithRouter(<AppointmentDetails appointmentId="appt-eye" />);
    expect(await screen.findByRole("heading", { name: "Appointment pending" })).toBeInTheDocument();
    expect(screen.getByText(/We’ll see you at Reddington Hospital on/)).toBeInTheDocument();
    expect(screen.getByText("Not assigned yet")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Waiting for the facility" })).toHaveTextContent(
      "Reddington Hospital will confirm this appointment and who you’ll see.",
    );
    const details = screen.getByLabelText("Details");
    expect(details).toHaveTextContent("Follow-up · Ophthalmology clinic");
    expect(details).toHaveTextContent("Reddington Hospital, Ikeja · Clinic 3");
    expect(details).toHaveTextContent("My eyes have been watering for two weeks.");
    expect(screen.getByRole("region", { name: "Reminders on" })).toHaveTextContent(
      "We’ll remind you 1 day before by push and SMS, and 2 hours before by push.",
    );
    expect(screen.getByRole("button", { name: "Cancel booking" })).toBeInTheDocument();
  });

  it("asks why before cancelling, sends the reason, and sums it up", async () => {
    pending.extras = demoExtras;
    const sent = recordBody("post", "/api/hospital-ops/appointments/:sqid/cancel");
    const { user } = renderWithRouter(<AppointmentDetails appointmentId="appt-1" />);
    expect(await screen.findByRole("link", { name: "Message" })).toHaveAttribute(
      "href",
      "/patient/messages",
    );
    await user.click(screen.getByRole("button", { name: "Cancel booking" }));
    const dialog = await screen.findByRole("dialog", { name: "Cancel appointment?" });
    await user.click(within(dialog).getByRole("radio", { name: "I feel better" }));
    await user.click(within(dialog).getByRole("button", { name: "Cancel appointment" }));
    expect(await screen.findByText("Your appointment is cancelled.")).toBeInTheDocument();
    expect(sent.body).toEqual({ cancellation_reason: "I feel better" });

    expect(
      await screen.findByRole("heading", { name: "Appointment cancelled" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Summary")).toHaveTextContent("I feel better");
  });

  it("offers a message and directions for a confirmed one", async () => {
    pending.extras = demoExtras;
    renderWithRouter(<AppointmentDetails appointmentId="appt-2" />);
    expect(await screen.findByText("Consultant Physician · Internal Medicine")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get directions" })).toHaveAttribute(
      "href",
      expect.stringContaining("google.com/maps"),
    );
  });

  it("sums up a cancelled one, with the API's reason, and offers to book again", async () => {
    pending.extras = demoExtras;
    renderWithRouter(<AppointmentDetails appointmentId="appt-past" />);
    expect(
      await screen.findByRole("heading", { name: "Appointment cancelled" }),
    ).toBeInTheDocument();
    const summary = screen.getByLabelText("Summary");
    expect(summary).toHaveTextContent("I can’t make that time");
    expect(summary).toHaveTextContent("None");
    expect(screen.getByRole("region", { name: "Confirmation sent" })).toHaveTextContent(
      "•••• 4821",
    );
    expect(screen.getByRole("button", { name: "Book again" })).toBeInTheDocument();
  });

  it("says when there's no such appointment", async () => {
    renderWithRouter(<AppointmentDetails appointmentId="nope" />);
    expect(await screen.findByText("Appointment not found")).toBeInTheDocument();
  });
});
