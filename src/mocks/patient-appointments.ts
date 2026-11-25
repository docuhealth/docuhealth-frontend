import { HttpResponse, http } from "msw";
import { env } from "@/env";

const api = (path: string) => `${env.VITE_API_URL}/api/pending/patient/appointments${path}`;

// TODO(api): demo data and actions for the patient's appointments beyond what the API serves
// (src/features/patient/api/pending-appointments.ts). Only the mock dev server asks for these.
// "appt-1" and "appt-2" are the demo patient's appointments in src/mocks/patient.ts; the
// bookings here are ones the patient made themselves: a pending eye clinic at Reddington Hospital
// and a cancelled visit in the past. Booking, rescheduling, cancelling and confirming change this
// in memory until the page reloads. 9:00 AM is always "just taken", to show that error.

const daysAgo = (days: number, hour = 10, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};
const daysAhead = (days: number, hour = 10, minute = 0) => daysAgo(-days, hour, minute);

const reminders = [
  { before: "1 day before", channels: "Push and SMS" },
  { before: "2 hours before", channels: "Push" },
];

const facilities = [
  {
    id: "hosp-abc",
    name: "ABC Hospital",
    area: "Ikeja",
    address: "14 Obafemi Awolowo Way, Ikeja, Lagos",
    fee: 15000,
  },
  {
    id: "hosp-red",
    name: "Reddington Hospital",
    area: "Ikeja",
    address: "12 Idowu Martins Street, Victoria Island, Lagos",
    fee: 20000,
  },
  {
    id: "hosp-luth",
    name: "LUTH",
    area: "Idi-Araba",
    address: "Ishaga Road, Idi-Araba, Lagos",
    fee: 8000,
  },
];
const [abc, reddington] = facilities as [(typeof facilities)[number], (typeof facilities)[number]];

type Detail = {
  appointmentId: string;
  status: string | null;
  at: string | null;
  department: string | null;
  reason: string | null;
  clinicianRole: string | null;
  clinicianPhoto: string | null;
  facilityArea: string | null;
  facilityAddress: string | null;
  facilityPhoto: string | null;
  clinic: string | null;
  minutes: number | null;
  fee: number | null;
  reminders: { before: string; channels: string }[];
  cancellation: {
    at: string;
    reason: string | null;
    fee: number | null;
    sentTo: string | null;
  } | null;
};

const detail = (
  appointmentId: string,
  facility: (typeof facilities)[number],
  fields: Partial<Detail>,
): Detail => ({
  appointmentId,
  status: null,
  at: null,
  department: null,
  reason: null,
  clinicianRole: null,
  clinicianPhoto: null,
  facilityArea: facility.area,
  facilityAddress: facility.address,
  facilityPhoto: null,
  clinic: "Clinic 3",
  minutes: 30,
  fee: facility.fee,
  reminders,
  cancellation: null,
  ...fields,
});

type Booking = {
  id: string;
  status: string | null;
  at: string;
  type: string | null;
  clinician: { name: string; specialty: string | null } | null;
  facility: string | null;
};

const bookings: Booking[] = [
  {
    id: "appt-eye",
    status: "pending",
    at: daysAhead(5, 14, 30),
    type: "Follow-up",
    clinician: null,
    facility: reddington.name,
  },
  {
    id: "appt-past",
    status: "cancelled",
    at: daysAgo(20, 10),
    type: "Follow-up",
    clinician: { name: "Dr. Adaeze Okafor", specialty: "Internal Medicine" },
    facility: abc.name,
  },
];

const details: Detail[] = [
  detail("appt-1", abc, {
    department: "Internal Medicine",
    reason: "Blood pressure review",
    clinicianRole: "Consultant Physician",
  }),
  detail("appt-2", abc, {
    department: "Internal Medicine",
    reason: "Blood pressure review",
    clinicianRole: "Consultant Physician",
  }),
  detail("appt-eye", reddington, { department: "Ophthalmology", reason: "Eye check" }),
  detail("appt-past", abc, {
    department: "Internal Medicine",
    reason: "Check-up",
    clinicianRole: "Consultant Physician",
    // The confirmation went by SMS to the demo patient's phone.
    cancellation: {
      at: daysAgo(36, 9, 14),
      reason: "I can’t make that time",
      fee: 0,
      sentTo: "•••• 4821",
    },
  }),
];

