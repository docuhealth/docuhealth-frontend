import { HttpResponse, http } from "msw";
import { env } from "@/env";
import type { ScanStage } from "@/features/radiologist/api/schemas";
import { readMultipart } from "@/mocks/multipart";

// The radiologist's endpoints, faked with the real API's paths and shapes (`ScanOrderItemRead`,
// `PatientBasicInfo`; docs/api/openapi.json), so the app's parsers run against the real format.

const api = (path: string) => `${env.VITE_API_URL}${path}`;

const HOUR = 60 * 60_000;
const MINUTE = 60_000;

const hospital = {
  name: "Lagos University Teaching Hospital",
  email: "records@luth.example.com",
  sqid: "pm9XGQd",
};

type Patient = { hin: string; firstname: string; lastname: string; gender: string; dob: string };

const patient = (index: number, name: string, dob: string, gender: string): Patient => {
  const [firstname = "", lastname = ""] = name.split(" ");
  return { hin: String(54_137_284_910 + index * 7_919_301), firstname, lastname, gender, dob };
};

/** People who've been booked in before; Chidi Okafor is 541-452-042-11. */
const bookedPatients = (
  [
    ["Chidi Okafor", "1988-04-12", "male"],
    ["Tunde Adeyemi", "1997-05-11", "male"],
    ["Amina Yusuf", "1990-01-15", "female"],
  ] as const
).map(([name, dob, gender], index) => patient(index + 1, name, dob, gender));

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
  ["Segun Oladipo", "1983-11-27", "unknown"],
] as const;

/** Each scan's LOINC parts: modality, region imaged and (if any) contrast timing. */
const scans: Record<string, [modality: string, regions: string[], timing: string[]]> = {
  "Chest X-ray": ["XR", ["Chest"], []],
  "Abdominal CT": ["CT", ["Abdomen"], ["WO"]],
  "Brain MRI": ["MR", ["Brain"], ["W"]],
  "Pelvic ultrasound": ["US", ["Pelvis"], []],
  "Spine MRI": ["MR", ["Spine"], ["WO"]],
  "Knee X-ray": ["XR", ["Knee"], []],
  "Pelvic X-ray": ["XR", ["Pelvis"], []],
  "Bone density scan": ["DXA", ["Hip", "Spine"], []],
  Mammogram: ["MG", ["Breast"], []],
};
const scanNames = Object.keys(scans);
const doctors = [
  ["Raphael", "Jonnas"],
  ["Sarah", "Adeyemi"],
  ["Ibrahim", "Sani"],
  ["Tola", "Bello"],
] as const;

/**
 * Hours ago each tab's orders were requested; how many there are sets the tab's count. All fall
 * within the last week.
 */
const stageAges: Record<ScanStage, number[]> = {
  pending: [
    2, 20, 30, 54, 75, 98, 120, 126, 130, 134, 138, 142, 146, 150, 154, 158, 160, 162, 164, 166,
  ],
  in_progress: [3, 26, 50, 90],
  completed: Array.from({ length: 32 }, (_, index) => 4 + index * 5),
  rejected: [40, 100, 160],
};

type ScanResult = {
  sqid: string;
  clinical_indication: string;
  findings: string[];
  impression: string[];
  recommendation: string[];
  attachments: string[];
  extra_comment: string | null;
  reporter_name: string;
  reporter_specialty: string;
  reported_at: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason: null;
  created_at: string;
};

type Item = {
  sqid: string;
  patient: Patient;
  scan: string;
  doctor: readonly [string, string];
  requestedAt: string;
  status: "pending" | "in_progress" | "image_collected" | "completed" | "rejected";
  image_collected_at: string | null;
  rejection_reason: string | null;
  results: ScanResult[];
};

const after = (from: string, minutes: number) =>
  new Date(new Date(from).getTime() + minutes * MINUTE).toISOString();

let next = 0;
const items: Item[] = (Object.entries(stageAges) as [ScanStage, number[]][]).flatMap(
  ([stage, ages]) =>
    ages.map((hoursAgo, index) => {
      const n = next++;
      const [name, dob, gender] = recordPatients[n % recordPatients.length]!;
      const scan = scanNames[n % scanNames.length]!;
      const requestedAt = new Date(Date.now() - hoursAgo * HOUR).toISOString();
      const id = `scan-order-${n + 1}`;
      // The newest in-progress scan has no images yet; the others do.
      const collected =
        stage === "completed" || (stage === "in_progress" && index > 0)
          ? after(requestedAt, stage === "completed" ? 90 : 26 * 60)
          : null;
      return {
        sqid: id,
        patient: patient(100 + n, name, dob, gender),
        scan,
        doctor: doctors[n % doctors.length]!,
        requestedAt,
        status: stage === "in_progress" && collected ? "image_collected" : stage,
        image_collected_at: collected,
        rejection_reason:
          stage === "rejected"
            ? "The requested scan doesn’t match the clinical question. Please confirm the imaging type with the requesting doctor and send a new request."
            : null,
        // A few reports are still waiting for the doctor, and one was sent back.
        results:
          stage === "completed"
            ? [
                reportFor(
                  id,
                  scan,
                  after(requestedAt, 180),
                  index % 7 === 1 ? "pending" : index % 7 === 3 ? "rejected" : "approved",
                ),
              ]
            : [],
      };
    }),
);

