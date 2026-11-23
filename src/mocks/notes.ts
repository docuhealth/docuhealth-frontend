import { HttpResponse, http } from "msw";
import { env } from "@/env";

// A patient's clinical notes and the staff's handovers, faked with the real API's paths and
// shapes (as staging returns them). Every patient has a few notes; Yemi Ojo (admission-1) has
// no admission note yet, so the nurse is asked to write one.

const api = (path: string) => `${env.VITE_API_URL}${path}`;

const HOUR = 60 * 60_000;
const hoursAgo = (hours: number) => new Date(Date.now() - hours * HOUR).toISOString();

/** Yemi Ojo, admitted as admission-1. */
const NEW_ADMISSION_HIN = "5413700000000";

const raphael = { sqid: "staff-1", firstname: "Raphael", lastname: "Jonnas", role: "doctor" };
const sarah = { sqid: "staff-2", firstname: "Sarah", lastname: "Adeyemi", role: "doctor" };
const heritech = { sqid: "staff-3", firstname: "Heritech", lastname: "Riel", role: "nurse" };
const ibrahim = { sqid: "staff-4", firstname: "Ibrahim", lastname: "Sani", role: "nurse" };

type Row = Record<string, unknown> & { sqid: string; created_at: string };
type Notes = Record<"admission" | "progress" | "case" | "care-plan" | "vitals" | "shared", Row[]>;

const vitals = (sqid: string, hours: number, staff: object, extra: object = {}) => ({
  sqid,
  created_at: hoursAgo(hours),
  last_updated: hoursAgo(hours),
  blood_pressure: "124/82",
  temp: 37.1,
  resp_rate: 18,
  heart_rate: 84,
  height: null,
  weight: null,
  spo2: 97,
  pain_score: 2,
  notes: null,
  bmi: null,
  staff_info: staff,
  ...extra,
});

const notes = new Map<string, Notes>();

/** The patient's notes, made the first time they're asked for. */
function notesOf(hin: string): Notes {
  const existing = notes.get(hin);
  if (existing) return existing;
  const id = (kind: string, n: number) => `${kind}-${hin.slice(-4)}-${n}`;
  const made: Notes = {
    admission:
      hin === NEW_ADMISSION_HIN
        ? []
        : [
            {
              sqid: id("admission-note", 1),
              created_at: hoursAgo(1),
              written_by_info: heritech,
              admission_info: null,
              allergies: ["Penicillin"],
              mobility_assessment: "assisted_ambulation",
              mobility_assessment_label: "Assisted ambulation",
              nutritional_assessment: "well_nourished",
              nutritional_assessment_label: "Well nourished",
              fall_risk_assessment: "Moderate: unsteady when tired",
              skin_assessment: "Intact",
              initial_nursing_concern: "Shortness of breath on exertion",
              vital_signs_info: vitals(id("admission-vitals", 1), 1, heritech),
            },
          ],
    progress: [
      {
        sqid: id("progress", 1),
        created_at: hoursAgo(5),
        subjective: "Slept well, less breathless.",
        objective: "Afebrile, crackles at the right base.",
        assessments: "Improving community-acquired pneumonia",
        plan: "Continue IV antibiotics; review the chest X-ray tomorrow.",
      },
    ],
    case: [
      {
        sqid: id("case", 1),
        created_at: hoursAgo(3),
        staff_info: heritech,
        observation: ["Restless overnight", "Pain at the drip site"],
        care: ["Re-sited the cannula"],
        response: ["Settled after 30 minutes"],
        abnormalities: [],
        follow_up: ["Check the site at 06:00"],
      },
    ],
    "care-plan": [
      {
        sqid: id("care-plan", 1),
        created_at: hoursAgo(20),
        staff_info: heritech,
        problem: "Risk of pressure sores",
        goals: ["Skin stays intact"],
        intervention: ["Turn every 2 hours"],
        evaluation: [],
      },
    ],
    vitals: [
      vitals(id("vitals", 1), 2, heritech, { notes: "Before the evening dose." }),
      vitals(id("vitals", 2), 8, ibrahim, { blood_pressure: "130/86", temp: 37.6 }),
    ],
    shared: [
      {
        sqid: id("soap", 1),
        created_at: hoursAgo(1),
        staff_info: raphael,
        chief_complaint: "Cough and fever for three days",
        primary_diagnosis: "Acute bronchitis",
        is_shared: true,
        treatment_plan: "Paracetamol 1 g as needed; fluids.",
        care_instructions: ["Recheck the temperature in 4 hours"],
        additional_notes: [],
      },
    ],
  };
  notes.set(hin, made);
  return made;
}

