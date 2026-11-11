import { HttpResponse, http } from "msw";
import { env } from "@/env";
import type {
  DependentLinked,
  AppointmentCalendar,
  CalendarAppointment,
  AppointmentDetail,
  AppointmentList,
  AppointmentRequest,
  CheckOutSummary,
  LinkedPerson,
  PatientLookup,
  PatientProfile,
  ReceptionistProfile,
  ReceptionOverview,
  ReceptionQueue,
  RegisteredPatient,
  Sex,
} from "@/features/receptionist/api/schemas";

const api = (path: string) => `${env.VITE_API_URL}${path}`;

const profile: ReceptionistProfile = {
  hospital: { name: "Lagos University Teaching Hospital", shortName: "LUTH", bannerUrl: null },
  user: {
    firstName: "Kemi",
    lastName: "Adewale",
    email: "kemi.adewale@luth.example.com",
    avatarUrl: null,
  },
  unreadNotifications: 1,
  unreadMessages: 3,
};

const overview: ReceptionOverview = {
  totalCheckIns: 2486,
  totalCheckInsChange: 12,
  waitingInQueue: 8,
  waitingInQueueChange: -33,
  checkedInToday: 24,
  checkedInTodayChange: 9,
  appointmentsToday: 36,
  appointmentsTodayChange: 6,
};

const periodScale = { today: 0.15, week: 1, month: 4 } as const;

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
  patient: { id: `patient-${index + 1}`, name, phone },
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
      },
      reason: calendarReasons[Math.floor(noise(seed + 0.25) * calendarReasons.length)] ?? "",
      status: cancelled ? "cancelled" : days < 0 ? "checked_in" : "upcoming",
    });
  });
}
appointments.sort((a, b) => a.at.localeCompare(b.at));

/** What the calendar's chips leave out: set when booked, or made up from the patient. */
const appointmentExtras = new Map<string, { note: string | null; bookedWith: string }>();

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

function calendarAppointment(appointment: Appointment): CalendarAppointment {
  const { hin, dateOfBirth, sex } = patientFacts(appointment.patient);
  return { ...appointment, patient: { ...appointment.patient, hin, dateOfBirth, sex } };
}

