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
import { renderWithRouter } from "@/test/render";

// The API's appointments come from src/mocks/patient.ts (Dr. Isaac Adeyemi soon, Dr. Adaeze
// Okafor in 20 days). The extras are TODO(api) and empty off the mock dev server, so they're
// handed to the pending queries here; the actions aren't mocked, so they fail as they would on
// staging ("… isn't available yet").
const pending = vi.hoisted(() => ({
  extras: { bookings: [], details: [] } as unknown,
  slots: [] as string[],
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
  status: null,
  at: null,
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
  bookings: [
    {
      id: "appt-eye",
      status: "pending",
      at: daysFromNow(5, 14),
      type: "Follow-up",
      clinician: null,
      facility: "Reddington Hospital",
    },
    {
      id: "appt-past",
      status: "cancelled",
      at: daysFromNow(-20),
      type: "Follow-up",
      clinician: { name: "Dr. Adaeze Okafor", specialty: "Internal Medicine" },
      facility: "ABC Hospital",
    },
  ],
  details: [
    detail("appt-2", {
      department: "Internal Medicine",
      clinicianRole: "Consultant Physician",
      facilityAddress: "14 Obafemi Awolowo Way, Ikeja, Lagos",
    }),
    detail("appt-eye", { department: "Ophthalmology", reason: "Eye check" }),
    detail("appt-past", {
      department: "Internal Medicine",
      cancellation: {
        at: daysFromNow(-36),
        reason: "I can’t make that time",
        fee: 0,
        sentTo: "•••• 4821",
      },
    }),
  ],
};

beforeEach(() => {
  pending.extras = { bookings: [], details: [] };
  pending.slots = [];
  useAuthStore.getState().setSession({
    accessToken: "token",
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
    expect(within(eye).getByRole("button", { name: "Confirm attendance" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Upcoming (3)" })).toBeInTheDocument();

    await user.type(screen.getByRole("searchbox", { name: "Search appointments" }), "eye");
    expect(screen.queryByRole("article", { name: "Dr. Adaeze Okafor" })).not.toBeInTheDocument();
    await user.clear(screen.getByRole("searchbox", { name: "Search appointments" }));

    await user.click(screen.getByRole("tab", { name: "Past (1)" }));
    expect(screen.getByRole("article", { name: "Dr. Adaeze Okafor" })).toHaveTextContent(
      "Cancelled",
    );
  });

  it("offers free times to reschedule, and says it can't be done yet off the mock server", async () => {
    pending.extras = demoExtras;
    pending.slots = ["10:30", "14:30"];
    const { user } = renderWithRouter(<AppointmentsPage />);
    const okafor = await screen.findByRole("article", { name: "Dr. Adaeze Okafor" });
    await user.click(within(okafor).getByRole("button", { name: "Reschedule" }));
    const dialog = await screen.findByRole("dialog", { name: "Pick a new date and time" });
    expect(within(dialog).getByText("Morning")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "10:30 AM" }));
    await user.click(within(dialog).getByRole("button", { name: /^Confirm .*10:30 AM/ }));
    expect(await screen.findByText(/Rescheduling isn’t available yet/)).toBeInTheDocument();
  });
});

describe("Appointment detail", () => {
  it("shows a pending appointment's place, details and reminders", async () => {
    pending.extras = demoExtras;
    renderWithRouter(<AppointmentDetails appointmentId="appt-eye" />);
    expect(await screen.findByRole("heading", { name: "Appointment pending" })).toBeInTheDocument();
    expect(screen.getByText(/We’ll see you at Reddington Hospital on/)).toBeInTheDocument();
    expect(screen.getByText("Not assigned yet")).toBeInTheDocument();
    const details = screen.getByLabelText("Details");
    expect(details).toHaveTextContent("Follow-up · Ophthalmology clinic");
    expect(details).toHaveTextContent("Reddington Hospital, Ikeja · Clinic 3");
    expect(screen.getByRole("region", { name: "Reminders on" })).toHaveTextContent(
      "We’ll remind you 1 day before by push and SMS, and 2 hours before by push.",
    );
    expect(screen.getByRole("button", { name: "Cancel booking" })).toBeInTheDocument();
  });

  it("asks why before cancelling, and offers a message and directions", async () => {
    pending.extras = demoExtras;
    const { user } = renderWithRouter(<AppointmentDetails appointmentId="appt-2" />);
    expect(await screen.findByText("Consultant Physician · Internal Medicine")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Message" })).toHaveAttribute(
      "href",
      "/patient/messages",
    );
    expect(screen.getByRole("link", { name: "Get directions" })).toHaveAttribute(
      "href",
      expect.stringContaining("google.com/maps"),
    );
    await user.click(screen.getByRole("button", { name: "Cancel booking" }));
    const dialog = await screen.findByRole("dialog", { name: "Cancel appointment?" });
    await user.click(within(dialog).getByRole("radio", { name: "I can’t make that time" }));
    await user.click(within(dialog).getByRole("button", { name: "Cancel appointment" }));
    expect(await screen.findByText(/Cancelling isn’t available yet/)).toBeInTheDocument();
  });

  it("sums up a cancelled one and offers to book again", async () => {
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
