import { HttpResponse, http } from "msw";
import { env } from "@/env";
import {
  type ReporterSpecialty,
  reporterSpecialtyLabels,
} from "@/features/radiologist/api/schemas";
import type {
  RadiologistProfile,
  RadiologyOverview,
  RecentUploads,
  ScanOrder,
  ScanRecord,
  ScanRecordList,
  ScanResult,
  ScanSchedule,
  ScanStage,
} from "@/features/radiologist/api/schemas";

const api = (path: string) => `${env.VITE_API_URL}${path}`;

const profile: RadiologistProfile = {
  hospital: { name: "Lagos University Teaching Hospital", bannerUrl: null },
  user: {
    title: "Dr.",
    firstName: "Emeka",
    lastName: "Obi",
    email: "emeka.obi@luth.example.com",
    avatarUrl: null,
  },
  unreadNotifications: 1,
  unreadMessages: 3,
};

/** This week's numbers; the other periods scale them. */
const overview: RadiologyOverview = {
  imagingRequests: 24,
  pendingOrders: 12,
  completedScans: 4,
  scansInProgress: 6,
};

const periodScale = { today: 0.25, week: 1, month: 4 } as const;

function scaleFor(request: Request) {
  const period = new URL(request.url).searchParams.get("period");
  return period === "today" || period === "month" ? period : "week";
}

const HOUR = 60 * 60_000;
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
  id: `patient-${index}`,
  name,
  avatarUrl: null,
  hin: String(54_137_284_910 + index * 7_919_301),
});

const schedule: ScanSchedule["items"] = (
  [
    [0, "10:30", "Chidi Okafor", "Chest X-ray"],
    [0, "12:00", "Tunde Adeyemi", "Brain MRI"],
    [1, "09:00", "Amina Yusuf", "Abdominal CT"],
    [1, "11:00", "Chioma Nwosu", "Pelvic ultrasound"],
    [2, "10:30", "Emeka Uche", "Chest X-ray"],
    [3, "10:30", "David Bello", "Chest X-ray"],
    [5, "14:00", "Hauwa Garba", "Spine MRI"],
    [12, "09:30", "Joyce Sarah", "Mammogram"],
    [20, "11:00", "Adeyemi Samuel", "Bone density scan"],
  ] as const
).map(([days, time, name, scanType], index) => ({
  id: `schedule-${index + 1}`,
  at: at(days, time),
  patient: patient(index + 1, name),
  scanType,
}));

const uploads: RecentUploads["items"] = (
  [
    [0, "10:42", "Chidi Okafor", "Chest X-ray", "successful"],
    [0, "10:45", "Amaka Eze", "Brain MRI", "processing"],
    [-1, "10:38", "Amina Yusuf", "Abdominal CT", "successful"],
    [-2, "10:38", "Chioma Nwosu", "Knee X-ray", "successful"],
    [-3, "09:50", "Emeka Uche", "Brain MRI", "failed"],
    [-3, "10:38", "David Bello", "Mammogram", "successful"],
    [-9, "15:20", "Ruth Etim", "Pelvic X-ray", "successful"],
    [-20, "11:05", "Victor Udo", "Spine MRI", "successful"],
  ] as const
).map(([days, time, name, scanType, status], index) => ({
  id: `upload-${index + 1}`,
  uploadedAt: at(days, time),
  patient: { id: `patient-${index + 1}`, name },
  scanType,
  status,
}));

/** How far ahead (or back, for uploads) each period reaches. */
const periodDays = { today: 1, week: 7, month: 31 } as const;

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
const scanTypes = [
  "Chest X-ray",
  "Abdominal CT",
  "Brain MRI",
  "Pelvic ultrasound",
  "Spine MRI",
  "Knee X-ray",
  "Pelvic X-ray",
  "Bone density scan",
  "Mammogram",
];
const doctors = ["Dr. Raphael Jonnas", "Dr. Sarah Adeyemi", "Dr. Ibrahim Sani", "Dr. Tola Bello"];

