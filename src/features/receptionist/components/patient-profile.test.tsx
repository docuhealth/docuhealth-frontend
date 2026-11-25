import { screen, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { PatientProfile } from "@/features/receptionist/components/patient-profile";
import { env } from "@/env";
import { server } from "@/mocks/node";
import { renderWithRouter } from "@/test/render";

// Adeola Williams (src/mocks/receptionist.ts) for her details; her visit numbers, linked people
// and visits come from the handlers below.

const HIN = "12334567890";
const api = (path: string) => `${env.VITE_API_URL}/api/patients/${HIN}${path}`;

const daysFromNow = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

const hospital = { name: "Lagoon General Hospital", email: null, sqid: "0UdrKQw" };

const appointment = (sqid: string, status: string, at: string, closedAt: string | null = null) => ({
  type: "appointment",
  time: at,
  appointment: {
    id: 1,
    sqid,
    status,
    scheduled_time: at,
    staff: {
      sqid: "KDN3VMb",
      firstname: "Tunde",
      lastname: "Bello",
      role: "doctor",
      specialization: null,
    },
    patient: {
      hin: HIN,
      firstname: "Adeola",
      lastname: "Williams",
      dob: "1990-01-01",
      gender: "female",
    },
    last_visited: null,
    note: null,
    type: "follow-up",
    hospital_info: hospital,
    closed_at: closedAt,
    closed_by_info: null,
  },
  check_in: null,
});

const checkIn = (sqid: string, at: string, closedAt: string | null) => ({
  type: "check-in",
  time: at,
  appointment: null,
  check_in: {
    sqid,
    status: closedAt ? "closed" : "nursing_active",
    hospital_info: hospital,
    patient_info: {
      hin: HIN,
      firstname: "Adeola",
      lastname: "Williams",
      gender: "female",
      dob: "1990-01-01",
    },
    created_at: at,
    escalated_at: null,
    closed_at: closedAt,
  },
});

const page = (results: unknown[]) =>
  HttpResponse.json({ count: results.length, next: null, previous: null, results });

function serve({
  email,
  acctType,
  linked,
}: {
  email: string | null;
  acctType: string;
  linked: unknown[];
}) {
  const lastCheckIn = daysFromNow(-2);
  server.use(
    http.get(api("/visit-metrics"), () =>
      HttpResponse.json({
        total_visits: 3,
        last_visit: lastCheckIn,
        last_check_in: lastCheckIn,
        upcoming_appointment: {
          sqid: "Bwv5MFJ",
          status: "pending",
          scheduled_time: daysFromNow(3),
        },
        patient_info: {
          firstname: "Adeola",
          lastname: "Williams",
          dob: "1990-01-01",
          gender: "female",
          hin: HIN,
          phone_num: "08034567890",
          email,
          acct_type: acctType,
        },
      }),
    ),
    http.get(api("/guardianship"), () => page(linked)),
    http.get(api("/visits"), () =>
      page([
        // Booked, not yet a visit.
        appointment("Bwv5MFJ", "pending", daysFromNow(3)),
        checkIn("KNm960Z", lastCheckIn, daysFromNow(-1.9)),
        appointment("Xy7pQ2r", "completed", daysFromNow(-10), daysFromNow(-9.9)),
        // Cancelled, so not a visit either.
        appointment("Cn5tLd0", "cancelled", daysFromNow(-20)),
      ]),
    ),
  );
}

/** The value and note of the stat card labelled `label`. */
function statCard(label: string) {
  return screen.getByText(label, { selector: "dt" }).nextElementSibling as HTMLElement;
}

describe("PatientProfile", () => {
  it("shows the visit numbers, payment type, dependants and visit history", async () => {
    serve({
      email: "adeola.williams@email.com",
      acctType: "hmo",
      linked: [
        {
          sqid: "DugImRQ",
          hin: "7894623012343",
          firstname: "Chidi",
          lastname: "Okafor",
          dob: "2015-06-01",
          gender: "male",
          last_visit: "2026-11-25T10:14:08.081427Z",
        },
      ],
    });
    renderWithRouter(<PatientProfile patientId={HIN} />);

    expect(await screen.findByRole("heading", { name: "Adeola Williams" })).toBeInTheDocument();
    expect(screen.getByText("HMO Patient")).toBeInTheDocument();
    expect(screen.queryByText("Dependent")).not.toBeInTheDocument();
    expect(statCard("Total visits")).toHaveTextContent("3Check-ins and appointments here");
    expect(statCard("Last Check-in")).toHaveTextContent("Checked out");
    expect(statCard("Upcoming Appointment")).toHaveTextContent("Awaiting confirmation");

    const dependants = screen.getByRole("list", { name: "Dependent Account" });
    expect(within(dependants).getByText("Chidi Okafor")).toBeInTheDocument();
    expect(within(dependants).getByText("25 Nov, 2026")).toBeInTheDocument();

    // The check-in and the completed appointment; not the pending or cancelled ones.
    expect(screen.getByRole("tab", { name: /All Visits.*2/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Check-Ins.*1/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Appointments.*1/ })).toBeInTheDocument();
  });

  it("lists a dependant's guardians as their proxies", async () => {
    serve({
      email: null,
      acctType: "company",
      linked: [
        {
          sqid: "uYFaLoS",
          hin: "DH12345678",
          firstname: "Amaka",
          lastname: "Okafor",
          dob: "1988-04-12",
          gender: "female",
          last_visit: null,
        },
      ],
    });
    renderWithRouter(<PatientProfile patientId={HIN} />);

    expect(await screen.findByText("Dependent")).toBeInTheDocument();
    // `company` has no label in the design.
    expect(screen.queryByText(/Patient$/, { selector: "span" })).not.toBeInTheDocument();
    const proxies = screen.getByRole("list", { name: "Proxy Account" });
    expect(within(proxies).getByText("Amaka Okafor")).toBeInTheDocument();
    // TODO(api): the relationship isn't returned.
    expect(within(proxies).getAllByText("—")).toHaveLength(1);
  });

  it("works with the mock API's own records", async () => {
    // Samuel Williams (src/mocks/patient-records.ts): a child of Adeola and Tunde Williams.
    renderWithRouter(<PatientProfile patientId="12334567891" />);

    expect(await screen.findByText("Dependent")).toBeInTheDocument();
    expect(statCard("Total visits")).toHaveTextContent("5");
    const proxies = screen.getByRole("list", { name: "Proxy Account" });
    expect(within(proxies).getByText("Adeola Williams")).toBeInTheDocument();
    expect(within(proxies).getByText("Tunde Williams")).toBeInTheDocument();
  });
});