function reportFor(id: string, scan: string, at: string, status: ScanResult["status"]): ScanResult {
  const [modality, regions] = scans[scan] ?? ["", []];
  return {
    sqid: `${id}-result`,
    clinical_indication:
      "Evaluation of persistent cough and shortness of breath for 3 weeks, with a history of smoking (20 pack-years).",
    findings: [
      "No acute abnormality is seen.",
      `Structures around the ${regions.join(" and ").toLowerCase()} are unremarkable.`,
    ],
    impression: ["6 mm nodule, likely benign but requiring follow-up."],
    recommendation: ["Follow-up imaging in 6 months to monitor the nodule."],
    attachments: [
      `https://files.docuhealth.example/${id}/${encodeURIComponent(`${regions[0]} ${modality} images`)}`,
      `https://files.docuhealth.example/${id}/${encodeURIComponent("Radiology report (PDF)")}`,
    ],
    extra_comment: null,
    reporter_name: "Dr. Emeka Obi",
    reporter_specialty: "Radiologist",
    reported_at: at,
    status,
    rejection_reason: null,
    created_at: at,
  };
}

/** `ScanOrderItemRead`, as the API returns it. */
function read(item: Item) {
  const [modality, regions, timing] = scans[item.scan] ?? ["", [], []];
  const part = (type: string, name: string, index: number) => ({
    sqid: `${item.sqid}-part-${index}`,
    part_number: `LP${100000 + index}-0`,
    part_type: type,
    part_name: name,
    preferred_name: name,
    sequence_order: "A",
    rid: null,
  });
  return {
    sqid: item.sqid,
    order_info: {
      sqid: `${item.sqid}-order`,
      patient_info: item.patient,
      hospital_info: hospital,
      ordered_by_info: {
        sqid: `doctor-${item.doctor[1]}`,
        firstname: item.doctor[0],
        lastname: item.doctor[1],
        role: "doctor",
        specialization: null,
      },
      created_at: item.requestedAt,
    },
    scan_info: {
      sqid: `scan-${item.scan}`,
      loinc_code: "00000-0",
      name: item.scan,
      parts: [
        ...timing.map((name, index) => part("Rad.Timing", name, index)),
        ...regions.map((name, index) =>
          part("Rad.Anatomic Location.Region Imaged", name, 10 + index),
        ),
        part("Rad.Modality.Modality Type", modality, 20),
      ],
    },
    results: item.results,
    created_at: item.requestedAt,
    status: item.status,
    rejection_reason: item.rejection_reason,
    image_collected_at: item.image_collected_at,
  };
}

/** The API's tab filter: "in_progress" covers scans whose images are in too. */
function atStatus(item: Item, status: string | null) {
  return status === "in_progress"
    ? item.status === "in_progress" || item.status === "image_collected"
    : item.status === status;
}

function matches(search: string | null, item: Item) {
  const term = search?.trim().toLowerCase();
  return (
    !term ||
    [`${item.patient.firstname} ${item.patient.lastname}`, item.patient.hin, item.scan].some(
      (value) => value.toLowerCase().includes(term),
    )
  );
}

/** The item, or a response saying why it can't be changed. */
function changeable(id: unknown, allowed: Item["status"][], message: string) {
  const item = items.find(({ sqid }) => sqid === id);
  if (!item) return { error: HttpResponse.json({ detail: "Not found." }, { status: 404 }) };
  if (!allowed.includes(item.status)) {
    return { error: HttpResponse.json({ detail: message }, { status: 400 }) };
  }
  return { item };
}

