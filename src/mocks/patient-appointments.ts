import { HttpResponse, http } from "msw";
import { env } from "@/env";
import { hospitals } from "@/mocks/doctor-orders";
import { myAppointments } from "@/mocks/patient";

const api = (path: string) => `${env.VITE_API_URL}${path}`;
const pending = (path: string) => api(`/api/pending/patient/appointments${path}`);

// The patient's booking, rescheduling and cancelling, with the real API's paths, shapes and errors
// (docs/backend-handoff-2026-11-26-appointments.md), on the appointments in src/mocks/patient.ts.
// TODO(api): and the demo data for what the API doesn't give patients yet
// (src/features/patient/api/pending-appointments.ts): each appointment's extras, who can be booked
// at a hospital, departments, reasons and free slots, and confirming attendance. Only the mock
// dev server asks for those.

const daysAgo = (days: number, hour = 10, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const reminders = [
  { before: "1 day before", channels: "Push and SMS" },
  { before: "2 hours before", channels: "Push" },
];

/** Where the demo patient's hospitals are, and what a visit costs. */
const places = {
  "hosp-abc": { area: "Ikeja", address: "14 Obafemi Awolowo Way, Ikeja, Lagos", fee: 15000 },
  "hosp-red": {
    area: "Ikeja",
    address: "12 Idowu Martins Street, Victoria Island, Lagos",
    fee: 20000,
  },
  "hosp-luth": { area: "Idi-Araba", address: "Ishaga Road, Idi-Araba, Lagos", fee: 8000 },
} as Record<string, { area: string; address: string; fee: number } | undefined>;

type Detail = {
  appointmentId: string;
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
  cancellation: { at: string; fee: number | null; sentTo: string | null } | null;
};

const detail = (appointmentId: string, facilityId: string, fields: Partial<Detail>): Detail => {
  const place = places[facilityId];
  return {
    appointmentId,
    department: null,
    reason: null,
    clinicianRole: null,
    clinicianPhoto: null,
    facilityArea: place?.area ?? null,
    facilityAddress: place?.address ?? null,
    facilityPhoto: null,
    clinic: place ? "Clinic 3" : null,
    minutes: 30,
    fee: place?.fee ?? null,
    reminders,
    cancellation: null,
    ...fields,
  };
};

const details: Detail[] = [
  detail("appt-1", "hosp-abc", {
    department: "Internal Medicine",
    reason: "Blood pressure review",
    clinicianRole: "Consultant Physician",
  }),
  detail("appt-2", "hosp-abc", {
    department: "Internal Medicine",
    reason: "Blood pressure review",
    clinicianRole: "Consultant Physician",
  }),
  detail("appt-eye", "hosp-red", { department: "Ophthalmology", reason: "Eye check" }),
  detail("appt-past", "hosp-abc", {
    department: "Internal Medicine",
    reason: "Check-up",
    clinicianRole: "Consultant Physician",
    // The confirmation went by SMS to the demo patient's phone.
    cancellation: { at: daysAgo(36, 9, 14), fee: 0, sentTo: "•••• 4821" },
  }),
];

const options = {
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

/** Who a patient can book with, at any hospital: the doctors the demo patient knows, and a GP. */
const bookableStaff = [
  {
    sqid: "staff-okafor",
    firstname: "Adaeze",
    lastname: "Okafor",
    role: "doctor",
    specialization: "Internal Medicine",
  },
  {
    sqid: "staff-isaac",
    firstname: "Isaac",
    lastname: "Adeyemi",
    role: "doctor",
    specialization: "Internal Medicine",
  },
  {
    sqid: "staff-bello",
    firstname: "Tunde",
    lastname: "Bello",
    role: "doctor",
    specialization: "General Medicine",
  },
];

const TIMES = ["09:00", "09:30", "10:30", "11:00", "11:30", "12:30", "13:00", "14:30"];

const badRequest = (body: Record<string, unknown>) => HttpResponse.json(body, { status: 400 });
const notFound = () =>
  HttpResponse.json({ detail: "No Appointment matches the given query." }, { status: 404 });

/** The API's errors for a `scheduled_time` that's missing or not in the future. */
function scheduledTimeError(value: string | undefined) {
  if (!value) return badRequest({ scheduled_time: ["This field is required."] });
  if (new Date(value).getTime() <= Date.now()) {
    return badRequest({ scheduled_time: ["Choose a time in the future."] });
  }
  return null;
}

const isOpen = (status: string) => status === "pending" || status === "confirmed";

export const patientAppointmentHandlers = [
  // Book from the app: always the signed-in patient, always `pending`.
  http.post(api("/api/hospital-ops/appointments/request"), async ({ request }) => {
    const body = (await request.json()) as {
      hospital?: string;
      staff?: string;
      scheduled_time?: string;
      type?: string | null;
      note?: string | null;
    };
    const missing = (["hospital", "staff", "scheduled_time"] as const).filter((key) => !body[key]);
    if (missing.length > 0) {
      return badRequest(
        Object.fromEntries(missing.map((key) => [key, ["This field is required."]])),
      );
    }
    const hospital = hospitals.find(({ sqid }) => sqid === body.hospital);
    if (!hospital) {
      return badRequest({ hospital: [`Object with sqid=${body.hospital} does not exist.`] });
    }
    const staff = bookableStaff.find(({ sqid }) => sqid === body.staff);
    if (!staff) return badRequest({ staff: ["Staff not found at this hospital."] });
    const timeError = scheduledTimeError(body.scheduled_time);
    if (timeError) return timeError;
    if (body.type && body.type.length > 20) {
      return badRequest({ type: ["Ensure this field has no more than 20 characters."] });
    }
    const id = Math.max(...myAppointments.map((each) => each.id)) + 1;
    const sqid = `appt-${id}`;
    myAppointments.push({
      id,
      sqid,
      status: "pending",
      scheduled_time: body.scheduled_time ?? "",
      type: body.type ?? "Consultation",
      note: body.note ?? null,
      cancellation_reason: null,
      reschedule_reason: null,
      last_visited: null,
      closed_at: null,
      staff,
      hospital_info: { name: hospital.name, sqid: hospital.sqid, email: hospital.email ?? "" },
    });
    details.push(detail(sqid, hospital.sqid, { reason: body.type ?? null }));
    // As the API does: no sqid or status.
    return HttpResponse.json(
      {
        staff_info: {
          sqid: staff.sqid,
          firstname: staff.firstname,
          lastname: staff.lastname,
          phone_num: null,
          role: staff.role,
          email: null,
          gender: null,
          is_active: true,
        },
        patient_info: {
          hin: "1234567890123",
          firstname: "Chinonso",
          lastname: "Okafor",
          gender: "male",
          dob: null,
        },
        type: body.type ?? null,
        note: body.note ?? null,
        scheduled_time: body.scheduled_time,
        hospital: hospital.sqid,
      },
      { status: 201 },
    );
  }),

  // The patient's own (the front desk's are src/mocks/receptionist.ts's). A confirmed one goes
  // back to pending, for the hospital to confirm the new time.
  http.patch(
    api("/api/hospital-ops/appointments/:sqid/reschedule"),
    async ({ params, request }) => {
      const appointment = myAppointments.find(({ sqid }) => sqid === params.sqid);
      if (!appointment) return notFound();
      const body = (await request.json()) as {
        scheduled_time?: string;
        reschedule_reason?: string | null;
        type?: string | null;
        note?: string | null;
      };
      if (
        body.scheduled_time &&
        new Date(body.scheduled_time).getTime() === new Date(appointment.scheduled_time).getTime()
      ) {
        return badRequest({
          scheduled_time: ["The appointment is already at this time. Choose a different time."],
        });
      }
      const timeError = scheduledTimeError(body.scheduled_time);
      if (timeError) return timeError;
      if (!isOpen(appointment.status)) {
        return badRequest({
          appointment: ["Only a pending or confirmed appointment can be rescheduled"],
        });
      }
      Object.assign(appointment, {
        scheduled_time: body.scheduled_time,
        status: "pending",
        reschedule_reason: body.reschedule_reason ?? null,
        ...(body.type !== undefined && { type: body.type }),
        ...(body.note !== undefined && { note: body.note }),
      });
      return HttpResponse.json({
        type: appointment.type,
        note: appointment.note,
        scheduled_time: appointment.scheduled_time,
        reschedule_reason: appointment.reschedule_reason,
        sqid: appointment.sqid,
        status: appointment.status,
      });
    },
  ),

  http.post(api("/api/hospital-ops/appointments/:sqid/cancel"), async ({ params, request }) => {
    const appointment = myAppointments.find(({ sqid }) => sqid === params.sqid);
    if (!appointment) return notFound();
    if (!isOpen(appointment.status)) {
      return badRequest({
        appointment: ["Only a pending or confirmed appointment can be cancelled"],
      });
    }
    const body = (await request.json().catch(() => ({}))) as { cancellation_reason?: string };
    appointment.status = "cancelled";
    appointment.cancellation_reason = body.cancellation_reason ?? null;
    const found = details.find((each) => each.appointmentId === appointment.sqid);
    if (found) found.cancellation = { at: new Date().toISOString(), fee: 0, sentTo: "•••• 4821" };
    return HttpResponse.json({
      cancellation_reason: appointment.cancellation_reason,
      reschedule_reason: appointment.reschedule_reason,
      sqid: appointment.sqid,
      status: appointment.status,
    });
  }),

  // The hospitals and staff a patient can book with (docs/backend-handoff-2026-11-27-booking-
  // discovery.md): every hospital lists the same demo doctors; LUTH has no one bookable.
  http.get(`${env.VITE_API_URL}/api/auth/facilities/hospitals/public`, ({ request }) => {
    const search = (new URL(request.url).searchParams.get("search") ?? "").toLowerCase();
    const results = hospitals
      .filter(({ name }) => name.toLowerCase().includes(search))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(({ sqid, name, email }) => ({
        sqid,
        name,
        email,
        phone: null,
        profile_image: null,
        bg_image: null,
      }));
    return HttpResponse.json({ count: results.length, next: null, previous: null, results });
  }),
  http.get(`${env.VITE_API_URL}/api/hospital-ops/:hospital/staff`, ({ params, request }) => {
    // `/api/hospital-ops/appointments/staff` is the staff's own appointments, not this list.
    if (params.hospital === "appointments") return undefined;
    if (!hospitals.some(({ sqid }) => sqid === params.hospital)) {
      return HttpResponse.json({ detail: "No Facility matches the given query." }, { status: 404 });
    }
    const search = (new URL(request.url).searchParams.get("search") ?? "").toLowerCase();
    const results =
      params.hospital === "hosp-luth"
        ? []
        : bookableStaff
            .filter((staff) =>
              [staff.firstname, staff.lastname, staff.specialization ?? ""].some((part) =>
                part.toLowerCase().includes(search),
              ),
            )
            .sort((a, b) =>
              `${a.firstname} ${a.lastname}`.localeCompare(`${b.firstname} ${b.lastname}`),
            );
    return HttpResponse.json({ count: results.length, next: null, previous: null, results });
  }),

  // TODO(api): from here on, what the API doesn't have yet.
  http.get(pending(""), () => HttpResponse.json({ details })),
  http.get(pending("/options"), () => HttpResponse.json(options)),
  http.get(pending("/slots"), ({ request }) => {
    const day = new URL(request.url).searchParams.get("day") ?? "";
    const date = new Date(`${day}T00:00`);
    // Closed on Sundays.
    if (Number.isNaN(date.getTime()) || date.getDay() === 0) return HttpResponse.json([]);
    const now = Date.now();
    return HttpResponse.json(
      TIMES.filter((time) => new Date(`${day}T${time}`).getTime() > now + 30 * 60_000),
    );
  }),
  http.post(pending("/:id/confirm"), ({ params }) => {
    const appointment = myAppointments.find(({ sqid }) => sqid === params.id);
    if (!appointment) return notFound();
    appointment.status = "confirmed";
    return HttpResponse.json({ detail: "Attendance confirmed." });
  }),
];
