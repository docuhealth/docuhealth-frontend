import { HttpResponse, http } from "msw";
import { env } from "@/env";
import { patients as adminPatients } from "@/mocks/hospital-admin";

// What staff see of one patient's visits and family at their hospital, as
// docs/backend-handoff-2026-11-25-dashboards.md shows it: `GET /api/patients/{hin}/visit-metrics`,
// `…/guardianship` and `…/visits`. The admin's and the front desk's patient pages both read them,
// so the patients here are the admin mock's plus the receptionist mock's registered ones.

const api = (path: string) => `${env.VITE_API_URL}${path}`;

const DAY = 24 * 60 * 60_000;

const hospitalInfo = { name: "Lagos University Teaching Hospital", email: null, sqid: "pm9XGQd" };

/** Someone named on a record (`staff`, `*_by_info`). */
const person = (sqid: string, firstname: string, lastname: string, role: string) => ({
  sqid,
  firstname,
  lastname,
  role,
  specialization: null,
});
const doctors = [
  person("staff-1", "Raphael", "Jonnas", "doctor"),
  person("staff-2", "Sarah", "Adeyemi", "doctor"),
  person("staff-10", "Grace", "Effiong", "doctor"),
];

type PatientRecord = {
  hin: string;
  firstname: string;
  lastname: string;
  dob: string;
  gender: string;
  phone_num: string;
  /** `null` for a dependant, who has no login. */
  email: string | null;
  /** How they pay here. */
  acct_type: string;
  /** How many check-ins and attended appointments they've had here. */
  visits: number;
  /** HINs of the patients whose guardian this one is. */
  dependants: string[];
};

/** `dob` for someone `age` years old, with a birthday a month ago so the age shown stays `age`. */
function bornYearsAgo(age: number) {
  const birth = new Date(Date.now() - 30 * DAY);
  birth.setFullYear(birth.getFullYear() - age);
  return birth.toISOString().slice(0, 10);
}

const records: PatientRecord[] = [
  // The hospital admin's patients; Yemi Ojo is Tobi's father, and Sola hasn't visited yet.
  ...adminPatients.map((patient, index) => ({
    hin: patient.hin,
    firstname: patient.firstname,
    lastname: patient.lastname,
    dob: patient.dob,
    gender: patient.gender,
    phone_num: patient.phone_num,
    email: patient.email ?? null,
    acct_type: patient.payment_provider.type,
    visits: patient.firstname === "Sola" ? 0 : (index % 4) + 2,
    dependants: patient.firstname === "Yemi" ? ["7894623012343"] : [],
  })),
  // The front desk's registered patients: Adeola and Tunde Williams are Samuel's and Ireti's
  // parents.
  ...(
    [
      [
        "Adeola",
        "Williams",
        "12334567890",
        "female",
        36,
        12,
        "hmo",
        ["12334567891", "12334567892"],
      ],
      ["Samuel", "Williams", "12334567891", "male", 6, 5, "private", []],
      ["Ireti", "Williams", "12334567892", "female", 4, 0, "private", []],
      [
        "Tunde",
        "Williams",
        "12334567893",
        "male",
        39,
        3,
        "company",
        ["12334567891", "12334567892"],
      ],
      ["Chinonso", "Okafor", "28491000001", "male", 29, 2, "hmo", []],
      ["Amina", "Yusuf", "28492000002", "female", 41, 7, "private", []],
    ] as const
  ).map(([firstname, lastname, hin, gender, age, visits, acctType, dependants], index) => ({
    hin,
    firstname,
    lastname,
    dob: bornYearsAgo(age),
    gender,
    phone_num: age < 18 ? "" : `0803${String(4_567_890 + index * 1_111).padStart(7, "0")}`,
    email: age < 18 ? null : `${firstname}.${lastname}@email.com`.toLowerCase(),
    acct_type: acctType,
    visits,
    dependants: [...dependants],
  })),
];

const guardiansOf = (hin: string) => records.filter(({ dependants }) => dependants.includes(hin));

