import { HttpResponse, http } from "msw";
import { env } from "@/env";
import type {
  FoundPatient,
  LabOverview,
  LabTest,
  PendingApprovals,
  TestAppointments,
  TestOrder,
  TestRecord,
  TestRecordList,
  TestStage,
} from "@/features/lab-scientist/api/schemas";

const api = (path: string) => `${env.VITE_API_URL}${path}`;

/** This week's numbers; the other periods scale them (pending tests don't). */
const overview: LabOverview = {
  totalTests: 62,
  pendingTests: 12,
  approvedResults: 4,
  returningPatients: 10,
};

const periodScale = { today: 0.25, week: 1, month: 4 } as const;
/** How far ahead each period reaches. */
const periodDays = { today: 1, week: 7, month: 31 } as const;

function periodOf(request: Request) {
  const period = new URL(request.url).searchParams.get("period");
  return period === "today" || period === "month" ? period : "week";
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** `days` from today (negative for the past) at `time` ("09:30"). */
function at(days: number, time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

const patient = (index: number, name: string) => ({
  id: `lab-patient-${index}`,
  name,
  avatarUrl: null,
  hin: String(54_137_284_910 + index * 7_919_301),
});

const appointments: TestAppointments["items"] = (
  [
    [0, "09:30", "Chidi Okafor", "Full Blood Count"],
    [0, "10:00", "Tunde Adeyemi", "Blood Glucose"],
    [1, "13:00", "Amina Yusuf", "Lipid Profile"],
    [2, "11:00", "Chioma Nwosu", "Liver Function Test"],
    [3, "10:30", "Emeka Uche", "Urinalysis"],
    [4, "09:00", "David Bello", "Malaria Parasite Test"],
    [12, "09:30", "Joyce Sarah", "Fasting Blood Sugar"],
  ] as const
).map(([days, time, name, testType], index) => ({
  id: `lab-appointment-${index + 1}`,
  at: at(days, time),
  patient: patient(index + 1, name),
  testType,
}));

const approvals: PendingApprovals["items"] = (
  [
    [0, "10:42", "Amaka Eze", "Full Blood Count"],
    [-1, "15:15", "Chidi Okafor", "Lipid Profile"],
    [-2, "11:20", "Emeka Uche", "Blood Glucose Test"],
    [-2, "09:05", "Grace Nwosu", "Urinalysis"],
    [-3, "15:15", "Chidi Okafor", "Blood Glucose Test"],
    [-4, "12:30", "David Bello", "Malaria Parasite Test"],
  ] as const
).map(([days, time, name, testType], index) => ({
  id: `approval-${index + 1}`,
  testType,
  patient: { id: `lab-approval-patient-${index + 1}`, name },
  enteredAt: at(days, time),
}));

/** The tests each kind of order asks for. */
const catalogue: Record<string, LabTest[]> = {
  "Malaria/typhoid test": [
    {
      name: "Malaria parasite density",
      loinc: "51587-4",
      unit: "/µL",
      referenceLow: 0,
      referenceHigh: 0,
    },
    {
      name: "Widal O antigen titre",
      loinc: "5763-8",
      unit: "1:",
      referenceLow: 0,
      referenceHigh: 80,
    },
  ],
  "Full blood count": [
    { name: "Haemoglobin", loinc: "718-7", unit: "g/dL", referenceLow: 13, referenceHigh: 17 },
    { name: "Packed cell volume", loinc: "4544-3", unit: "%", referenceLow: 40, referenceHigh: 54 },
  ],
  Urinalysis: [
    {
      name: "Urine specific gravity",
      loinc: "5811-5",
      unit: "",
      referenceLow: 1.005,
      referenceHigh: 1.03,
    },
  ],
  "Lipid profile": [
    {
      name: "Total cholesterol",
      loinc: "2093-3",
      unit: "mg/dL",
      referenceLow: 125,
      referenceHigh: 200,
    },
    {
      name: "HDL cholesterol",
      loinc: "2085-9",
      unit: "mg/dL",
      referenceLow: 40,
      referenceHigh: 60,
    },
  ],
  "Liver function test": [
    { name: "ALT", loinc: "1742-6", unit: "U/L", referenceLow: 7, referenceHigh: 56 },
    { name: "AST", loinc: "1920-8", unit: "U/L", referenceLow: 10, referenceHigh: 40 },
  ],
  "Fasting blood sugar": [
    {
      name: "Fasting glucose",
      loinc: "1558-6",
      unit: "mg/dL",
      referenceLow: 70,
      referenceHigh: 100,
    },
  ],
  Haemoglobin: [
    { name: "Haemoglobin", loinc: "718-7", unit: "g/dL", referenceLow: 13, referenceHigh: 17 },
  ],
};
const testTypes = Object.keys(catalogue);

const recordPatients = [
  ["Yemi Ojo", "1974-03-02", "male"],
  ["Chioma Nwosu", "1978-06-14", "female"],
  ["Emeka Uche", "1974-01-20", "male"],
  ["Tunde Adeyemi", "1997-05-11", "male"],
  ["Hauwa Garba", "2001-02-08", "female"],
  ["Chidinma Okeke", "1994-09-30", "female"],
  ["Joyce Sarah", "2001-07-19", "female"],
  ["Adeyemi Samuel", "1997-04-03", "male"],
  ["Ngozi Eze", "1989-12-01", "female"],
  ["Ibrahim Musa", "1965-08-22", "male"],
  ["Fatima Bello", "1992-10-15", "female"],
  ["Segun Oladipo", "1983-11-27", "prefer_not_to_say"],
] as const;
const doctors = ["Dr. Raphael Jonnas", "Dr. Sarah Adeyemi", "Dr. Ibrahim Sani", "Dr. Tola Bello"];

/**
 * Hours ago each tab's orders were requested; how many there are sets the tab's count. All fall
 * within the last week, so "This Week" shows every one and "Today" only the newest.
 */
const stageAges: Record<TestStage, number[]> = {
  pending: [
    2, 20, 30, 54, 75, 98, 120, 126, 130, 134, 138, 142, 146, 150, 154, 158, 160, 162, 164, 166,
  ],
  in_progress: [3, 26, 50, 90],
  completed: Array.from({ length: 32 }, (_, index) => 4 + index * 5),
  rejected: [6, 40, 100],
};

let next = 0;
const records: TestRecord[] = (Object.entries(stageAges) as [TestStage, number[]][]).flatMap(
  ([stage, ages]) =>
    ages.map((hoursAgo, index) => {
      const n = next++;
      const [name, dateOfBirth, sex] = recordPatients[n % recordPatients.length]!;
      return {
        id: `test-order-${n + 1}`,
        patient: { ...patient(100 + n, name), dateOfBirth, sex },
        testType: testTypes[n % testTypes.length]!,
        requestedBy: doctors[n % doctors.length]!,
        requestedAt: new Date(Date.now() - hoursAgo * HOUR).toISOString(),
        stage,
        // The two most recent pending (and the newest rejected) orders haven't been opened yet.
        seen: !((stage === "pending" && index < 2) || (stage === "rejected" && index === 0)),
        // The newest in-progress test was booked; the doctors asked for the rest.
        progress: stage === "in_progress" ? (index === 0 ? "appointment" : "doctor_request") : null,
      };
    }),
);

/** What's been done to orders on the dev server, by order id; it replaces the generated data. */
const acceptedAt = new Map<string, string>();
const sampleCollectedAt = new Map<string, string>();
const rejections = new Map<string, NonNullable<TestOrder["rejection"]>>();
const results = new Map<string, NonNullable<TestOrder["result"]>>();

/** A record from the list, filled out with what its own page shows. */
function orderFor(record: TestRecord, index: number): TestOrder {
  const tests = catalogue[record.testType] ?? catalogue.Haemoglobin!;
  const requested = new Date(record.requestedAt).getTime();
  const after = (minutes: number) => new Date(requested + minutes * MINUTE).toISOString();
  const accepted = record.stage === "in_progress" || record.stage === "completed";
  // Half the seeded in-progress orders have their sample in already; one accepted here doesn't.
  const collected =
    record.stage === "completed" ||
    (record.stage === "in_progress" && !acceptedAt.has(record.id) && index % 2 === 0);

  return {
    id: record.id,
    stage: record.stage,
    patient: { ...record.patient, hmo: index % 3 !== 2 },
    tests,
    pregnancyStatus: record.patient.sex === "female" && index % 4 === 0 ? "1st trimester" : null,
    requestedBy: record.requestedBy,
    requestedAt: record.requestedAt,
    provider: {
      name: "Downtown Medical Clinic",
      email: "lab-requests@downtownmedical.example.com",
    },
    note:
      index % 2 === 0
        ? "Patient reports fatigue and intermittent fever for a week. Please flag anything outside the range."
        : null,
    acceptedAt: acceptedAt.get(record.id) ?? (accepted ? after(30) : null),
    sampleCollectedAt: sampleCollectedAt.get(record.id) ?? (collected ? after(60) : null),
    rejection:
      rejections.get(record.id) ??
      (record.stage === "rejected"
        ? {
            at: after(45),
            reason:
              "The sample was haemolysed and can’t be tested. Please collect a fresh sample and send a new request.",
          }
        : null),
    result:
      results.get(record.id) ??
      (record.stage === "completed"
        ? {
            uploadedAt: after(240),
            values: tests.map((test) => ({
              loinc: test.loinc,
              value: Number(((test.referenceLow + test.referenceHigh) / 2).toFixed(2)),
            })),
            interpretation:
              "All values fall within their reference ranges.\nNo evidence of anaemia, infection or organ dysfunction.",
            clinicalCorrelation:
              "Normal results suggest the patient’s symptoms may have another cause; consider further evaluation.\nRepeat testing if symptoms persist.",
          }
        : null),
  };
}

function matches(search: string | null, ...values: string[]) {
  const term = search?.trim().toLowerCase();
  return !term || values.some((value) => value.toLowerCase().includes(term));
}

/** The order's record and index, or a response saying why it can't be changed. */
function changeable(id: unknown, stage: TestStage, message: string) {
  const index = records.findIndex((record) => record.id === id);
  const record = records[index];
  if (!record) {
    return { error: HttpResponse.json({ message: "Test order not found." }, { status: 404 }) };
  }
  if (record.stage !== stage) {
    return { error: HttpResponse.json({ message }, { status: 409 }) };
  }
  return { record, index };
}

/**
 * Everyone the lab mock knows, for looking a HIN up when booking: the patients with upcoming
 * tests (Chidi Okafor is 541-452-042-11) and those on the test orders.
 */
function knownPatients(): FoundPatient[] {
  const seen = new Map<string, FoundPatient>();
  for (const { patient: person } of appointments) {
    seen.set(person.hin, {
      ...person,
      dateOfBirth: "1990-01-15",
      phone: null,
      email: `${person.name.toLowerCase().replace(/\s+/g, ".")}@email.com`,
    });
  }
  for (const { patient: person } of records) {
    const { sex: _sex, ...rest } = person;
    seen.set(person.hin, { ...rest, phone: null, email: null });
  }
  return [...seen.values()];
}

export const labScientistHandlers = [
  http.get(api("/hospital/lab/overview"), ({ request }) => {
    const scale = periodScale[periodOf(request)];
    return HttpResponse.json({
      totalTests: Math.round(overview.totalTests * scale),
      pendingTests: overview.pendingTests,
      approvedResults: Math.round(overview.approvedResults * scale),
      returningPatients: Math.round(overview.returningPatients * scale),
    } satisfies LabOverview);
  }),
  http.get(api("/hospital/lab/appointments"), ({ request }) => {
    const until = Date.now() + periodDays[periodOf(request)] * DAY;
    return HttpResponse.json({
      items: appointments.filter((item) => new Date(item.at).getTime() < until),
    } satisfies TestAppointments);
  }),
  http.post(api("/hospital/lab/appointments"), async ({ request }) => {
    const { patientId, at: when } = (await request.json()) as { patientId: string; at: string };
    const found = knownPatients().find(({ id }) => id === patientId);
    if (!found) return HttpResponse.json({ message: "Patient not found" }, { status: 404 });
    const appointment: TestAppointments["items"][number] = {
      id: `lab-appointment-${appointments.length + 1}`,
      at: when,
      patient: { id: found.id, name: found.name, avatarUrl: found.avatarUrl, hin: found.hin },
      testType: "Lab test",
    };
    appointments.push(appointment);
    appointments.sort((a, b) => a.at.localeCompare(b.at));
    return HttpResponse.json(appointment, { status: 201 });
  }),
  http.get(api("/hospital/lab/approvals"), () =>
    HttpResponse.json({ items: approvals } satisfies PendingApprovals),
  ),
  http.get(api("/hospital/lab/patients"), ({ request }) => {
    const hin = new URL(request.url).searchParams.get("hin")?.replace(/\D/g, "");
    return HttpResponse.json({
      items: knownPatients().filter((person) => person.hin === hin),
    });
  }),
  http.post(api("/hospital/lab/test-orders/:id/accept"), ({ params }) => {
    const found = changeable(params.id, "pending", "Only a pending order can be accepted.");
    if (found.error) return found.error;
    acceptedAt.set(found.record.id, new Date().toISOString());
    records[found.index] = {
      ...found.record,
      stage: "in_progress",
      seen: true,
      progress: "doctor_request",
    };
    return HttpResponse.json(orderFor(records[found.index]!, found.index));
  }),
  http.post(api("/hospital/lab/test-orders/:id/reject"), async ({ params, request }) => {
    const found = changeable(params.id, "pending", "Only a pending order can be rejected.");
    if (found.error) return found.error;
    const { reason } = (await request.json()) as { reason: string };
    rejections.set(found.record.id, { at: new Date().toISOString(), reason });
    records[found.index] = { ...found.record, stage: "rejected", seen: true };
    return HttpResponse.json(orderFor(records[found.index]!, found.index));
  }),
  http.put(api("/hospital/lab/test-orders/:id/sample-collection"), async ({ params, request }) => {
    const found = changeable(params.id, "in_progress", "Only an order in progress can be logged.");
    if (found.error) return found.error;
    const { collectedAt } = (await request.json()) as { collectedAt: string };
    sampleCollectedAt.set(found.record.id, collectedAt);
    return HttpResponse.json(orderFor(found.record, found.index));
  }),
  http.post(api("/hospital/lab/test-orders/:id/result"), async ({ params, request }) => {
    const found = changeable(params.id, "in_progress", "Only an order in progress takes results.");
    if (found.error) return found.error;
    const body = (await request.json()) as Omit<NonNullable<TestOrder["result"]>, "uploadedAt"> & {
      collectedAt: string;
    };
    sampleCollectedAt.set(found.record.id, body.collectedAt);
    results.set(found.record.id, {
      uploadedAt: new Date().toISOString(),
      values: body.values,
      interpretation: body.interpretation,
      clinicalCorrelation: body.clinicalCorrelation,
    });
    records[found.index] = { ...found.record, stage: "completed", progress: null };
    return HttpResponse.json(orderFor(records[found.index]!, found.index));
  }),
  http.get(api("/hospital/lab/test-orders/:id"), ({ params }) => {
    const index = records.findIndex((record) => record.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ message: "Test order not found." }, { status: 404 });
    }
    return HttpResponse.json(orderFor(records[index]!, index));
  }),
  http.get(api("/hospital/lab/test-orders"), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const stage = (params.get("stage") ?? "pending") as TestStage;
    const page = Number(params.get("page") ?? 1);
    const pageSize = Number(params.get("pageSize") ?? 7);
    const direction = params.get("sort") === "oldest" ? -1 : 1;
    const period = params.get("period");
    const since =
      period === "today" || period === "week" || period === "month"
        ? Date.now() - periodDays[period] * DAY
        : 0;
    const inPeriod = records.filter((record) => new Date(record.requestedAt).getTime() > since);

    const matching = inPeriod
      .filter(
        (record) =>
          record.stage === stage &&
          matches(params.get("search"), record.patient.name, record.patient.hin, record.testType),
      )
      .sort(
        (a, b) =>
          (new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()) * direction,
      );
    const count = (of: TestStage) => inPeriod.filter((record) => record.stage === of).length;

    return HttpResponse.json({
      counts: {
        pending: count("pending"),
        in_progress: count("in_progress"),
        completed: count("completed"),
        rejected: count("rejected"),
      },
      total: matching.length,
      items: matching.slice((page - 1) * pageSize, page * pageSize),
    } satisfies TestRecordList);
  }),
];