/**
 * Hours ago each tab's orders were requested; how many there are sets the tab's count. All fall
 * within the last week, so "This Week" shows every one and "Today" only the newest.
 */
const stageAges: Record<ScanStage, number[]> = {
  pending: [
    2, 20, 30, 54, 75, 98, 120, 126, 130, 134, 138, 142, 146, 150, 154, 158, 160, 162, 164, 166,
  ],
  in_progress: [3, 26, 50, 90],
  completed: Array.from({ length: 32 }, (_, index) => 4 + index * 5),
  rejected: [40, 100, 160],
};

let next = 0;
const records: ScanRecord[] = (Object.entries(stageAges) as [ScanStage, number[]][]).flatMap(
  ([stage, ages]) =>
    ages.map((hoursAgo, index) => {
      const n = next++;
      const [name, dateOfBirth, sex] = recordPatients[n % recordPatients.length]!;
      return {
        id: `scan-order-${n + 1}`,
        patient: { ...patient(100 + n, name), dateOfBirth, sex },
        scanType: scanTypes[n % scanTypes.length]!,
        requestedBy: doctors[n % doctors.length]!,
        requestedAt: new Date(Date.now() - hoursAgo * HOUR).toISOString(),
        stage,
        // The two most recent pending orders haven't been opened yet.
        seen: stage !== "pending" || index >= 2,
        // The newest in-progress scan was booked; the doctors asked for the rest.
        progress: stage === "in_progress" ? (index === 0 ? "appointment" : "doctor_request") : null,
      };
    }),
);

/** How each scan type breaks down on its order: modality, body part, contrast. */
const scanParts: Record<string, [string, string, string | null]> = {
  "Chest X-ray": ["X-ray", "Chest", null],
  "Abdominal CT": ["CT scan", "Abdomen", "non-contrast"],
  "Brain MRI": ["MRI", "Brain", "with contrast"],
  "Pelvic ultrasound": ["Ultrasound", "Pelvis", null],
  "Spine MRI": ["MRI", "Spine", "non-contrast"],
  "Knee X-ray": ["X-ray", "Knee", null],
  "Pelvic X-ray": ["X-ray", "Pelvis", null],
  "Bone density scan": ["DEXA scan", "Hip and spine", null],
  Mammogram: ["Mammogram", "Breast", null],
};

const MINUTE = 60_000;

/** What's been done to orders on the dev server, by order id; it replaces the generated data. */
const uploadedResults = new Map<string, ScanResult>();
const acceptedAt = new Map<string, string>();
const loggedImaging = new Map<string, string>();
const rejections = new Map<string, NonNullable<ScanOrder["rejection"]>>();