/**
 * A HIN the mock doesn't know, e.g. someone just registered at the front desk: on record, but
 * with no visits or family here yet. (The real API answers 404 for a HIN it doesn't have.)
 */
const newRecord = (hin: string): PatientRecord => ({
  hin,
  firstname: "",
  lastname: "",
  dob: bornYearsAgo(30),
  gender: "unknown",
  phone_num: "",
  email: null,
  acct_type: "private",
  visits: 0,
  dependants: [],
});

const recordOf = (hin: string) => records.find((record) => record.hin === hin) ?? newRecord(hin);

/** `days` from today at `time` ("09:42"), as an ISO string. */
function at(days: number, time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const date = new Date(Date.now() + days * DAY);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

/** The `patient` on an appointment; a dependant's has no `email` key. */
const appointmentPatient = (record: PatientRecord) => ({
  dob: record.dob,
  gender: record.gender,
  phone_num: record.phone_num,
  firstname: record.firstname,
  lastname: record.lastname,
  middlename: null,
  hin: record.hin,
  street: "24 Allen Avenue",
  city: "Ikeja",
  state: "Lagos",
  country: "Nigeria",
  ...(record.email === null ? {} : { email: record.email }),
  contact_email: null,
  payment_provider: { type: record.acct_type, provider: null, member_id: null, updated_at: null },
});

type Visit =
  | { type: "appointment"; time: string; appointment: ReturnType<typeof appointment> }
  | { type: "check-in"; time: string; check_in: ReturnType<typeof checkIn> };

function appointment(
  record: PatientRecord,
  index: number,
  scheduled: string,
  status: "pending" | "confirmed" | "cancelled" | "completed",
  type: string | null,
  lastVisited: string | null,
) {
  const doctor = doctors[index % doctors.length] ?? null;
  return {
    id: 900 + index,
    sqid: `${record.hin}-appointment-${index + 1}`,
    status,
    scheduled_time: scheduled,
    staff: doctor,
    patient: appointmentPatient(record),
    last_visited: lastVisited,
    note: type === "follow-up" ? "Review blood pressure" : null,
    type,
    hospital_info: hospitalInfo,
    closed_at: status === "completed" ? scheduled : null,
    closed_by_info: status === "completed" ? doctor : null,
  };
}

function checkIn(record: PatientRecord, index: number, created: string, open: boolean) {
  return {
    sqid: `${record.hin}-check-in-${index + 1}`,
    status: open ? "nursing_active" : "closed",
    hospital_info: hospitalInfo,
    patient_info: {
      hin: record.hin,
      firstname: record.firstname,
      lastname: record.lastname,
      gender: record.gender,
      dob: record.dob,
    },
    created_at: created,
    escalated_at: null,
    closed_at: open ? null : new Date(new Date(created).getTime() + 90 * 60_000).toISOString(),
  };
}

/**
 * A patient's visits here, latest first: `record.visits` check-ins and attended appointments a
 * fortnight apart (every third an appointment), plus, once they've visited, a cancelled
 * appointment and a follow-up booked for three days' time.
 */
function visitsOf(record: PatientRecord): Visit[] {
  const visits: Visit[] = [];
  for (let index = 0; index < record.visits; index++) {
    const time = at(-(2 + index * 14), "09:42");
    const previous = index + 1 < record.visits ? at(-(2 + (index + 1) * 14), "09:42") : null;
    visits.push(
      index % 3 === 1
        ? {
            type: "appointment",
            time,
            appointment: appointment(record, index, time, "completed", "consultation", previous),
          }
        : { type: "check-in", time, check_in: checkIn(record, index, time, false) },
    );
  }
  const lastVisit = visits[0]?.time ?? null;
  if (record.visits > 0) {
    const booked = at(3, "10:00");
    const cancelled = at(-9, "11:30");
    visits.push(
      {
        type: "appointment",
        time: booked,
        appointment: appointment(record, record.visits, booked, "pending", "follow-up", lastVisit),
      },
      {
        type: "appointment",
        time: cancelled,
        appointment: appointment(record, record.visits + 1, cancelled, "cancelled", null, null),
      },
    );
  }
  return visits.sort((a, b) => b.time.localeCompare(a.time));
}

/** A check-in, or an appointment that was confirmed or held: what counts as a visit. */
const isAttended = (visit: Visit) =>
  visit.type === "check-in" ||
  visit.appointment.status === "confirmed" ||
  visit.appointment.status === "completed";

function page<T>(items: T[], request: Request) {
  const params = new URL(request.url).searchParams;
  const pageNumber = Number(params.get("page") ?? 1);
  const size = Number(params.get("size") ?? 10);
  const next = new URL(request.url);
  next.searchParams.set("page", String(pageNumber + 1));
  return {
    count: items.length,
    next: pageNumber * size < items.length ? next.toString() : null,
    previous: null,
    results: items.slice((pageNumber - 1) * size, pageNumber * size),
  };
}

export const patientRecordHandlers = [
  http.get(api("/api/patients/:hin/visit-metrics"), ({ params }) => {
    const record = recordOf(String(params.hin));
    const visits = visitsOf(record);
    const attended = visits.filter(isAttended);
    const upcoming = visits
      .filter((visit) => visit.type === "appointment" && visit.appointment.status === "pending")
      .at(-1);
    return HttpResponse.json({
      total_visits: attended.length,
      last_visit: attended[0]?.time ?? null,
      last_check_in: visits.find((visit) => visit.type === "check-in")?.time ?? null,
      upcoming_appointment:
        upcoming?.type === "appointment"
          ? {
              sqid: upcoming.appointment.sqid,
              status: upcoming.appointment.status,
              scheduled_time: upcoming.appointment.scheduled_time,
            }
          : null,
      patient_info: {
        firstname: record.firstname,
        lastname: record.lastname,
        dob: record.dob,
        gender: record.gender,
        hin: record.hin,
        phone_num: record.phone_num,
        email: record.email,
        acct_type: record.acct_type,
      },
    });
  }),
  // A dependant's guardians; anyone else's dependants.
  http.get(api("/api/patients/:hin/guardianship"), ({ params, request }) => {
    const record = recordOf(String(params.hin));
    const guardians = guardiansOf(record.hin);
    const linked =
      guardians.length > 0
        ? guardians
        : records.filter(({ hin }) => record.dependants.includes(hin));
    return HttpResponse.json(
      page(
        linked.map((patient) => ({
          sqid: `patient-${patient.hin}`,
          hin: patient.hin,
          firstname: patient.firstname,
          lastname: patient.lastname,
          dob: patient.dob,
          gender: patient.gender,
          last_visit: visitsOf(patient).find(isAttended)?.time ?? null,
        })),
        request,
      ),
    );
  }),
  http.get(api("/api/patients/:hin/visits"), ({ params, request }) => {
    const type = new URL(request.url).searchParams.get("type");
    const visits = visitsOf(recordOf(String(params.hin)));
    if (type === "check-ins") {
      return HttpResponse.json(
        page(
          visits.flatMap((visit) => (visit.type === "check-in" ? [visit.check_in] : [])),
          request,
        ),
      );
    }
    if (type === "appointments") {
      return HttpResponse.json(
        page(
          visits.flatMap((visit) => (visit.type === "appointment" ? [visit.appointment] : [])),
          request,
        ),
      );
    }
    if (type) {
      return HttpResponse.json(
        { type: "type must be 'check-ins' or 'appointments', or left out for both." },
        { status: 400 },
      );
    }
    return HttpResponse.json(
      page(
        visits.map((visit) => ({
          type: visit.type,
          time: visit.time,
          appointment: visit.type === "appointment" ? visit.appointment : null,
          check_in: visit.type === "check-in" ? visit.check_in : null,
        })),
        request,
      ),
    );
  }),
];
