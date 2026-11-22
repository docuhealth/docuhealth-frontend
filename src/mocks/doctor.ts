import { HttpResponse, http } from "msw";
import { env } from "@/env";

// The doctor's front line, faked with the real API's paths and shapes (as staging returns them).
// The signed-in doctor is the staff mock's Raphael Jonnas (staff-1).

const api = (path: string) => `${env.VITE_API_URL}${path}`;

const MINUTE = 60_000;
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * MINUTE).toISOString();

const me = { sqid: "staff-1", firstname: "Raphael", lastname: "Jonnas", role: "doctor" };
const colleague = { sqid: "staff-2", firstname: "Sarah", lastname: "Adeyemi", role: "doctor" };
const nurse = { sqid: "staff-3", firstname: "Heritech", lastname: "Riel", role: "nurse" };

const patient = (
  hin: string,
  firstname: string,
  lastname: string,
  gender: string,
  dob: string,
) => ({
  hin,
  firstname,
  lastname,
  gender,
  dob,
});
const vitals = (minutes: number) => ({
  sqid: `vitals-${minutes}`,
  created_at: minutesAgo(minutes),
  blood_pressure: "130/85",
  temp: 37.9,
  heart_rate: 96,
  resp_rate: 18,
  spo2: 97,
  height: null,
  weight: null,
  pain_score: 3,
  notes: null,
  bmi: null,
});

type CheckIn = {
  sqid: string;
  status: string;
  patient_info: ReturnType<typeof patient>;
  created_at: string;
  escalated_at: string;
  closed_at: string | null;
  triage_priority: string;
  escalated_by: typeof nurse;
  claimed_by: typeof me | null;
  reserved_by: null;
  latest_vitals: ReturnType<typeof vitals>;
};

const checkIn = (
  sqid: string,
  status: string,
  who: ReturnType<typeof patient>,
  minutes: number,
  triage: string,
  claimedBy: typeof me | null = null,
): CheckIn => ({
  sqid,
  status,
  patient_info: who,
  created_at: minutesAgo(minutes + 30),
  escalated_at: minutesAgo(minutes),
  closed_at: null,
  triage_priority: triage,
  escalated_by: nurse,
  claimed_by: claimedBy,
  reserved_by: null,
  latest_vitals: vitals(minutes),
});

const checkIns: CheckIn[] = [
  checkIn(
    "dc-1",
    "doctor_idle",
    patient("4200000000001", "Tunde", "Bakare", "male", "1980-02-14"),
    35,
    "urgent",
  ),
  checkIn(
    "dc-2",
    "doctor_active",
    patient("4200000000002", "Ngozi", "Eze", "female", "1993-07-08"),
    50,
    "routine",
    me,
  ),
  checkIn(
    "dc-3",
    "doctor_active",
    patient("4200000000003", "Kelechi", "Nnamdi", "male", "1977-12-01"),
    55,
    "routine",
    colleague,
  ),
  checkIn(
    "dc-4",
    "doctor_seen",
    patient("4200000000004", "Zainab", "Bello", "female", "2002-03-19"),
    120,
    "routine",
    me,
  ),
  checkIn(
    "dc-5",
    "doctor_active",
    patient("4200000000005", "Amina", "Yusuf", "female", "1989-05-30"),
    65,
    "routine",
    me,
  ),
];

type Note = Record<string, unknown> & { sqid: string; additional_notes: unknown[] };

/** Encounter notes by patient HIN, newest first. */
const notes = new Map<string, Note[]>([
  [
    "4200000000002",
    [
      {
        sqid: "note-1",
        created_at: minutesAgo(60 * 24 * 30),
        staff_info: { ...colleague, specialization: null },
        chief_complaint: "Headache for a week",
        history_of_complain: "Worse in the mornings.",
        primary_diagnosis: "Tension headache",
        treatment_plan: ["Paracetamol 1g as needed"],
        care_instructions: ["Rest, fluids, limit screen time"],
        drug_history_allergies: [],
        is_shared: true,
        next_appointment_info: null,
        additional_notes: [],
      },
    ],
  ],
]);

const labOrders = new Map([
  [
    "4200000000002",
    [
      {
        sqid: "lab-order-1",
        created_at: minutesAgo(60 * 24 * 29),
        ordered_by_info: { ...colleague, specialization: null },
        note: null,
        aggregate_status: "completed",
        items_info: [
          {
            sqid: "lab-item-1",
            status: "result_accepted_by_doctor",
            test_info: { sqid: "t-1", name: "Full Blood Count" },
            result_info: {
              interpretation: "Within normal limits.",
              parameters_info: [
                { value: "13.2", parameter_info: { name: "Haemoglobin", unit: "g/dL" } },
                { value: "6.1", parameter_info: { name: "White cells", unit: "×10⁹/L" } },
              ],
            },
          },
        ],
      },
    ],
  ],
]);