/** A record from the list, filled out with what its own page shows. */
function orderFor(record: ScanRecord, index: number): ScanOrder {
  const [modality, bodyPart, contrast] = scanParts[record.scanType] ?? ["Scan", "Chest", null];
  const requested = new Date(record.requestedAt).getTime();
  const after = (minutes: number) => new Date(requested + minutes * MINUTE).toISOString();
  const accepted = record.stage === "in_progress" || record.stage === "completed";
  const part = bodyPart.toLowerCase();

  return {
    id: record.id,
    stage: record.stage,
    patient: { ...record.patient, hmo: index % 3 !== 2 },
    modality,
    bodyPart,
    contrast,
    requestedBy: record.requestedBy,
    requestedAt: record.requestedAt,
    provider: { name: "Downtown Medical Clinic", email: "records@downtownclinic.example.com" },
    note: "Persistent cough and shortness of breath for 3 weeks. History of smoking (20 pack-years).",
    acceptedAt: acceptedAt.get(record.id) ?? (accepted ? after(30) : null),
    scheduledAt:
      loggedImaging.get(record.id) ??
      // Accepted here, with no time logged yet.
      (acceptedAt.has(record.id)
        ? null
        : record.stage === "in_progress"
          ? after(26 * 60)
          : accepted
            ? after(90)
            : null),
    rejection:
      rejections.get(record.id) ??
      (record.stage === "rejected"
        ? {
            at: after(60),
            reason:
              "The requested scan doesn’t match the clinical question. Please confirm the imaging type with the requesting doctor and send a new request.",
          }
        : null),
    result:
      uploadedResults.get(record.id) ??
      (record.stage === "completed"
        ? {
            uploadedAt: after(180),
            reportedBy: { name: "Dr. Emeka Obi", specialty: "Radiologist" },
            examination: `${contrast ? `${contrast[0]!.toUpperCase()}${contrast.slice(1)} ` : ""}${modality} of the ${part}`,
            clinicalIndication:
              "Evaluation of persistent cough and shortness of breath for 3 weeks, with a history of smoking (20 pack-years).",
            technique: `Standard ${modality} images of the ${part} were obtained in the axial, coronal and sagittal planes.`,
            findings: [
              "No acute abnormality is seen.",
              `Structures around the ${part} included in the study are unremarkable.`,
            ],
            impression:
              "6 mm nodule, likely benign but requiring follow-up. Recommend a repeat low-dose study in 6 months to assess stability.",
            recommendations:
              "Follow-up imaging in 6 months to monitor the nodule. Smoking cessation counselling strongly advised.",
            comment: null,
            files: [
              {
                id: `${record.id}-images`,
                name: `${bodyPart} ${modality} images`,
                kind: "images",
                sizeBytes: 24_300_000,
                uploadedAt: after(180),
                url: `https://files.docuhealth.example/${record.id}/images.zip`,
              },
              {
                id: `${record.id}-report`,
                name: "Radiology report (PDF)",
                kind: "pdf",
                sizeBytes: 412_000,
                uploadedAt: after(180),
                url: `https://files.docuhealth.example/${record.id}/report.pdf`,
              },
            ],
          }
        : null),
  };
}

function matches(search: string | null, ...values: string[]) {
  const term = search?.trim().toLowerCase();
  return !term || values.some((value) => value.toLowerCase().includes(term));
}

/** The order's record and index, or a response saying why it can't be changed. */
function changeable(id: unknown, stage: ScanStage, message: string) {
  const index = records.findIndex((record) => record.id === id);
  const record = records[index];
  if (!record) {
    return { error: HttpResponse.json({ message: "Scan order not found." }, { status: 404 }) };
  }
  if (record.stage !== stage) {
    return { error: HttpResponse.json({ message }, { status: 409 }) };
  }
  return { record, index };
}