function appointmentDetail(appointment: Appointment): AppointmentDetail {
  const { id, name, phone } = appointment.patient;
  const extras = appointmentExtras.get(appointment.id);
  const { hin, registeredPatient } = patientFacts(appointment.patient);
  return {
    ...appointment,
    patient: {
      id,
      name,
      hin,
      phone,
      email: registeredPatient?.email ?? `${name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
    },
    bookedWith: extras?.bookedWith ?? "Front desk",
    note: extras ? extras.note : appointment.reason,
  };
}

/** Bookable slots a day: every half hour from 08:00 to 18:00. */
const SLOTS_PER_DAY = 20;

function between(from: Date, to: Date) {
  return appointments.filter(({ at }) => new Date(at) >= from && new Date(at) < to);
}

const queue: ReceptionQueue["items"] = (
  [
    ["Chinonso Okafor", "DH-28491", "Check-up", 12],
    ["Amina Yusuf", "DH-28492", "Lab Results", 18],
    ["Tunde Adeyemi", "DH-28493", "Fever", 24],
    ["Chioma Nwosu", "DH-39172", "Routine Check-up", 32],
    ["Emeka Uche", "DH-28495", "Medication Review", 38],
    ["Hauwa Garba", "DH-28496", "Antenatal Check", 41],
    ["Yemi Ojo", "DH-28497", "Wound Dressing", 45],
    ["Chidinma Okeke", "DH-28498", "Follow-up", 52],
  ] as const
).map(([name, hin, reason, waitMinutes], index) => ({
  id: `queue-${index + 1}`,
  patient: { id: `patient-${index + 1}`, name, hin },
  reason,
  waitMinutes,
}));

// Chinonso's doctor wants to see them again; everyone else in the queue has nothing to book.
const appointmentRequests: (AppointmentRequest & { patientId: string })[] = [
  {
    id: "request-1",
    patientId: "patient-1",
    reason: "Follow-up visit",
    requestedBy: "Dr. Adebayo",
    requestedAt: at(0, "10:12"),
    proposedAt: at(14, "10:00"),
    note: "Review blood pressure two weeks after the medication change.",
    status: "pending",
  },
];

/** A request as the API sends it, without the mock's link to its patient. */
function withoutPatient(request: AppointmentRequest & { patientId: string }): AppointmentRequest {
  return {
    id: request.id,
    reason: request.reason,
    requestedBy: request.requestedBy,
    requestedAt: request.requestedAt,
    proposedAt: request.proposedAt,
    note: request.note,
    status: request.status,
  };
}

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
    visits,
    dependentIds: dependents.map((entry) => {
      const [number, relationship = ""] = entry.split(":");
      return { id: `registered-${number}`, relationship };
    }),
  };
});

function linked(patient: MockPatient, relationship: string | null): LinkedPerson {
  return {
    id: patient.id,
    name: patient.name,
    avatarUrl: patient.avatarUrl,
    dateOfBirth: patient.dateOfBirth,
    sex: patient.sex,
    relationship,
    lastVisitAt: patient.lastVisit?.at ?? null,
  };
}

/** A patient's profile, with the people linked to their account. */
function patientProfile({ dependentIds, ...patient }: MockPatient): PatientProfile {
  return {
    ...patient,
    dependents: registered
      .filter(({ id }) => dependentIds.some((dependent) => dependent.id === id))
      .map((dependent) => linked(dependent, null)),
    proxies: registered.flatMap((proxy) => {
      const link = proxy.dependentIds.find(({ id }) => id === patient.id);
      return link ? [linked(proxy, link.relationship)] : [];
    }),
  };
}

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
    visits: [],
    dependentIds: [],
  };
}

/** Which tab an appointment falls under, by its calendar day. */
function dayOf(appointment: Appointment) {
  const date = new Date(appointment.at);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === new Date().toDateString()) return "today";
  if (date.toDateString() === tomorrow.toDateString()) return "tomorrow";
  return date > tomorrow ? "upcoming" : "past";
}

function matches(search: string | null, ...values: string[]) {
  const term = search?.trim().toLowerCase();
  return !term || values.some((value) => value.toLowerCase().includes(term));
}

/** The code every "emailed" verification code is, so registration can be clicked through. */
const VERIFICATION_CODE = "123456";

export const receptionistHandlers = [
  http.get(api("/hospital/reception/profile"), () => HttpResponse.json(profile)),
  http.get(api("/hospital/reception/overview"), ({ request }) => {
    const period = new URL(request.url).searchParams.get("period");
    const scale = periodScale[period === "today" || period === "month" ? period : "week"];
    return HttpResponse.json({
      ...overview,
      totalCheckIns: Math.round(overview.totalCheckIns * scale),
      waitingInQueue: queue.length,
    } satisfies ReceptionOverview);
  }),
  http.get(api("/hospital/reception/appointments"), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const day = params.get("day") ?? "today";
    const count = (tab: string) => appointments.filter((a) => dayOf(a) === tab).length;
    return HttpResponse.json({
      counts: { today: count("today"), tomorrow: count("tomorrow"), upcoming: count("upcoming") },
      items: appointments.filter(
        (appointment) =>
          dayOf(appointment) === day &&
          matches(params.get("search"), appointment.patient.name, appointment.patient.phone),
      ),
    } satisfies AppointmentList);
  }),
  http.get(api("/hospital/reception/appointments/calendar"), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const from = new Date(params.get("from") ?? "");
    const to = new Date(params.get("to") ?? "");
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) {
      return HttpResponse.json({ message: "Pick a valid date range" }, { status: 400 });
    }
    const items = between(from, to);
    const before = between(new Date(from.getTime() - (to.getTime() - from.getTime())), from);
    const cancelled = (list: Appointment[]) =>
      list.filter(({ status }) => status === "cancelled").length;
    const days = Math.round((to.getTime() - from.getTime()) / 86_400_000);
    const totalSlots = days * SLOTS_PER_DAY;
    return HttpResponse.json({
      summary: {
        booked: items.length,
        bookedChange: before.length
          ? Math.round(((items.length - before.length) / before.length) * 100)
          : 0,
        checkedIn: items.filter(({ status }) =>
          ["arrived", "checked_in", "in_progress"].includes(status),
        ).length,
        cancelled: cancelled(items),
        cancelledChange: cancelled(items) - cancelled(before),
        openSlots: Math.max(0, totalSlots - (items.length - cancelled(items))),
        totalSlots,
      },
      items: items.map(calendarAppointment),
    } satisfies AppointmentCalendar);
  }),
  http.get(api("/hospital/reception/appointments/:id"), ({ params }) => {
    const appointment = appointments.find(({ id }) => id === params.id);
    if (!appointment)
      return HttpResponse.json({ message: "Appointment not found" }, { status: 404 });
    return HttpResponse.json(appointmentDetail(appointment));
  }),
  http.post(api("/hospital/reception/appointments/:id/reschedule"), async ({ params, request }) => {
    const appointment = appointments.find(({ id }) => id === params.id);
    if (!appointment)
      return HttpResponse.json({ message: "Appointment not found" }, { status: 404 });
    if (appointment.status !== "upcoming") {
      return HttpResponse.json(
        { message: "Only upcoming appointments can be rescheduled." },
        { status: 409 },
      );
    }
    const { at, note } = (await request.json()) as { at: string; note: string };
    appointment.at = at;
    appointments.sort((a, b) => a.at.localeCompare(b.at));
    appointmentExtras.set(appointment.id, {
      note: note.trim() || null,
      bookedWith: appointmentExtras.get(appointment.id)?.bookedWith ?? "Front desk",
    });
    return HttpResponse.json(appointmentDetail(appointment));
  }),
  http.post(api("/hospital/reception/appointments/:id/cancel"), async ({ params, request }) => {
    const { reason } = (await request.json()) as { reason?: string };
    if (!reason) return HttpResponse.json({ message: "Give a reason" }, { status: 400 });
    const appointment = appointments.find(({ id }) => id === params.id);
    if (!appointment)
      return HttpResponse.json({ message: "Appointment not found" }, { status: 404 });
    if (appointment.status !== "upcoming") {
      return HttpResponse.json(
        { message: "Only upcoming appointments can be cancelled." },
        { status: 409 },
      );
    }
    appointment.status = "cancelled";
    return HttpResponse.json(appointmentDetail(appointment));
  }),
  http.get(api("/hospital/reception/queue"), ({ request }) => {
    const search = new URL(request.url).searchParams.get("search");
    return HttpResponse.json({
      items: queue.filter((entry) => matches(search, entry.patient.name, entry.patient.hin)),
    } satisfies ReceptionQueue);
  }),
  http.get(api("/hospital/reception/patients"), ({ request }) => {
    const hin = new URL(request.url).searchParams.get("hin")?.replace(/\D/g, "");
    return HttpResponse.json({
      items: registered
        .filter((patient) => patient.hin === hin)
        .map(({ id, name, hin, dateOfBirth, sex, avatarUrl, phone, email }) => ({
          id,
          name,
          hin,
          dateOfBirth,
          sex,
          avatarUrl,
          phone,
          email,
        })),
    } satisfies PatientLookup);
  }),
  http.post(api("/hospital/reception/patient-verifications"), async ({ request }) => {
    const { email } = (await request.json()) as { email: string };
    return HttpResponse.json({ email });
  }),
  http.post(api("/hospital/reception/patient-verifications/check"), async ({ request }) => {
    const { email, code } = (await request.json()) as { email: string; code: string };
    if (code !== VERIFICATION_CODE) {
      return HttpResponse.json(
        { message: "That code isn’t right. Check it and try again." },
        {
          status: 400,
        },
      );
    }
    return HttpResponse.json({ verificationToken: `verified:${email}` });
  }),
  http.post(api("/hospital/reception/patients"), async ({ request }) => {
    const patient = (await request.json()) as {
      firstName: string;
      lastName: string;
      sex: Sex;
      email: string;
      phone: string;
    };
    const id = `registered-${registered.length + 1}`;
    const hin = String(40_000_000_000 + registered.length);
    registered.push({
      id,
      name: `${patient.firstName} ${patient.lastName}`,
      hin,
      dateOfBirth: bornYearsAgo(30),
      sex: patient.sex,
      avatarUrl: null,
      coverage: "private",
      phone: patient.phone,
      email: patient.email,
      address: null,
      assignedDoctor: null,
      lastVisit: null,
      lastCheckIn: null,
      upcomingAppointment: null,
      visits: [],
      dependentIds: [],
    });
    return HttpResponse.json({ id, hin } satisfies RegisteredPatient, { status: 201 });
  }),
  http.post(api("/hospital/reception/appointments"), async ({ request }) => {
    const { patientId, at, note } = (await request.json()) as {
      patientId: string;
      at: string;
      note: string;
    };
    const profile = registered.find(({ id }) => id === patientId);
    const name =
      profile?.name ?? queue.find(({ patient }) => patient.id === patientId)?.patient.name;
    if (!name) return HttpResponse.json({ message: "Patient not found" }, { status: 404 });
    const appointment: Appointment = {
      id: `appointment-${appointments.length + 1}`,
      at,
      patient: { id: patientId, name, phone: profile?.phone ?? "+2348095512093" },
      reason: "Consultation",
      status: "upcoming",
    };
    appointments.push(appointment);
    appointments.sort((a, b) => a.at.localeCompare(b.at));
    appointmentExtras.set(appointment.id, { note: note.trim() || null, bookedWith: "Front desk" });
    if (profile) profile.upcomingAppointment = { at, department: "General Medicine" };
    return HttpResponse.json(appointment, { status: 201 });
  }),
  http.post(api("/hospital/reception/phone-verifications"), async ({ request }) => {
    const { phone } = (await request.json()) as { phone: string };
    return HttpResponse.json({ phone });
  }),
  http.post(api("/hospital/reception/phone-verifications/check"), async ({ request }) => {
    const { phone, code } = (await request.json()) as { phone: string; code: string };
    if (code !== VERIFICATION_CODE) {
      return HttpResponse.json(
        { message: "That code isn’t right. Check it and try again." },
        { status: 400 },
      );
    }
    return HttpResponse.json({ verificationToken: `verified:${phone}` });
  }),
  http.post(api("/hospital/reception/guardians"), async ({ request }) => {
    const guardian = (await request.json()) as {
      firstName: string;
      lastName: string;
      sex: Sex;
      email: string | null;
      phone: string;
    };
    const id = `registered-${registered.length + 1}`;
    const hin = String(40_000_000_000 + registered.length);
    registered.push({
      ...newPatientRecord(id, hin, `${guardian.firstName} ${guardian.lastName}`, guardian.sex),
      dateOfBirth: bornYearsAgo(35),
      phone: guardian.phone,
      email: guardian.email,
    });
    return HttpResponse.json({ id, hin } satisfies RegisteredPatient, { status: 201 });
  }),
  http.post(api("/hospital/reception/dependents"), async ({ request }) => {
    const link = (await request.json()) as {
      guardianId: string;
      child:
        { id: string } | { firstName: string; lastName: string; dateOfBirth: string; sex: Sex };
      relationship: string;
    };
    const guardian = registered.find(({ id }) => id === link.guardianId);
    if (!guardian) return HttpResponse.json({ message: "Guardian not found" }, { status: 404 });
    const existingId = "id" in link.child ? link.child.id : null;
    let child = registered.find(({ id }) => id === existingId);
    if ("firstName" in link.child) {
      const { firstName, lastName, dateOfBirth, sex } = link.child;
      const id = `registered-${registered.length + 1}`;
      child = {
        ...newPatientRecord(
          id,
          String(40_000_000_000 + registered.length),
          `${firstName} ${lastName}`,
          sex,
        ),
        dateOfBirth,
      };
      registered.push(child);
    }
    if (!child) return HttpResponse.json({ message: "Child not found" }, { status: 404 });
    const childId = child.id;
    if (!guardian.dependentIds.some(({ id }) => id === childId)) {
      guardian.dependentIds.push({ id: childId, relationship: link.relationship });
    }
    return HttpResponse.json(
      {
        child: { id: child.id, name: child.name, hin: child.hin },
        guardian: { id: guardian.id, name: guardian.name },
      } satisfies DependentLinked,
      { status: 201 },
    );
  }),
  http.get(api("/hospital/reception/patients/:id"), ({ params }) => {
    const patient = registered.find(({ id }) => id === params.id);
    if (!patient) return HttpResponse.json({ message: "Patient not found" }, { status: 404 });
    return HttpResponse.json(patientProfile(patient));
  }),
  http.get(api("/hospital/reception/queue/:id/check-out-summary"), ({ params }) => {
    const entry = queue.find(({ id }) => id === params.id);
    if (!entry) return HttpResponse.json({ message: "Not in the queue" }, { status: 404 });
    const { id, name, hin } = entry.patient;
    return HttpResponse.json({
      patient: {
        id,
        name,
        hin: hin.replace(/\D/g, ""),
        phone: "0809 551 2093",
        email: `${name.toLowerCase().replace(" ", ".")}@gmail.com`,
      },
      appointmentRequests: appointmentRequests
        .filter(({ patientId }) => patientId === id)
        .map(withoutPatient),
    } satisfies CheckOutSummary);
  }),
  http.post(
    api("/hospital/reception/appointment-requests/:id/:answer"),
    ({ params: { id, answer } }) => {
      const found = appointmentRequests.find((request) => request.id === id);
      if (!found || (answer !== "confirm" && answer !== "cancel")) {
        return HttpResponse.json({ message: "Request not found" }, { status: 404 });
      }
      found.status = answer === "confirm" ? "confirmed" : "cancelled";
      return HttpResponse.json(withoutPatient(found));
    },
  ),
  http.post(api("/hospital/reception/queue/:id/check-out"), ({ params }) => {
    const index = queue.findIndex(({ id }) => id === params.id);
    const [entry] = index === -1 ? [] : queue.splice(index, 1);
    if (!entry) return HttpResponse.json({ message: "Not in the queue" }, { status: 404 });
    return HttpResponse.json(entry);
  }),
];
