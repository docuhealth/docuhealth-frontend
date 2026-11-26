import { HttpResponse, http } from "msw";
import { env } from "@/env";
import { maskContact } from "@/mocks/auth";
import { colleagues } from "@/mocks/staff";
import type {
  AppointmentList,
  PatientProfile,
  ReceptionQueue,
  Sex,
} from "@/features/receptionist/api/schemas";

const api = (path: string) => `${env.VITE_API_URL}${path}`;

/** `days` from today at `time` ("09:30"). */
function at(days: number, time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

type Appointment = AppointmentList["items"][number];

const appointments: Appointment[] = (
  [
    [0, "09:00", "Daniel Martins", "+2348021112233", "General Consultation", "checked_in"],
    [0, "09:30", "Blessing Okoi", "+2348032223344", "Follow-up", "in_progress"],
    [0, "09:30", "Ibraham Lawal", "+2348063334455", "Lab Test Review", "arrived"],
    [0, "10:00", "Olumide Ajayi", "+2348064441122", "Blood Pressure Check", "cancelled"],
    [0, "10:15", "Fatima Bello", "+2349014445566", "New Patient Visit", "upcoming"],
    [0, "11:30", "George James", "+2348075556677", "Consultation", "upcoming"],
    [0, "12:00", "Ngozi Eze", "+2348086667788", "Antenatal Check", "upcoming"],
    [0, "12:45", "Sola Ogunleye", "+2348097778899", "Follow-up", "upcoming"],
    [0, "13:30", "Zainab Bello", "+2348018889900", "Vaccination", "upcoming"],
    [0, "14:00", "Uche Okafor", "+2348029990011", "Consultation", "upcoming"],
    [0, "14:30", "Bisi Akande", "+2348031112233", "Blood Pressure Review", "upcoming"],
    [0, "15:15", "Femi Adebayo", "+2348042223344", "Physiotherapy", "upcoming"],
    [0, "16:00", "Ruth Etim", "+2348053334455", "Lab Test Review", "upcoming"],
    [1, "09:00", "Kelechi Nnamdi", "+2348064445566", "Consultation", "upcoming"],
    [1, "10:00", "Amina Yusuf", "+2348075556600", "Follow-up", "upcoming"],
    [1, "11:00", "Halima Abubakar", "+2348086667711", "Dental Check", "upcoming"],
    [1, "12:30", "Obinna Chukwu", "+2348097778822", "Eye Test", "upcoming"],
    [1, "14:00", "Folasade Ojo", "+2348018889933", "Consultation", "upcoming"],
    [1, "15:30", "Tunde Bakare", "+2348029990044", "Follow-up", "upcoming"],
    [3, "09:30", "Precious Obi", "+2348031112255", "Consultation", "upcoming"],
    [4, "11:00", "Victor Udo", "+2348042223366", "Lab Test Review", "upcoming"],
    [6, "10:00", "John Ekwueme", "+2348053334477", "Follow-up", "upcoming"],
    [9, "13:00", "Joyce Sarah", "+2348064445588", "New Patient Visit", "upcoming"],
  ] as const
).map(([days, time, name, phone, reason, status], index) => ({
  id: `appointment-${index + 1}`,
  at: at(days, time),
  patient: { id: `patient-${index + 1}`, name, phone, avatarUrl: null },
  reason,
  status,
}));

// A few months of history and bookings around today for the calendar, on top of the ones above
// (which cover today and tomorrow on their own).
const calendarNames = [
  "Amina Yusuf",
  "Grace Effiong",
  "Emeka Nwosu",
  "Kelechi Obi",
  "Segun Oladipo",
  "Chiamaka Eze",
  "Funmilayo Adeyemi",
  "Olumide Ajayi",
  "Adaeze Okafor",
  "Tunde Bakare",
  "Halima Bello",
  "Ibrahim Musa",
];
const calendarReasons = [
  "Follow-up visit",
  "Blood pressure check",
  "Prescription refill",
  "General Consultation",
  "Lab Test Review",
  "Antenatal Check",
];
const calendarTimes = Array.from({ length: 18 }, (_, index) => {
  const minutes = 8 * 60 + index * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${minutes % 60 ? "30" : "00"}`;
});

/** The same "random" number in [0, 1) for the same `seed`, so the calendar doesn't reshuffle. */
function noise(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43_758.5453;
  return x - Math.floor(x);
}

for (let days = -60; days <= 75; days++) {
  if (days === 0 || days === 1) continue;
  const count = Math.floor(noise(days) * 8);
  const times = new Set<string>();
  for (let n = 0; n < count; n++) {
    times.add(calendarTimes[Math.floor(noise(days * 31 + n) * calendarTimes.length)] ?? "09:00");
  }
  [...times].forEach((time, n) => {
    const seed = days * 97 + n;
    const name = calendarNames[Math.floor(noise(seed) * calendarNames.length)] ?? "Amina Yusuf";
    const cancelled = noise(seed + 0.5) < (days < 0 ? 0.15 : 0.08);
    appointments.push({
      id: `appointment-${appointments.length + 1}`,
      at: at(days, time),
      patient: {
        id: `calendar-patient-${calendarNames.indexOf(name) + 1}`,
        name,
        phone: `+23480${String(30_000_000 + calendarNames.indexOf(name) * 1_234_567).slice(0, 8)}`,
        avatarUrl: null,
      },
      reason: calendarReasons[Math.floor(noise(seed + 0.25) * calendarReasons.length)] ?? "",
      status: cancelled ? "cancelled" : days < 0 ? "checked_in" : "upcoming",
    });
  });
}
appointments.sort((a, b) => a.at.localeCompare(b.at));

type StaffRef = {
  sqid: string;
  firstname: string;
  lastname: string;
  role: string;
  specialization: null;
};

/** Who appointments are with unless booked or confirmed with someone else: Dr. Sarah Adeyemi. */
const defaultStaff: StaffRef = {
  sqid: "staff-2",
  firstname: "Sarah",
  lastname: "Adeyemi",
  role: "doctor",
  specialization: null,
};

/**
 * What the calendar's chips leave out, set when an appointment is booked, confirmed, moved or
 * cancelled. Without an entry, an upcoming appointment is `pending` (waiting for the front desk
 * to confirm it) and with Dr. Sarah Adeyemi.
 */
const appointmentExtras = new Map<
  string,
  {
    note?: string | null;
    staff?: StaffRef;
    confirmed?: boolean;
    cancellationReason?: string | null;
    rescheduleReason?: string | null;
  }
>();
const extrasOf = (id: string) => {
  const found = appointmentExtras.get(id) ?? {};
  appointmentExtras.set(id, found);
  return found;
};

const femaleFirstNames = new Set(
  "Blessing Fatima Ngozi Sola Zainab Bisi Ruth Amina Halima Folasade Precious Joyce Grace Chiamaka Funmilayo Adaeze".split(
    " ",
  ),
);

/**
 * A patient's HIN, birthday and sex: the registered patient's own, or, for patients the mock
 * didn't register, made up from their name so they stay the same.
 */
function patientFacts({ id, name }: { id: string; name: string }): {
  hin: string;
  dateOfBirth: string;
  sex: Sex;
  registeredPatient: MockPatient | undefined;
} {
  const registeredPatient = registered.find((patient) => patient.id === id);
  if (registeredPatient) {
    const { hin, dateOfBirth, sex } = registeredPatient;
    return { hin, dateOfBirth, sex, registeredPatient };
  }
  const hash = Array.from({ length: name.length }, (_, index) => name.charCodeAt(index)).reduce(
    (sum, code) => (sum * 31 + code) % 1e11,
    7,
  );
  return {
    hin: String(hash).padStart(11, "1"),
    dateOfBirth: bornYearsAgo(18 + (hash % 60)),
    sex: femaleFirstNames.has(name.split(" ")[0] ?? "") ? "female" : "male",
    registeredPatient,
  };
}

const queue: ReceptionQueue["items"] = (
  [
    ["Chinonso Okafor", "DH-28491", "Check-up", "completed", 12],
    ["Amina Yusuf", "DH-28492", "Lab Results", "in_progress", 18],
    ["Tunde Adeyemi", "DH-28493", "Fever", "in_progress", 24],
    ["Chioma Nwosu", "DH-39172", "Routine Check-up", "pending", 32],
    ["Emeka Uche", "DH-28495", "Medication Review", "pending", 38],
    ["Hauwa Garba", "DH-28496", "Antenatal Check", "pending", 41],
    ["Yemi Ojo", "DH-28497", "Wound Dressing", "pending", 45],
    ["Chidinma Okeke", "DH-28498", "Follow-up", "pending", 52],
  ] as const
).map(([name, hin, reason, status, waitMinutes], index) => ({
  id: `queue-${index + 1}`,
  patient: { id: `patient-${index + 1}`, name, hin, avatarUrl: null },
  reason,
  status,
  waitMinutes,
}));

/** The phone number each queued patient registered with, for searching check-ins by phone. */
const queuePhones = new Map(
  queue.map(({ id }, index) => [id, `0805${String(1_234_560 + index * 7_919).padStart(7, "0")}`]),
);

/** When each queued patient checked in: their wait ago, when the mock loaded. */
const queueCheckedInAt = new Map(
  queue.map(({ id, waitMinutes }) => [
    id,
    new Date(Date.now() - waitMinutes * 60_000).toISOString(),
  ]),
);

/** Check-ins already closed (the queue's, once checked out, join them), newest first. */
const closedCheckIns: { sqid: string; name: string; hin: string; phone: string; at: string }[] = (
  [
    ["Adeola Williams", "12334567890", "08034567890", -1, "10:05"],
    ["Amina Yusuf", "28492000002", "08034572334", -3, "09:20"],
    ["Samuel Williams", "12334567891", "08034569001", -6, "11:45"],
    ["Daniel Martins", "11734520984", "08021112233", -9, "08:50"],
  ] as const
).map(([name, hin, phone, days, time], index) => ({
  sqid: `checkin-closed-${index + 1}`,
  name,
  hin,
  phone,
  at: at(days, time),
}));

/** `age` years old, with a birthday a month ago so the age shown stays `age`. */
function bornYearsAgo(age: number) {
  const birth = new Date();
  birth.setMonth(birth.getMonth() - 1);
  birth.setFullYear(birth.getFullYear() - age);
  return birth.toISOString().slice(0, 10);
}

/**
 * `count` visits a fortnight apart, latest first: the latest at 9:42 this morning and still
 * checked in, the rest checked out an hour and a half later.
 */
function visitsFor(id: string, count: number): PatientProfile["visits"] {
  return Array.from({ length: count }, (_, index) => {
    const checkedIn = new Date(at(-index * 14, "09:42"));
    const checkedOut = new Date(checkedIn.getTime() + 90 * 60_000);
    return {
      id: `${id}-visit-${index + 1}`,
      kind: index % 3 === 1 ? "check_in" : "appointment",
      checkedInAt: checkedIn.toISOString(),
      checkedOutAt: index === 0 ? null : checkedOut.toISOString(),
      status: index === 0 ? "checked_in" : "checked_out",
    };
  });
}

type MockPatient = Omit<PatientProfile, "dependents" | "proxies"> & {
  /** Ids of the patients whose accounts this one manages, and how they're related. */
  dependentIds: { id: string; relationship: string }[];
};

// Look up 123-345-678-90 to find Adeola, whose children are dependents on her account.
const registered: MockPatient[] = (
  [
    ["registered-1", "Adeola Williams", "12334567890", "female", 36, 12, ["2:Mother", "3:Mother"]],
    ["registered-2", "Samuel Williams", "12334567891", "male", 6, 5, []],
    ["registered-3", "Ireti Williams", "12334567892", "female", 4, 0, []],
    ["registered-4", "Tunde Williams", "12334567893", "male", 39, 3, ["2:Father", "3:Father"]],
    ["registered-5", "Chinonso Okafor", "28491000001", "male", 29, 2, []],
    ["registered-6", "Amina Yusuf", "28492000002", "female", 41, 7, []],
  ] as const
).map(([id, name, hin, sex, age, visitCount, dependents], index) => {
  const visits = visitsFor(id, visitCount);
  const latest = visits[0];
  const upcoming = new Date(at(6, "10:00"));
  return {
    id,
    name,
    hin,
    dateOfBirth: bornYearsAgo(age),
    sex,
    avatarUrl: null,
    coverage: (["hmo", "private", "nhis"] as const)[index % 3] ?? "hmo",
    phone: `0803${String(4_567_890 + index * 1_111).padStart(7, "0")}`,
    email: `${name.toLowerCase().replace(" ", ".")}@email.com`,
    address: "24 Allen Avenue, Ikeja, Lagos",
    assignedDoctor: "Dr. Sarah Adeyemi",
    lastVisit: latest ? { at: latest.checkedInAt, department: "General Medicine" } : null,
    lastCheckIn: latest ? { at: latest.checkedInAt, status: latest.status } : null,
    upcomingAppointment:
      visitCount > 0 ? { at: upcoming.toISOString(), department: "General Medicine" } : null,
    totalVisits: visitCount,
    visits,
    dependentIds: dependents.map((entry) => {
      const [number, relationship = ""] = entry.split(":");
      return { id: `registered-${number}`, relationship };
    }),
  };
});

/** A patient just registered at the front desk, with nothing on record yet. */
function newPatientRecord(id: string, hin: string, name: string, sex: Sex): MockPatient {
  return {
    id,
    name,
    hin,
    dateOfBirth: bornYearsAgo(30),
    sex,
    avatarUrl: null,
    coverage: "private",
    phone: null,
    email: null,
    address: null,
    assignedDoctor: null,
    lastVisit: null,
    lastCheckIn: null,
    upcomingAppointment: null,
    totalVisits: 0,
    visits: [],
    dependentIds: [],
  };
}

function matches(search: string | null, ...values: string[]) {
  const term = search?.trim().toLowerCase();
  return !term || values.some((value) => value.toLowerCase().includes(term));
}

/** The design's appointment status → the API's; an upcoming one is pending until confirmed. */
const apiStatuses: Record<Appointment["status"], string> = {
  upcoming: "pending",
  arrived: "confirmed",
  checked_in: "completed",
  in_progress: "confirmed",
  cancelled: "cancelled",
};
const apiStatusOf = (appointment: Appointment) =>
  appointment.status === "upcoming" && appointmentExtras.get(appointment.id)?.confirmed
    ? "confirmed"
    : apiStatuses[appointment.status];

const hospitalInfo = { name: "Lagos University Teaching Hospital", email: null, sqid: "pm9XGQd" };

const splitName = (name: string) => {
  const [firstname = "", ...rest] = name.split(" ");
  return { firstname, lastname: rest.join(" ") };
};

/** `HospitalAppointment`, as the API returns it. */
function readAppointment(appointment: Appointment) {
  const { hin, dateOfBirth, sex, registeredPatient } = patientFacts(appointment.patient);
  const extras = appointmentExtras.get(appointment.id);
  return {
    id: 0,
    sqid: appointment.id,
    status: apiStatusOf(appointment),
    scheduled_time: appointment.at,
    staff: extras?.staff ?? defaultStaff,
    patient: {
      hin,
      ...splitName(appointment.patient.name),
      middlename: null,
      dob: dateOfBirth,
      gender: sex === "prefer_not_to_say" ? "unknown" : sex,
      phone_num: appointment.patient.phone,
      email:
        registeredPatient?.email ??
        `${appointment.patient.name.toLowerCase().replace(/\s+/g, ".")}@email.com`,
    },
    note: extras?.note ?? null,
    type: appointment.reason,
    cancellation_reason: extras?.cancellationReason ?? null,
    reschedule_reason: extras?.rescheduleReason ?? null,
    last_visited: null,
    hospital_info: hospitalInfo,
    closed_at: null,
    closed_by_info: null,
  };
}

/**
 * Whether an appointment falls in the API's `timeframe`: today, tomorrow, after tomorrow
 * (`upcoming`), or before today (`history`).
 */
function inTimeframe(at: string, timeframe: string | null) {
  const date = new Date(at);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + DAY_MS);
  if (timeframe === "today") return date >= start && date < end;
  if (timeframe === "tomorrow") return date >= end && date < new Date(end.getTime() + DAY_MS);
  if (timeframe === "upcoming") return date >= new Date(end.getTime() + DAY_MS);
  return date < start;
}

const DAY_MS = 24 * 60 * 60_000;

const periods = ["day", "week", "month"] as const;
type ApiPeriod = (typeof periods)[number];

/** The API's `period` (a week starts on Monday), `offset` periods back, as ISO [start, end). */
function periodSpan(period: ApiPeriod, offset = 0) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (period === "day") start.setDate(start.getDate() - offset);
  if (period === "week") start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - 7 * offset);
  if (period === "month") start.setMonth(start.getMonth() - offset, 1);
  const end = new Date(start);
  if (period === "day") end.setDate(end.getDate() + 1);
  if (period === "week") end.setDate(end.getDate() + 7);
  if (period === "month") end.setMonth(end.getMonth() + 1);
  return [start.toISOString(), end.toISOString()] as const;
}

/** The request's `period`: `null` when left out (all time), or a 400 response when unknown. */
function periodOf(request: Request): ApiPeriod | null | Response {
  const value = new URL(request.url).searchParams.get("period");
  if (value === null) return null;
  return (
    periods.find((period) => period === value) ??
    HttpResponse.json({ period: "period must be 'day', 'week' or 'month'." }, { status: 400 })
  );
}

/** How many appointments in `period` (`offset` periods back) pass `keep`; all time when `null`. */
function appointmentsIn(
  period: ApiPeriod | null,
  offset = 0,
  keep: (appointment: Appointment) => boolean = () => true,
) {
  if (!period) return appointments.filter(keep).length;
  const [start, end] = periodSpan(period, offset);
  return appointments.filter(
    (appointment) => appointment.at >= start && appointment.at < end && keep(appointment),
  ).length;
}

/** `(current - previous) / previous x 100` to 2 places, or `null` when there were none before. */
const percentChange = (current: number, previous: number) =>
  previous === 0 ? null : Math.round(((current - previous) / previous) * 10_000) / 100;

/** `GET /api/patients/{hin}/details`, as the API returns it. */
function readPatient(patient: MockPatient) {
  return {
    dob: patient.dateOfBirth,
    gender: patient.sex === "prefer_not_to_say" ? "unknown" : patient.sex,
    phone_num: patient.phone,
    ...splitName(patient.name),
    middlename: null,
    hin: patient.hin,
    street: patient.address ? "24 Allen Avenue" : null,
    city: patient.address ? "Ikeja" : null,
    state: patient.address ? "Lagos" : null,
    country: patient.address ? "Nigeria" : null,
    email: patient.email,
    contact_email: null,
    payment_provider: {
      type: patient.coverage === "nhis" ? "company" : patient.coverage,
      provider: null,
      member_id: null,
      updated_at: null,
    },
  };
}

/** A queue entry's status → the API's check-in status. */
const checkInStatusOf = {
  pending: "pending",
  in_progress: "doctor_active",
  completed: "doctor_seen",
};

/** The code every "emailed" verification code is, so registration can be clicked through. */
const VERIFICATION_CODE = "123456";

/** Desk signups started, by their email or phone. */
const signups = new Map<
  string,
  { firstname: string; lastname: string; gender: string; token?: string }
>();

const badRequest = (body: Record<string, unknown>) => HttpResponse.json(body, { status: 400 });
const notFound = () =>
  HttpResponse.json({ detail: "No Appointment matches the given query." }, { status: 404 });

/** A staff member at the hospital, by sqid, as the appointment object names them. */
function staffRefOf(sqid: string): StaffRef | undefined {
  const member = colleagues.find((each) => each.sqid === sqid && each.is_active);
  return (
    member && {
      sqid: member.sqid,
      firstname: member.firstname,
      lastname: member.lastname,
      role: member.role,
      specialization: null,
    }
  );
}

/** The API's errors for a `scheduled_time` that's missing or not in the future. */
function scheduledTimeError(value: string | undefined) {
  if (!value) return badRequest({ scheduled_time: ["This field is required."] });
  if (new Date(value).getTime() <= Date.now()) {
    return badRequest({ scheduled_time: ["Choose a time in the future."] });
  }
  return null;
}

/** Whether the request comes from a dashboard that books with itself (lab, radiology). */
const fromOwnBookingDashboard = (request: Request) =>
  /\/(radiologist|lab-scientist)(?:[/?#]|$)/.test(
    request.referrer ? new URL(request.referrer).pathname : "",
  );

export const receptionistHandlers = [
  // Book at the desk. The lab's and radiology's own booking is src/mocks/staff.ts's.
  http.post(api("/api/hospital-ops/appointments/book"), async ({ request }) => {
    if (fromOwnBookingDashboard(request)) return undefined;
    // A copy, so the lab's and radiology's handler can still read the body if this one passes.
    const body = (await request.clone().json()) as {
      patient?: string;
      staff?: string;
      scheduled_time?: string;
      type?: string | null;
      note?: string | null;
    };
    const missing = (["patient", "staff", "scheduled_time"] as const).filter((key) => !body[key]);
    if (missing.length > 0) {
      return badRequest(
        Object.fromEntries(missing.map((key) => [key, ["This field is required."]])),
      );
    }
    const staff = staffRefOf(body.staff ?? "");
    // Someone outside the front desk's staff list: the lab's or radiology's own booking (tests
    // have no page to tell them apart), which src/mocks/staff.ts answers.
    if (!staff) return undefined;
    const patient = registered.find(({ hin }) => hin === body.patient);
    if (!patient) {
      return badRequest({ patient: [`Object with hin=${body.patient} does not exist.`] });
    }
    const timeError = scheduledTimeError(body.scheduled_time);
    if (timeError) return timeError;
    if (body.type && body.type.length > 20) {
      return badRequest({ type: ["Ensure this field has no more than 20 characters."] });
    }
    const id = `appointment-${appointments.length + 1}`;
    appointments.push({
      id,
      at: body.scheduled_time ?? "",
      patient: { id: patient.id, name: patient.name, phone: patient.phone ?? "", avatarUrl: null },
      reason: body.type ?? "Consultation",
      status: "upcoming",
    });
    appointments.sort((a, b) => a.at.localeCompare(b.at));
    appointmentExtras.set(id, { note: body.note ?? null, staff });
    return HttpResponse.json(
      {
        staff_info: { ...staff, phone_num: null, email: null, gender: null, is_active: true },
        patient_info: {
          hin: patient.hin,
          ...splitName(patient.name),
          gender: patient.sex,
          dob: patient.dateOfBirth,
        },
        type: body.type ?? null,
        note: body.note ?? null,
        scheduled_time: body.scheduled_time,
        hospital: hospitalInfo.sqid,
      },
      { status: 201 },
    );
  }),
  http.post(api("/api/hospital-ops/appointments/:sqid/confirm"), async ({ params, request }) => {
    const appointment = appointments.find(({ id }) => id === params.sqid);
    if (!appointment) return notFound();
    if (apiStatusOf(appointment) !== "pending") {
      return badRequest({ appointment: ["Only a pending appointment can be confirmed"] });
    }
    const { staff: sqid } = (await request.json()) as { staff?: string };
    if (!sqid) return badRequest({ staff: ["This field is required."] });
    const staff = staffRefOf(sqid);
    if (!staff) return badRequest({ staff: ["Staff not found at this hospital."] });
    Object.assign(extrasOf(appointment.id), { staff, confirmed: true });
    return HttpResponse.json(readAppointment(appointment));
  }),
  // The front desk's appointments; any other (a patient's) goes on to src/mocks/patient.ts.
  http.patch(
    api("/api/hospital-ops/appointments/:sqid/reschedule"),
    async ({ params, request }) => {
      const appointment = appointments.find(({ id }) => id === params.sqid);
      if (!appointment) return undefined;
      const body = (await request.json()) as {
        scheduled_time?: string;
        reschedule_reason?: string | null;
        type?: string | null;
        note?: string | null;
      };
      if (!body.scheduled_time) {
        return badRequest({ scheduled_time: ["This field is required."] });
      }
      if (new Date(body.scheduled_time).getTime() === new Date(appointment.at).getTime()) {
        return badRequest({
          scheduled_time: ["The appointment is already at this time. Choose a different time."],
        });
      }
      const timeError = scheduledTimeError(body.scheduled_time);
      if (timeError) return timeError;
      if (appointment.status !== "upcoming") {
        return badRequest({
          appointment: ["Only a pending or confirmed appointment can be rescheduled"],
        });
      }
      appointment.at = body.scheduled_time;
      if (body.type) appointment.reason = body.type;
      appointments.sort((a, b) => a.at.localeCompare(b.at));
      const extras = extrasOf(appointment.id);
      extras.rescheduleReason = body.reschedule_reason ?? null;
      if ("note" in body) extras.note = body.note ?? null;
      const read = readAppointment(appointment);
      return HttpResponse.json({
        type: read.type,
        note: read.note,
        scheduled_time: read.scheduled_time,
        reschedule_reason: read.reschedule_reason,
        sqid: read.sqid,
        status: read.status,
      });
    },
  ),
  http.post(api("/api/hospital-ops/appointments/:sqid/cancel"), async ({ params, request }) => {
    const appointment = appointments.find(({ id }) => id === params.sqid);
    if (!appointment) return undefined;
    if (appointment.status !== "upcoming") {
      return badRequest({
        appointment: ["Only a pending or confirmed appointment can be cancelled"],
      });
    }
    const body = (await request.json().catch(() => ({}))) as { cancellation_reason?: string };
    appointment.status = "cancelled";
    extrasOf(appointment.id).cancellationReason = body.cancellation_reason ?? null;
    const read = readAppointment(appointment);
    return HttpResponse.json({
      cancellation_reason: read.cancellation_reason,
      reschedule_reason: read.reschedule_reason,
      sqid: read.sqid,
      status: read.status,
    });
  }),

  http.get(api("/api/hospital-ops/appointments"), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const timeframe = params.get("timeframe");
    if (!timeframe || !["today", "tomorrow", "upcoming", "history"].includes(timeframe)) {
      return HttpResponse.json({ timeframe: "This query parameter is required." }, { status: 400 });
    }
    const from = params.get("scheduled_time_gte");
    const to = params.get("scheduled_time_lte");
    const status = params.get("status");
    const page = Number(params.get("page") ?? 1);
    const size = Number(params.get("size") ?? 10);
    const matching = appointments.filter(
      (appointment) =>
        inTimeframe(appointment.at, timeframe) &&
        (!from || appointment.at >= from) &&
        (!to || appointment.at <= to) &&
        (!status || apiStatusOf(appointment) === status) &&
        // As the API does: the patient's name or email, not their HIN or phone.
        matches(
          params.get("search"),
          appointment.patient.name,
          readAppointment(appointment).patient.email,
        ),
    );
    return HttpResponse.json({
      count: matching.length,
      next: null,
      previous: null,
      results: matching.slice((page - 1) * size, page * size).map(readAppointment),
    });
  }),
  http.get(api("/api/patients/:hin/details"), ({ params }) => {
    const patient = registered.find(({ hin }) => hin === params.hin);
    if (!patient) {
      return HttpResponse.json(
        { detail: "No PatientProfile matches the given query." },
        { status: 404 },
      );
    }
    return HttpResponse.json(readPatient(patient));
  }),
  http.get(api("/api/hospital-ops/patients"), ({ request }) => {
    const params = new URL(request.url).searchParams;
    if (params.get("status") !== "outpatient") {
      return HttpResponse.json({ count: 0, next: null, previous: null, results: [] });
    }
    const size = Number(params.get("size") ?? 10);
    const matching = queue.filter((entry) =>
      matches(params.get("search"), entry.patient.name, entry.patient.hin),
    );
    return HttpResponse.json({
      count: matching.length,
      next: null,
      previous: null,
      results: matching.slice(0, size).map((entry) => ({
        sqid: entry.id,
        status: checkInStatusOf[entry.status],
        patient_info: {
          hin: entry.patient.hin,
          ...splitName(entry.patient.name),
          gender: "unknown",
          dob: "1990-01-01",
        },
        created_at: new Date(Date.now() - entry.waitMinutes * 60_000).toISOString(),
      })),
    });
  }),
  http.post(api("/api/hospital-ops/check-ins/:sqid/close"), ({ params }) => {
    const index = queue.findIndex(({ id }) => id === params.sqid);
    const [entry] = index === -1 ? [] : queue.splice(index, 1);
    if (!entry) return HttpResponse.json({ detail: "Not found." }, { status: 404 });
    closedCheckIns.unshift({
      sqid: entry.id,
      name: entry.patient.name,
      hin: entry.patient.hin,
      phone: queuePhones.get(entry.id) ?? "",
      at: queueCheckedInAt.get(entry.id) ?? new Date().toISOString(),
    });
    return new HttpResponse(null, { status: 200 });
  }),
  // Every check-in, newest first, closed ones included; search by name, HIN or phone.
  http.get(api("/api/hospital-ops/patients-check-ins"), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const page = Number(params.get("page") ?? 1);
    const size = Number(params.get("size") ?? 10);
    const rows = [
      ...queue.map((entry) => ({
        sqid: entry.id,
        name: entry.patient.name,
        hin: entry.patient.hin,
        phone: queuePhones.get(entry.id) ?? "",
        status: checkInStatusOf[entry.status],
        at: queueCheckedInAt.get(entry.id) ?? new Date().toISOString(),
      })),
      ...closedCheckIns.map((checkIn) => ({ ...checkIn, status: "closed" })),
    ]
      .filter(({ name, hin, phone }) => matches(params.get("search"), name, hin, phone))
      .sort((a, b) => b.at.localeCompare(a.at));
    return HttpResponse.json({
      count: rows.length,
      next: null,
      previous: null,
      results: rows.slice((page - 1) * size, page * size).map((row) => ({
        sqid: row.sqid,
        patient_info: { sqid: `patient-${row.hin}`, hin: row.hin, ...splitName(row.name) },
        status: row.status,
        created_at: row.at,
      })),
    });
  }),
  http.get(api("/api/hospital-ops/operation-metrics"), ({ request }) => {
    const period = periodOf(request);
    if (period instanceof Response) return period;
    const hourStart = new Date();
    hourStart.setMinutes(0, 0, 0);
    const thisHourFrom = hourStart.toISOString();
    const lastHourFrom = new Date(hourStart.getTime() - 60 * 60_000).toISOString();
    const checkInTimes = [
      ...queueCheckedInAt.values(),
      ...closedCheckIns.map((checkIn) => checkIn.at),
    ];
    const thisHour = checkInTimes.filter((time) => time >= thisHourFrom).length;
    const lastHour = checkInTimes.filter(
      (time) => time >= lastHourFrom && time < thisHourFrom,
    ).length;
    const booked = appointmentsIn(period);
    return HttpResponse.json({
      total_checkins: 1_240 + checkInTimes.length,
      // The queue's pending check-ins all came in today, so they're in every period.
      pending_checkins: queue.filter(({ status }) => status === "pending").length,
      // A percentage against the hour before, despite the name.
      check_ins_this_hour: { count: thisHour, change: percentChange(thisHour, lastHour) },
      this_period_appointments: {
        count: booked,
        percent_change: period ? percentChange(booked, appointmentsIn(period, 1)) : null,
      },
    });
  }),
  http.get(api("/api/hospital-ops/appointments-overview"), ({ request }) => {
    const period = periodOf(request);
    if (period instanceof Response) return period;
    const booked = appointmentsIn(period);
    const cancelled = (offset: number) =>
      appointmentsIn(period, offset, ({ status }) => status === "cancelled");
    return HttpResponse.json({
      appointments_booked: {
        count: booked,
        percent_change: period ? percentChange(booked, appointmentsIn(period, 1)) : null,
      },
      in_progress_appointments: appointmentsIn(period, 0, ({ status }) => status === "in_progress"),
      cancelled_appointments: {
        count: cancelled(0),
        change: period ? cancelled(0) - cancelled(1) : null,
      },
    });
  }),
  // As the API does: a desk signup needs a date of birth, and says where the code went.
  http.post(api("/api/auth/signup/desk"), async ({ request }) => {
    const body = (await request.json()) as {
      firstname: string;
      lastname: string;
      gender: string;
      dob?: string;
      email?: string;
      phone?: string;
      verify_by?: "email" | "phone";
    };
    if (!body.dob) return HttpResponse.json({ dob: ["This field is required."] }, { status: 400 });
    const contact = (body.verify_by === "phone" ? body.phone : body.email) ?? "";
    signups.set(contact, {
      firstname: body.firstname,
      lastname: body.lastname,
      gender: body.gender,
    });
    return HttpResponse.json({ detail: "We sent you a code.", destination: maskContact(contact) });
  }),
  http.post(api("/api/auth/signup/verify-code"), async ({ request }) => {
    const { email, phone, verify_by, code } = (await request.json()) as {
      email?: string;
      phone?: string;
      verify_by?: string;
      code: string;
    };
    const contact = (verify_by === "phone" ? phone : email) ?? "";
    const signup = signups.get(contact);
    if (code !== VERIFICATION_CODE || !signup) {
      return HttpResponse.json({ code: ["Wrong, expired or used code."] }, { status: 400 });
    }
    // `exists@…` already has an account: the right code gives no token.
    if (contact.toLowerCase().startsWith("exists@")) {
      return HttpResponse.json(
        { code: "account_exists", detail: "An account already uses this contact." },
        { status: 409 },
      );
    }
    signup.token = `signup-${registered.length + 1}`;
    return HttpResponse.json({ signup_token: signup.token });
  }),
  http.post(api("/api/auth/signup/desk/complete"), async ({ request }) => {
    const { signup_token } = (await request.json()) as { signup_token: string };
    const signup = [...signups.values()].find(({ token }) => token === signup_token);
    if (!signup) return HttpResponse.json({ detail: "Invalid signup token." }, { status: 400 });
    const hin = String(40_000_000_000 + registered.length);
    const sex =
      signup.gender === "male" || signup.gender === "female" ? signup.gender : "prefer_not_to_say";
    registered.push(
      newPatientRecord(
        `registered-${registered.length + 1}`,
        hin,
        `${signup.firstname} ${signup.lastname}`,
        sex,
      ),
    );
    return HttpResponse.json(
      {
        hin,
        firstname: signup.firstname,
        lastname: signup.lastname,
        gender: signup.gender,
        dob: bornYearsAgo(30),
      },
      { status: 201 },
    );
  }),
  http.post(api("/api/patients/:hin/dependants"), async ({ params, request }) => {
    const guardian = registered.find(({ hin }) => hin === params.hin);
    if (!guardian) return HttpResponse.json({ detail: "Not found." }, { status: 404 });
    const body = (await request.json()) as {
      firstname: string;
      lastname: string;
      dob: string;
      gender: string;
      relationship: string;
    };
    const hin = String(40_000_000_000 + registered.length);
    const sex =
      body.gender === "male" || body.gender === "female" ? body.gender : "prefer_not_to_say";
    const child = newPatientRecord(
      `registered-${registered.length + 1}`,
      hin,
      `${body.firstname} ${body.lastname}`,
      sex,
    );
    child.dateOfBirth = body.dob;
    registered.push(child);
    guardian.dependentIds.push({ id: child.id, relationship: body.relationship });
    return HttpResponse.json(
      {
        firstname: body.firstname,
        lastname: body.lastname,
        middlename: null,
        dob: body.dob,
        gender: body.gender,
        hin,
        id_card_generated: false,
      },
      { status: 201 },
    );
  }),
];