export const radiologistHandlers = [
  http.post(api("/hospital/radiology/scan-orders/:id/accept"), ({ params }) => {
    const found = changeable(params.id, "pending", "Only a pending order can be accepted.");
    if (found.error) return found.error;
    const { record, index } = found;
    record.stage = "in_progress";
    record.seen = true;
    record.progress = "doctor_request";
    acceptedAt.set(record.id, new Date().toISOString());
    return HttpResponse.json(orderFor(record, index));
  }),
  http.post(api("/hospital/radiology/scan-orders/:id/reject"), async ({ params, request }) => {
    const found = changeable(params.id, "pending", "Only a pending order can be rejected.");
    if (found.error) return found.error;
    const { record, index } = found;
    const { reason } = (await request.json()) as { reason: string };
    record.stage = "rejected";
    record.seen = true;
    rejections.set(record.id, { at: new Date().toISOString(), reason });
    return HttpResponse.json(orderFor(record, index));
  }),
  http.put(api("/hospital/radiology/scan-orders/:id/imaging-time"), async ({ params, request }) => {
    const found = changeable(
      params.id,
      "in_progress",
      "Only a scan in progress can have its imaging time logged.",
    );
    if (found.error) return found.error;
    const { record, index } = found;
    const { scheduledAt } = (await request.json()) as { scheduledAt: string };
    loggedImaging.set(record.id, scheduledAt);
    return HttpResponse.json(orderFor(record, index));
  }),
  http.post(api("/hospital/radiology/scan-orders/:id/result"), async ({ params, request }) => {
    const found = changeable(
      params.id,
      "in_progress",
      "Only a scan in progress can have its result uploaded.",
    );
    if (found.error) return found.error;
    const { record, index } = found;

    const form = await request.formData();
    const text = (key: string) => {
      const value = form.get(key);
      return typeof value === "string" ? value.trim() : "";
    };
    const reportedAt = text("reportedAt") || new Date().toISOString();
    const order = orderFor(record, index);
    uploadedResults.set(record.id, {
      uploadedAt: reportedAt,
      reportedBy: {
        name: text("reporterName"),
        specialty:
          reporterSpecialtyLabels[text("specialty") as ReporterSpecialty] ?? text("specialty"),
      },
      examination: [order.contrast, order.modality, "of the", order.bodyPart.toLowerCase()]
        .filter(Boolean)
        .join(" "),
      clinicalIndication: text("clinicalIndication"),
      technique: null,
      findings: text("findings")
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean),
      impression: text("impression"),
      recommendations: text("recommendations"),
      comment: text("comment") || null,
      files: form.getAll("attachments").flatMap((file, fileIndex) =>
        // Not `instanceof File`: in tests the file comes from another realm.
        typeof file !== "string"
          ? [
              {
                id: `${record.id}-upload-${fileIndex + 1}`,
                name: file.name,
                kind: file.type === "application/pdf" ? ("pdf" as const) : ("images" as const),
                sizeBytes: file.size,
                uploadedAt: reportedAt,
                url: `https://files.docuhealth.example/${record.id}/${encodeURIComponent(file.name)}`,
              },
            ]
          : [],
      ),
    });
    record.stage = "completed";
    return HttpResponse.json(orderFor(record, index));
  }),
  http.get(api("/hospital/radiology/scan-orders/:id"), ({ params }) => {
    const index = records.findIndex((record) => record.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ message: "Scan order not found." }, { status: 404 });
    }
    return HttpResponse.json(orderFor(records[index]!, index));
  }),
  http.get(api("/hospital/radiology/profile"), () => HttpResponse.json(profile)),
  http.get(api("/hospital/radiology/overview"), ({ request }) => {
    const scale = periodScale[scaleFor(request)];
    return HttpResponse.json(
      Object.fromEntries(
        Object.entries(overview).map(([key, value]) => [key, Math.round(value * scale)]),
      ) as RadiologyOverview,
    );
  }),
  http.get(api("/hospital/radiology/schedule"), ({ request }) => {
    const until = Date.now() + periodDays[scaleFor(request)] * DAY;
    return HttpResponse.json({
      items: schedule.filter((item) => new Date(item.at).getTime() < until),
    } satisfies ScanSchedule);
  }),
  http.get(api("/hospital/radiology/uploads"), ({ request }) => {
    const since = Date.now() - periodDays[scaleFor(request)] * DAY;
    return HttpResponse.json({
      items: uploads.filter((item) => new Date(item.uploadedAt).getTime() > since),
    } satisfies RecentUploads);
  }),
  http.get(api("/hospital/radiology/scan-orders"), ({ request }) => {
    const params = new URL(request.url).searchParams;
    const stage = (params.get("stage") ?? "pending") as ScanStage;
    const page = Number(params.get("page") ?? 1);
    const pageSize = Number(params.get("pageSize") ?? 8);
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
          matches(params.get("search"), record.patient.name, record.patient.hin, record.scanType),
      )
      .sort(
        (a, b) =>
          (new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()) * direction,
      );
    const count = (of: ScanStage) => inPeriod.filter((record) => record.stage === of).length;

    return HttpResponse.json({
      counts: {
        pending: count("pending"),
        in_progress: count("in_progress"),
        completed: count("completed"),
        rejected: count("rejected"),
      },
      total: matching.length,
      items: matching.slice((page - 1) * pageSize, page * pageSize),
    } satisfies ScanRecordList);
  }),
];