const options = {
  facilities: facilities.map(({ id, name, area }) => ({ id, name, area })),
  departments: [
    "General Practice",
    "Internal Medicine",
    "Ophthalmology",
    "Paediatrics",
    "Obstetrics & Gynaecology",
    "Dental",
  ],
  reasons: ["Check-up", "Follow-up", "New symptoms", "Test results", "Prescription refill"],
};

const TIMES = ["09:00", "09:30", "10:30", "11:00", "11:30", "12:30", "13:00", "14:30"];
const TAKEN = "09:00";

const taken = () =>
  HttpResponse.json(
    { code: "slot_taken", message: "That time is no longer free." },
    { status: 409 },
  );
const isTaken = (at: string) => {
  const date = new Date(at);
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return time === TAKEN;
};

const detailOf = (id: string) => details.find((each) => each.appointmentId === id);

/** The detail for `id`, made if it's an appointment this file didn't know about. */
function ensureDetail(id: string) {
  let found = detailOf(id);
  if (!found) {
    found = detail(id, abc, {});
    details.push(found);
  }
  return found;
}

export const patientAppointmentHandlers = [
  http.get(api(""), () => HttpResponse.json({ bookings, details })),
  http.get(api("/options"), () => HttpResponse.json(options)),
  http.get(api("/slots"), ({ request }) => {
    const day = new URL(request.url).searchParams.get("day") ?? "";
    const date = new Date(`${day}T00:00`);
    // Closed on Sundays.
    if (Number.isNaN(date.getTime()) || date.getDay() === 0) return HttpResponse.json([]);
    const now = Date.now();
    return HttpResponse.json(
      TIMES.filter((time) => new Date(`${day}T${time}`).getTime() > now + 30 * 60_000),
    );
  }),

  http.post(api(""), async ({ request }) => {
    const body = (await request.json()) as {
      facilityId: string;
      department: string;
      reason: string;
      at: string;
    };
    if (isTaken(body.at)) return taken();
    const facility = facilities.find((each) => each.id === body.facilityId) ?? abc;
    const appointment: Booking = {
      id: `appt-${Date.now()}`,
      status: "pending",
      at: body.at,
      type: body.reason,
      clinician: null,
      facility: facility.name,
    };
    const booked = detail(appointment.id, facility, {
      department: body.department,
      reason: body.reason,
    });
    bookings.push(appointment);
    details.push(booked);
    return HttpResponse.json({ appointment, detail: booked }, { status: 201 });
  }),

  http.post(api("/:id/reschedule"), async ({ params, request }) => {
    const { at } = (await request.json()) as { at: string };
    if (isTaken(at)) return taken();
    const id = String(params.id);
    const found = ensureDetail(id);
    found.at = at;
    const booking = bookings.find((each) => each.id === id);
    if (booking) booking.at = at;
    const appointment = booking ?? {
      id,
      status: "confirmed",
      at,
      type: null,
      clinician: null,
      facility: abc.name,
    };
    return HttpResponse.json({ appointment, detail: found });
  }),

  http.post(api("/:id/cancel"), async ({ params, request }) => {
    const { reason } = (await request.json()) as { reason: string | null };
    const found = ensureDetail(String(params.id));
    found.status = "cancelled";
    found.cancellation = { at: new Date().toISOString(), reason, fee: 0, sentTo: "•••• 4821" };
    return HttpResponse.json(found);
  }),

  http.post(api("/:id/confirm"), ({ params }) => {
    const found = ensureDetail(String(params.id));
    found.status = "confirmed";
    return HttpResponse.json(found);
  }),
];
