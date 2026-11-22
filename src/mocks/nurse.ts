import { HttpResponse, http } from "msw";
import { env } from "@/env";

// The nurse's front line, faked with the real API's paths and shapes (as staging returns them).
// The signed-in nurse is the staff mock's Heritech Riel (staff-3).

const api = (path: string) => `${env.VITE_API_URL}${path}`;

const MINUTE = 60_000;
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * MINUTE).toISOString();

const me = { sqid: "staff-3", firstname: "Heritech", lastname: "Riel", role: "nurse" };
const colleague = { sqid: "staff-9", firstname: "Chidi", lastname: "Okafor", role: "nurse" };
const doctor = {
  sqid: "staff-1",
  firstname: "Raphael",
  lastname: "Jonnas",
  role: "doctor",
  specialization: null,
};

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

type CheckIn = {
  sqid: string;
  status: string;
  patient_info: ReturnType<typeof patient>;
  created_at: string;
  escalated_at: string | null;
  closed_at: string | null;
  triage_priority: string | null;
  reserved_by: typeof me | null;
  claimed_by: typeof doctor | null;
  latest_vitals: Record<string, unknown> | null;
};

const checkIn = (
  sqid: string,
  status: string,
  who: ReturnType<typeof patient>,
  minutes: number,
  extra: Partial<CheckIn> = {},
): CheckIn => ({
  sqid,
  status,
  patient_info: who,
  created_at: minutesAgo(minutes),
  escalated_at: null,
  closed_at: null,
  triage_priority: null,
  reserved_by: null,
  claimed_by: null,
  latest_vitals: null,
  ...extra,
});

const checkIns: CheckIn[] = [
  checkIn(
    "ci-1",
    "pending",
    patient("4100000000001", "Adaeze", "Nwankwo", "female", "1991-04-02"),
    42,
  ),
  checkIn(
    "ci-2",
    "nursing_active",
    patient("4100000000002", "Musa", "Bello", "male", "1984-09-12"),
    25,
    {
      reserved_by: me,
    },
  ),
  checkIn(
    "ci-3",
    "nursing_active",
    patient("4100000000003", "Grace", "Udo", "female", "1999-01-30"),
    18,
    {
      reserved_by: colleague,
    },
  ),
  checkIn(
    "ci-4",
    "doctor_active",
    patient("4100000000004", "Femi", "Ade", "male", "1975-06-21"),
    120,
    {
      escalated_at: minutesAgo(90),
      triage_priority: "urgent",
      claimed_by: doctor,
    },
  ),
  checkIn("ci-5", "closed", patient("4100000000005", "Ruth", "Etim", "female", "1968-11-05"), 300, {
    closed_at: minutesAgo(240),
    triage_priority: "routine",
    reserved_by: me,
  }),
];

/** Which tab each status shows under, as the API files them. */
function tabOf(status: string) {
  if (status === "pending" || status === "nursing_active" || status === "nursing_idle")
    return "pending";
  if (status === "closed") return "closed";
  return "sent_to_doctor";
}

const vitalsRequests = [
  {
    sqid: "vr-1",
    patient_hin: "4100000000004",
    patient: patient("4100000000004", "Femi", "Ade", "male", "1975-06-21"),
    staff: me.sqid,
    staff_info: me,
    check_in: "ci-4",
    note: "Recheck BP before the next dose.",
    status: "requested",
    processed_at: null as string | null,
    created_at: minutesAgo(30),
  },
];

const admissions = [
  {
    sqid: "admission-1",
    status: "active",
    patient_info: { firstname: "Yemi", lastname: "Ojo", hin: "5413700000000" },
    requested_by_info: doctor,
    ward_info: { sqid: "general", name: "General ward" },
    bed_info: { bed_number: 1, status: "occupied", sqid: "general-bed-1" },
    admission_note_info: null,
    created_at: minutesAgo(120),
    discharge_date: null,
  },
];

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

export const nurseHandlers = [
  http.get(api("/api/hospital-ops/check-ins/nurse-queue"), ({ request }) => {
    const status = new URL(request.url).searchParams.get("status") ?? "pending";
    return HttpResponse.json(
      page(
        checkIns.filter((entry) => tabOf(entry.status) === status),
        request,
      ),
    );
  }),
  http.post(api("/api/hospital-ops/check-ins/:sqid/reserve"), ({ params }) => {
    const entry = checkIns.find(({ sqid }) => sqid === params.sqid);
    if (!entry) return notFound();
    if (entry.reserved_by && entry.reserved_by.sqid !== me.sqid && entry.status !== "closed") {
      return HttpResponse.json({ detail: "Another nurse has this check-in." }, { status: 400 });
    }
    Object.assign(entry, { status: "nursing_active", reserved_by: me, closed_at: null });
    return HttpResponse.json({ detail: "Check-in reserved." });
  }),
  http.post(
    api("/api/hospital-ops/check-ins/:sqid/nursing-assessment"),
    async ({ params, request }) => {
      const entry = checkIns.find(({ sqid }) => sqid === params.sqid);
      if (!entry) return notFound();
      const body = (await request.json()) as {
        triage_priority?: string;
        vital_signs?: Record<string, unknown>;
        escalate?: boolean;
      };
      if (!body.triage_priority || !body.vital_signs) {
        return HttpResponse.json({ triage_priority: ["This field is required."] }, { status: 400 });
      }
      Object.assign(entry, {
        triage_priority: body.triage_priority,
        latest_vitals: {
          sqid: `${entry.sqid}-vitals`,
          created_at: new Date().toISOString(),
          ...body.vital_signs,
        },
        ...(body.escalate
          ? { status: "doctor_idle", escalated_at: new Date().toISOString() }
          : { status: "closed", closed_at: new Date().toISOString() }),
      });
      return HttpResponse.json({ sqid: `${entry.sqid}-assessment` }, { status: 201 });
    },
  ),
  http.get(api("/api/records/vital-signs/requests/pending"), ({ request }) =>
    HttpResponse.json(
      page(
        vitalsRequests.filter(({ status }) => status === "requested"),
        request,
      ),
    ),
  ),
  http.post(api("/api/records/vital-signs/requests/:sqid/process"), async ({ params, request }) => {
    const vitalsRequest = vitalsRequests.find(({ sqid }) => sqid === params.sqid);
    if (!vitalsRequest) return notFound();
    const body = (await request.json()) as Record<string, unknown>;
    Object.assign(vitalsRequest, { status: "processed", processed_at: new Date().toISOString() });
    return HttpResponse.json(
      { sqid: `${vitalsRequest.sqid}-vitals`, created_at: new Date().toISOString(), ...body },
      { status: 201 },
    );
  }),
  http.get(api("/api/hospital-ops/admissions"), ({ request }) =>
    HttpResponse.json(page(admissions, request)),
  ),
];