export const radiologistHandlers = [
  http.get(api("/api/radiology/orders/items"), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const status = params.get("status");
    if (!["pending", "in_progress", "completed", "rejected"].includes(status ?? "")) {
      return HttpResponse.json({ status: "Invalid status" }, { status: 400 });
    }
    const page = Number(params.get("page") ?? 1);
    const size = Number(params.get("size") ?? 10);
    const matching = items
      .filter((item) => atStatus(item, status) && matches(params.get("search"), item))
      .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
    return HttpResponse.json({
      count: matching.length,
      next: null,
      previous: null,
      results: matching.slice((page - 1) * size, page * size).map(read),
    });
  }),
  http.patch(api("/api/radiology/orders/items/:sqid/accept"), ({ params }) => {
    const found = changeable(params.sqid, ["pending"], "Only a pending order can be accepted.");
    if (found.error) return found.error;
    found.item.status = "in_progress";
    return HttpResponse.json(read(found.item));
  }),
  http.patch(api("/api/radiology/orders/items/:sqid/reject"), async ({ params, request }) => {
    const found = changeable(params.sqid, ["pending"], "Only a pending order can be rejected.");
    if (found.error) return found.error;
    const { rejection_reason } = (await request.json()) as { rejection_reason: string };
    Object.assign(found.item, { status: "rejected", rejection_reason });
    return HttpResponse.json(read(found.item));
  }),
  http.patch(
    api("/api/radiology/orders/items/:sqid/collection-time"),
    async ({ params, request }) => {
      const found = changeable(
        params.sqid,
        ["in_progress", "image_collected"],
        "Only an accepted order's images can be logged.",
      );
      if (found.error) return found.error;
      const { image_collected_at } = (await request.json()) as { image_collected_at: string };
      Object.assign(found.item, { status: "image_collected", image_collected_at });
      return HttpResponse.json(read(found.item));
    },
  ),
  http.post(api("/api/radiology/results"), async ({ request }) => {
    const form = await readMultipart(request);
    const found = changeable(
      form.get("order_item"),
      ["in_progress", "image_collected"],
      "Only an accepted order takes a report.",
    );
    if (found.error) return found.error;
    const now = new Date().toISOString();
    const result: ScanResult = {
      sqid: `${found.item.sqid}-result-${found.item.results.length + 1}`,
      clinical_indication: form.get("clinical_indication") ?? "",
      findings: form.getAll("findings"),
      impression: form.getAll("impression"),
      recommendation: form.getAll("recommendation"),
      attachments: form
        .fileNames("attachments")
        .map(
          (name) =>
            `https://files.docuhealth.example/${found.item.sqid}/${encodeURIComponent(name)}`,
        ),
      extra_comment: form.get("extra_comment"),
      reporter_name: form.get("reporter_name") ?? "",
      reporter_specialty: form.get("reporter_specialty") ?? "",
      reported_at: form.get("reported_at") ?? now,
      status: "pending",
      rejection_reason: null,
      created_at: now,
    };
    found.item.results.push(result);
    found.item.status = "completed";
    return HttpResponse.json(result, { status: 201 });
  }),
  http.get(api("/api/radiology/patients"), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const size = Number(params.get("size") ?? 10);
    const everyone = new Map<string, Patient>();
    for (const person of [...bookedPatients, ...items.map((item) => item.patient)]) {
      everyone.set(person.hin, person);
    }
    const results = [...everyone.values()];
    return HttpResponse.json({
      count: results.length,
      next: null,
      previous: null,
      results: results.slice(0, size),
    });
  }),
  // Scans carried out each month this year (each report counts once), keyed "JAN" to "DEC".
  http.get(api("/api/radiology/activity-chart-data"), () => {
    const keys = "JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC".split(" ");
    const year = new Date().getFullYear();
    const counts = Object.fromEntries(keys.map((key) => [key, 0]));
    for (const result of items.flatMap((item) => item.results)) {
      const at = new Date(result.created_at);
      if (at.getFullYear() === year) counts[keys[at.getMonth()]!]! += 1;
    }
    return HttpResponse.json(counts);
  }),
  // Patients whose scan result went up in the last 24 hours, most recently scanned first.
  http.get(api("/api/radiology/patients/recents"), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const size = Number(params.get("size") ?? 10);
    const since = Date.now() - 24 * HOUR;
    const latest = new Map<string, { patient: Patient; at: string }>();
    for (const item of items) {
      for (const result of item.results) {
        if (new Date(result.created_at).getTime() < since) continue;
        const seen = latest.get(item.patient.hin);
        if (!seen || seen.at < result.created_at) {
          latest.set(item.patient.hin, { patient: item.patient, at: result.created_at });
        }
      }
    }
    const results = [...latest.values()]
      .sort((a, b) => b.at.localeCompare(a.at))
      .map(({ patient, at }) => ({ ...patient, scanned_at: at }));
    return HttpResponse.json({
      count: results.length,
      next: null,
      previous: null,
      results: results.slice(0, size),
    });
  }),
  // Records that a report left the system (downloaded or printed); there's no body.
  http.post(api("/api/radiology/audit-logs/:resultSqid/downloads"), ({ params }) => {
    const known = items.some((item) => item.results.some(({ sqid }) => sqid === params.resultSqid));
    if (!known) return HttpResponse.json({ detail: "Not found." }, { status: 404 });
    return new HttpResponse(null, { status: 200 });
  }),
];