function page(rows: Row[], request: Request) {
  const params = new URL(request.url).searchParams;
  const size = Number(params.get("size") ?? 10);
  const pageNumber = Number(params.get("page") ?? 1);
  const sorted = [...rows].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return {
    count: rows.length,
    next: null,
    previous: null,
    results: sorted.slice((pageNumber - 1) * size, pageNumber * size),
  };
}

const required = (field: string) => ({ [field]: ["This field is required."] });

const author = { sqid: "staff-3", firstname: "Heritech", lastname: "Riel", role: "nurse" };

/** Handovers, as `DoctorHandoverRead` and the nurse's received and sent rows. */
const patientInfo = {
  hin: "5413702791337",
  firstname: "Chioma",
  lastname: "Nwosu",
  gender: "female",
  dob: "1978-05-02",
};
const doctorHandovers: Row[] = [
  {
    sqid: "doctor-handover-1",
    from_doctor_info: sarah,
    to_doctor_info: raphael,
    patient_info: patientInfo,
    working_diagnosis: "Community-acquired pneumonia",
    current_clinical_status: "Stable, on room air",
    critical_events: null,
    outstanding_investigations: "Chest X-ray",
    pending_procedures: null,
    pending_consult_reviews: null,
    clinical_concerns: null,
    management_plan: "Continue IV antibiotics",
    created_at: hoursAgo(10),
  },
  {
    sqid: "doctor-handover-2",
    from_doctor_info: raphael,
    to_doctor_info: sarah,
    patient_info: { ...patientInfo, hin: "5413700000000", firstname: "Yemi", lastname: "Ojo" },
    working_diagnosis: "Hypertensive urgency",
    current_clinical_status: "BP coming down",
    critical_events: null,
    outstanding_investigations: null,
    pending_procedures: null,
    pending_consult_reviews: null,
    clinical_concerns: "Headache",
    management_plan: null,
    created_at: hoursAgo(30),
  },
];
const nurseFields = {
  general_patient_condition: "Stable",
  significant_events: "None overnight",
  medications_due: "Ceftriaxone at 18:00",
  outstanding_nursing_tasks: "Vitals at 20:00",
  pending_investigations: "Full blood count",
  escalations: "None",
  recommendations: "Encourage oral fluids",
};
const nurseHandovers = {
  received: [
    {
      sqid: "nurse-handover-1",
      from_nurse_info: ibrahim,
      patient_info: patientInfo,
      ...nurseFields,
    },
  ] as Record<string, unknown>[],
  sent: [] as Record<string, unknown>[],
};