function page<T>(items: T[], request: Request) {
  const params = new URL(request.url).searchParams;
  const pageNumber = Number(params.get("page") ?? 1);
  const size = Number(params.get("size") ?? 10);
  return {
    count: items.length,
    next: null,
    previous: null,
    results: items.slice((pageNumber - 1) * size, pageNumber * size),
  };
}

const notFound = () => HttpResponse.json({ detail: "Not found." }, { status: 404 });

function checkInFor(sqid: unknown) {
  return checkIns.find((entry) => entry.sqid === sqid);
}

export const doctorHandlers = [
  http.get(api("/api/hospital-ops/check-ins/doctor-queue"), ({ request }) => {
    const status = new URL(request.url).searchParams.get("status") ?? "doctor_idle";
    return HttpResponse.json(
      page(
        checkIns.filter((entry) => entry.status === status),
        request,
      ),
    );
  }),
  http.post(api("/api/hospital-ops/check-ins/:sqid/claim"), ({ params }) => {
    const entry = checkInFor(params.sqid);
    if (!entry) return notFound();
    if (entry.status === "doctor_active" && entry.claimed_by?.sqid !== me.sqid) {
      return HttpResponse.json(
        { detail: "Another doctor is seeing this patient." },
        { status: 400 },
      );
    }
    Object.assign(entry, { status: "doctor_active", claimed_by: me });
    return HttpResponse.json({ detail: "Claimed." });
  }),
  http.post(api("/api/hospital-ops/check-ins/:sqid/end-encounter"), ({ params }) => {
    const entry = checkInFor(params.sqid);
    if (!entry) return notFound();
    entry.status = "doctor_seen";
    return HttpResponse.json({ detail: "Encounter ended." });
  }),
  // The front desk's mock checks its own queue out; this one checks out the doctors'.
  http.post(api("/api/hospital-ops/check-ins/:sqid/close"), ({ params }) => {
    const entry = checkInFor(params.sqid);
    if (!entry) return undefined;
    Object.assign(entry, { status: "closed", closed_at: new Date().toISOString() });
    return HttpResponse.json({ detail: "Checked out." });
  }),
  http.get(api("/api/records/patients/:hin/soap-notes"), ({ params, request }) =>
    HttpResponse.json(page(notes.get(String(params.hin)) ?? [], request)),
  ),
  http.post(api("/api/hospital-ops/soap-notes"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown> & {
      patient: string;
      check_in: string;
      chief_complaint?: string;
      primary_diagnosis?: string;
      care_instructions?: string[];
    };
    const entry = checkInFor(body.check_in);
    if (!entry || entry.claimed_by?.sqid !== me.sqid || entry.status !== "doctor_active") {
      return HttpResponse.json(
        { detail: "Only the doctor seeing this patient can write the note." },
        { status: 403 },
      );
    }
    if (!body.chief_complaint || !body.primary_diagnosis || !body.care_instructions?.length) {
      return HttpResponse.json({ chief_complaint: ["This field is required."] }, { status: 400 });
    }
    const note: Note = {
      ...body,
      sqid: `note-${Date.now()}`,
      created_at: new Date().toISOString(),
      staff_info: { ...me, specialization: null },
      next_appointment_info: null,
      additional_notes: [],
    };
    notes.set(body.patient, [note, ...(notes.get(body.patient) ?? [])]);
    return HttpResponse.json(note, { status: 201 });
  }),
  http.post(api("/api/records/soap-note/additional-notes"), async ({ request }) => {
    const { soap_note, note } = (await request.json()) as { soap_note: string; note: string };
    const found = [...notes.values()].flat().find(({ sqid }) => sqid === soap_note);
    if (!found) return notFound();
    const added = { id: Date.now(), soap_note, note, created_at: new Date().toISOString() };
    found.additional_notes.push(added);
    return HttpResponse.json(added, { status: 201 });
  }),
  http.get(api("/api/lab/patients/:hin/test-orders"), ({ params, request }) =>
    HttpResponse.json(page(labOrders.get(String(params.hin)) ?? [], request)),
  ),
  http.post(api("/api/records/vital-signs/requests"), async ({ request }) => {
    const body = (await request.json()) as { patient_hin?: string; check_in?: string };
    if (!body.patient_hin || !body.check_in) {
      return HttpResponse.json({ check_in: ["This field is required."] }, { status: 400 });
    }
    return HttpResponse.json(
      { sqid: `vr-${Date.now()}`, status: "requested", ...body },
      { status: 201 },
    );
  }),
];