export const noteHandlers = [
  http.get(api("/api/records/patients/:hin/admission-notes"), ({ params, request }) =>
    HttpResponse.json(page(notesOf(String(params.hin)).admission, request)),
  ),
  http.post(api("/api/records/admissions/:sqid/admission-note"), async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    if (!body.vital_signs) return HttpResponse.json(required("vital_signs"), { status: 400 });
    // The mock admissions are numbered like the inpatient list (admission-1 is Yemi Ojo's), and
    // its patients' HINs like the hospital's patients.
    const index = Number(String(params.sqid).replace("admission-", "")) - 1;
    if (Number.isInteger(index) && index >= 0) {
      const hin = String(Number(NEW_ADMISSION_HIN) + index * 2_791_337);
      notesOf(hin).admission.push({
        ...body,
        sqid: `admission-note-${Date.now()}`,
        created_at: new Date().toISOString(),
        written_by_info: author,
        admission_info: { sqid: params.sqid },
        mobility_assessment_label: "",
        nutritional_assessment_label: "",
        vital_signs_info: { ...(body.vital_signs as object), created_at: new Date().toISOString() },
      });
    }
    return HttpResponse.json(body, { status: 201 });
  }),
  http.get(api("/api/records/progress-notes/:hin"), ({ params, request }) =>
    HttpResponse.json(page(notesOf(String(params.hin)).progress, request)),
  ),
  http.post(api("/api/records/progress-notes"), async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;
    for (const field of [
      "patient",
      "admission",
      "subjective",
      "objective",
      "assessments",
      "plan",
    ]) {
      if (!body[field]) return HttpResponse.json(required(field), { status: 400 });
    }
    const row = { ...body, sqid: `progress-${Date.now()}`, created_at: new Date().toISOString() };
    notesOf(body.patient!).progress.push(row);
    return HttpResponse.json(row, { status: 201 });
  }),
  http.get(api("/api/records/patients/:hin/case-notes"), ({ params, request }) =>
    HttpResponse.json(page(notesOf(String(params.hin)).case, request)),
  ),
  http.post(api("/api/records/case-notes"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown> & { patient: string };
    if (!body.patient || !body.admission) {
      return HttpResponse.json(required(body.patient ? "admission" : "patient"), { status: 400 });
    }
    const row = {
      ...body,
      sqid: `case-${Date.now()}`,
      created_at: new Date().toISOString(),
      staff_info: author,
    };
    notesOf(body.patient).case.push(row);
    return HttpResponse.json(row, { status: 201 });
  }),
  http.get(api("/api/records/patients/:hin/care-plans"), ({ params, request }) =>
    HttpResponse.json(page(notesOf(String(params.hin))["care-plan"], request)),
  ),
  http.post(api("/api/records/care-plans"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown> & { patient: string };
    if (!body.patient || !body.admission) {
      return HttpResponse.json(required(body.patient ? "admission" : "patient"), { status: 400 });
    }
    const row = {
      ...body,
      sqid: `care-plan-${Date.now()}`,
      created_at: new Date().toISOString(),
      staff_info: author,
    };
    notesOf(body.patient)["care-plan"].push(row);
    return HttpResponse.json(row, { status: 201 });
  }),
  http.get(api("/api/records/patients/:hin/vital-signs"), ({ params, request }) =>
    HttpResponse.json(page(notesOf(String(params.hin)).vitals, request)),
  ),
  http.post(api("/api/records/patients/:hin/vital-signs"), async ({ params, request }) => {
    const body = (await request.json()) as { admission?: string; vital_signs?: object };
    if (!body.admission) return HttpResponse.json(required("admission"), { status: 400 });
    const row = vitals(`vitals-${Date.now()}`, 0, author, body.vital_signs);
    notesOf(String(params.hin)).vitals.push(row);
    return HttpResponse.json(row, { status: 201 });
  }),
  http.get(api("/api/records/patients/:hin/soap-notes/shared"), ({ params, request }) =>
    HttpResponse.json(page(notesOf(String(params.hin)).shared, request)),
  ),

  http.get(api("/api/hospital-ops/handovers/doctor"), ({ request }) =>
    HttpResponse.json(page(doctorHandovers, request)),
  ),
  http.post(api("/api/hospital-ops/handovers/doctor"), async ({ request }) => {
    const body = (await request.json()) as Record<string, string | null>;
    for (const field of [
      "to_doctor_id",
      "patient_hin",
      "working_diagnosis",
      "current_clinical_status",
    ]) {
      if (!body[field]) return HttpResponse.json(required(field), { status: 400 });
    }
    const { to_doctor_id: to, patient_hin: hin, ...fields } = body;
    doctorHandovers.push({
      ...fields,
      sqid: `doctor-handover-${Date.now()}`,
      from_doctor_info: raphael,
      to_doctor_info: to === sarah.sqid ? sarah : { ...sarah, sqid: to },
      patient_info: { ...patientInfo, hin },
      created_at: new Date().toISOString(),
    });
    return new HttpResponse(null, { status: 201 });
  }),
  http.get(api("/api/hospital-ops/handovers/nurse/:direction"), ({ params, request }) => {
    const rows = nurseHandovers[params.direction as "received" | "sent"] ?? [];
    // As staging: nurse handovers have no created_at, and come in the order they were written.
    const size = Number(new URL(request.url).searchParams.get("size") ?? 10);
    return HttpResponse.json({
      count: rows.length,
      next: null,
      previous: null,
      results: rows.slice(0, size),
    });
  }),
  http.post(api("/api/hospital-ops/handovers/nurse"), async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;
    for (const field of ["to_nurse_id", "patient_hin", ...Object.keys(nurseFields)]) {
      if (!body[field]) return HttpResponse.json(required(field), { status: 400 });
    }
    const { to_nurse_id: to, patient_hin: hin, ...fields } = body;
    const row = {
      sqid: `nurse-handover-${Date.now()}`,
      to_nurse_id: to,
      patient_hin: hin,
      ...fields,
    };
    nurseHandovers.sent.unshift({
      ...fields,
      sqid: row.sqid,
      to_nurse_info: to === ibrahim.sqid ? ibrahim : { ...ibrahim, sqid: to },
      patient_info: { ...patientInfo, hin },
    });
    return HttpResponse.json(row, { status: 201 });
  }),
];
