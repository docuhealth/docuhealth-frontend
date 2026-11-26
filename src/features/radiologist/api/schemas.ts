import { z } from "zod";
import { fullName, optionalText, staffProfileSchema, text } from "@/lib/staff-profile";
import type { Period } from "@/lib/period";

const count = z.number().int().nonnegative();

/** Turns a labels object's keys into a Zod enum. */
function enumOf<T extends Record<string, string>>(labels: T) {
  return z.enum(Object.keys(labels) as [keyof T & string, ...(keyof T & string)[]]);
}

/**
 * The signed-in member and their hospital, for the dashboard's shell and greeting, from
 * `GET /api/auth/staff/profile`. TODO(api): there's no endpoint for unread notification and
 * message counts yet, so they're 0; the API has no title (e.g. "Dr.") either.
 */
export const radiologistProfileSchema = staffProfileSchema.transform(({ user, hospital }) => ({
  hospital: { name: hospital.name, bannerUrl: hospital.bannerUrl },
  user: {
    /** Their staff sqid, e.g. to book appointments with themselves. */
    id: user.id,
    title: null as string | null,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatarUrl: null as string | null,
  },
  unreadNotifications: 0,
  unreadMessages: 0,
}));
export type RadiologistProfile = z.infer<typeof radiologistProfileSchema>;

/** Headline numbers for the period asked for. */
const radiologyOverviewSchema = z.object({
  /** Every scan requested in the period, whatever became of it. */
  imagingRequests: count,
  /** Requested and not started yet. */
  pendingOrders: count,
  completedScans: count,
  /** What `completedScans` covers: this calendar month, or every scan so far. */
  completedScansSpan: z.enum(["month", "all"]),
  scansInProgress: count,
});
export type RadiologyOverview = z.infer<typeof radiologyOverviewSchema>;

const sexLabels = {
  male: "Male",
  female: "Female",
  prefer_not_to_say: "Prefer not to say",
} as const;
export function sexLabel(sex: keyof typeof sexLabels) {
  return sex === "prefer_not_to_say" ? null : sexLabels[sex];
}

const patientSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.url().nullable(),
  hin: z.string(),
});

/** Scans booked in the period, soonest first. */
const scanScheduleSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      at: z.iso.datetime(),
      patient: patientSchema,
      /** e.g. "Chest X-ray". */
      scanType: z.string(),
    }),
  ),
});
export type ScanSchedule = z.infer<typeof scanScheduleSchema>;

/**
 * The kinds of scan an appointment can be booked for, in the order the select lists them. Unused
 * while the dialog's scan type field is commented out.
 * @public
 */
export const scanModalityLabels = {
  x_ray: "X-ray",
  ct: "CT scan",
  mri: "MRI",
  ultrasound: "Ultrasound",
  mammogram: "Mammogram",
  fluoroscopy: "Fluoroscopy",
  dexa: "Bone density (DEXA)",
} as const;
/** @public */
export type ScanModality = keyof typeof scanModalityLabels;

/** Registered patients whose HIN matches the one looked up (one, or none). */
const patientLookupSchema = z.object({
  items: z.array(
    patientSchema.extend({
      dateOfBirth: z.iso.date(),
      phone: z.string().nullable(),
      email: z.email().nullable(),
    }),
  ),
});
export type FoundPatient = z.infer<typeof patientLookupSchema>["items"][number];

export const uploadStatusLabels = {
  successful: "Successful",
  processing: "Processing",
  failed: "Failed",
} as const;
export type UploadStatus = keyof typeof uploadStatusLabels;

/** Scan results uploaded in the period, newest first. */
const recentUploadsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      uploadedAt: z.iso.datetime(),
      patient: patientSchema.pick({ id: true, name: true }),
      scanType: z.string(),
      /** `null` when the upload's report isn't among the latest completed scans. */
      status: enumOf(uploadStatusLabels).nullable(),
    }),
  ),
});
export type RecentUploads = z.infer<typeof recentUploadsSchema>;

/** The Scan Records tabs: where each order is in its life. */
export const scanStageLabels = {
  pending: "Pending Order",
  in_progress: "In-Progress Scan",
  completed: "Completed Scan",
  rejected: "Rejected Scan",
} as const;
export type ScanStage = keyof typeof scanStageLabels;

/** The Scan Orders page names the first two tabs after tests rather than orders and scans. */
export const scanOrderTabLabels = {
  ...scanStageLabels,
  pending: "Pending Test",
  in_progress: "In-Progress Test",
} as const satisfies Record<ScanStage, string>;

/** Why an in-progress scan is under way: booked as an appointment, or the doctor asked for it. */
export const scanProgressLabels = {
  appointment: "Appt",
  doctor_request: "Doctor req",
} as const;

export const scanSortLabels = { latest: "Latest", oldest: "Oldest" } as const;
export type ScanSort = keyof typeof scanSortLabels;

export type ScanRecordParams = {
  stage: ScanStage;
  search: string;
  sort: ScanSort;
  page: number;
  pageSize: number;
  /** Only orders requested in this span; every order when left out. */
  period?: Period;
};

/** One page of a tab's scan orders; `counts` covers every tab whatever the search. */
const scanRecordListSchema = z.object({
  counts: z.object({ pending: count, in_progress: count, completed: count, rejected: count }),
  total: count,
  items: z.array(
    z.object({
      id: z.string(),
      patient: patientSchema.extend({
        dateOfBirth: z.iso.date(),
        sex: enumOf(sexLabels),
      }),
      scanType: z.string(),
      /** The doctor who ordered it, e.g. "Dr. Raphael Jonnas". */
      requestedBy: z.string(),
      requestedAt: z.iso.datetime(),
      stage: enumOf(scanStageLabels),
      /** The radiologist has opened it; unopened pending orders show as "New". */
      seen: z.boolean(),
      /** Set on in-progress orders only. */
      progress: enumOf(scanProgressLabels).nullable(),
    }),
  ),
});
export type ScanRecordList = z.infer<typeof scanRecordListSchema>;
export type ScanRecord = ScanRecordList["items"][number];

/** Who can sign off a scan report. */
export const reporterSpecialtyLabels = {
  radiologist: "Radiologist",
  radiographer: "Radiographer",
  sonographer: "Sonographer",
  interventional_radiologist: "Interventional radiologist",
  nuclear_medicine_physician: "Nuclear medicine physician",
} as const;
export type ReporterSpecialty = keyof typeof reporterSpecialtyLabels;

const scanFileKindLabels = { images: "Images", pdf: "PDF" } as const;

/** One scan order, with everything its page shows. */
const scanOrderSchema = z.object({
  id: z.string(),
  stage: enumOf(scanStageLabels),
  patient: patientSchema.extend({
    dateOfBirth: z.iso.date(),
    sex: enumOf(sexLabels),
    /** Covered by an HMO. */
    hmo: z.boolean(),
  }),
  /** e.g. "CT scan". */
  modality: z.string(),
  /** e.g. "Chest". */
  bodyPart: z.string(),
  /** e.g. "non-contrast"; `null` when the order doesn't say. */
  contrast: z.string().nullable(),
  /** The doctor who ordered it, e.g. "Dr. Lois David". */
  requestedBy: z.string(),
  requestedAt: z.iso.datetime(),
  /** Where the requesting doctor works. */
  provider: z.object({ name: z.string(), email: z.email() }),
  /** What the doctor wrote on the order. */
  note: z.string().nullable(),
  /** When the radiologist accepted it; `null` while pending or once rejected. */
  acceptedAt: z.iso.datetime().nullable(),
  /** When the imaging is booked for; `null` until it's scheduled. */
  scheduledAt: z.iso.datetime().nullable(),
  /** `at` is null while the API doesn't say when (TODO(api): `rejected_at`). */
  rejection: z.object({ at: z.iso.datetime().nullable(), reason: z.string() }).nullable(),
  /** The radiologist's report; set once the order is completed. */
  result: z
    .object({
      /** The report's sqid, e.g. to log a download of it. */
      id: z.string(),
      /** The requesting doctor's review: `pending`, `approved` or `rejected`. */
      status: z.string(),
      uploadedAt: z.iso.datetime(),
      /** When the reporter says they reported it. */
      reportedAt: z.iso.datetime(),
      reportedBy: z.object({ name: z.string(), specialty: z.string() }),
      examination: z.string(),
      clinicalIndication: z.string(),
      /** How the images were taken; `null` when the report doesn't say. */
      technique: z.string().nullable(),
      findings: z.array(z.string()),
      impression: z.string(),
      recommendations: z.string(),
      /** Anything else the reporter added. */
      comment: z.string().nullable(),
      files: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          kind: enumOf(scanFileKindLabels),
          sizeBytes: count,
          uploadedAt: z.iso.datetime(),
          url: z.url(),
        }),
      ),
    })
    .nullable(),
});
export type ScanOrder = z.infer<typeof scanOrderSchema>;
export type ScanResult = NonNullable<ScanOrder["result"]>;

// ---------------------------------------------------------------------------------------------
// The real API's shapes (docs/api/openapi.json: `ScanOrderItemRead`, `HospitalAppointment`,
// `PatientBasicInfo`) and how they become the models above. TODO(api) marks what the API doesn't
// send yet; see docs/backend-gaps-v2-migration.md, section 7 (Radiologist).

const dateTime = z.iso.datetime({ offset: true });

/** API item status → the dashboard's tabs. */
const stageOfStatus: Record<string, ScanStage> = {
  pending: "pending",
  in_progress: "in_progress",
  image_collected: "in_progress",
  completed: "completed",
  rejected: "rejected",
};

/** The API's `status` filter for each tab. */
export const statusOfStage = {
  pending: "pending",
  in_progress: "in_progress",
  completed: "completed",
  rejected: "rejected",
} as const satisfies Record<ScanStage, string>;

const sexOf = (gender: string | null): "male" | "female" | "prefer_not_to_say" =>
  gender === "male" || gender === "female" ? gender : "prefer_not_to_say";

const sentence = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");

const patientInfo = z.object({
  hin: z.string(),
  firstname: text,
  lastname: text,
  gender: optionalText,
  dob: z.string(),
});

const toPatient = (patient: z.infer<typeof patientInfo>) => ({
  id: patient.hin,
  name: fullName(patient.firstname, patient.lastname) || patient.hin,
  avatarUrl: null as string | null,
  hin: patient.hin,
  dateOfBirth: patient.dob,
  sex: sexOf(patient.gender),
});

const personInfo = z
  .object({ firstname: text, lastname: text })
  .nullish()
  .transform((person) => (person ? fullName(person.firstname, person.lastname) : ""));

const resultRead = z.object({
  sqid: z.string(),
  clinical_indication: text,
  findings: z.array(z.string()).nullish(),
  impression: z.array(z.string()).nullish(),
  recommendation: z.array(z.string()).nullish(),
  attachments: z.array(z.unknown()).nullish(),
  extra_comment: optionalText,
  reporter_name: text,
  reporter_specialty: text,
  reported_at: dateTime.nullish(),
  status: z.string(),
  created_at: dateTime,
});

/** An attachment's URL, whether the API sends it bare or as `{url}`/`{file}`. */
function attachmentUrl(attachment: unknown): string | null {
  if (typeof attachment === "string") return attachment;
  if (attachment && typeof attachment === "object") {
    const record = attachment as Record<string, unknown>;
    const url = record.url ?? record.file ?? record.file_url;
    return typeof url === "string" ? url : null;
  }
  return null;
}

/** `ScanOrderItemRead`: one scan on a doctor's order, as the order page's model. */
export const scanOrderItemSchema = z
  .object({
    sqid: z.string(),
    order_info: z.object({
      patient_info: patientInfo,
      hospital_info: z.object({ name: text, email: optionalText }).nullish(),
      ordered_by_info: personInfo,
      created_at: dateTime,
    }),
    scan_info: z.object({
      name: text,
      parts: z
        .array(z.object({ part_type: text, part_name: text }))
        .nullish()
        .transform((parts) => parts ?? []),
    }),
    results: z
      .array(resultRead)
      .nullish()
      .transform((results) => results ?? []),
    created_at: dateTime,
    status: z.string(),
    rejection_reason: optionalText,
    image_collected_at: dateTime.nullish(),
  })
  .transform((item) => {
    const parts = item.scan_info.parts;
    const ofType = (type: string) =>
      parts.filter((part) => part.part_type.startsWith(type)).map((part) => part.part_name);
    const timing = new Set(ofType("Rad.Timing"));
    const stage = stageOfStatus[item.status] ?? "pending";
    const latest = [...item.results].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    const order: ScanOrder = {
      id: item.sqid,
      stage,
      patient: { ...toPatient(item.order_info.patient_info), hmo: false }, // TODO(api): HMO flag
      modality: ofType("Rad.Modality")[0] ?? item.scan_info.name,
      bodyPart: [...new Set(ofType("Rad.Anatomic Location"))].join(", "),
      contrast:
        timing.has("W") && timing.has("WO")
          ? "with and without contrast"
          : timing.has("W")
            ? "with contrast"
            : timing.has("WO")
              ? "non-contrast"
              : null,
      requestedBy: item.order_info.ordered_by_info,
      requestedAt: item.order_info.created_at,
      provider: {
        name: item.order_info.hospital_info?.name ?? "",
        email: item.order_info.hospital_info?.email ?? "",
      },
      note: null, // TODO(api): the doctor's note isn't on the item
      acceptedAt: null, // TODO(api): `accepted_at`
      scheduledAt: item.image_collected_at ?? null,
      rejection: item.rejection_reason ? { at: null, reason: item.rejection_reason } : null,
      result:
        stage === "completed" && latest
          ? {
              id: latest.sqid,
              status: latest.status,
              uploadedAt: latest.created_at,
              reportedAt: latest.reported_at ?? latest.created_at,
              reportedBy: { name: latest.reporter_name, specialty: latest.reporter_specialty },
              examination: item.scan_info.name,
              clinicalIndication: latest.clinical_indication,
              technique: null,
              findings: latest.findings ?? [],
              impression: (latest.impression ?? []).join("\n"),
              recommendations: (latest.recommendation ?? []).join("\n"),
              comment: latest.extra_comment,
              files: (latest.attachments ?? []).flatMap((attachment, index) => {
                const url = attachmentUrl(attachment);
                if (!url) return [];
                return [
                  {
                    id: `${latest.sqid}-${index}`,
                    name: decodeURIComponent(url.split("/").pop() || `attachment-${index + 1}`),
                    kind: /\.pdf($|\?)/i.test(url) ? ("pdf" as const) : ("images" as const),
                    sizeBytes: 0, // TODO(api): file sizes
                    uploadedAt: latest.created_at,
                    url,
                  },
                ];
              }),
            }
          : null,
    };
    return {
      ...order,
      scanType: item.scan_info.name,
      /** The latest report's review status (`pending`, `approved`, `rejected`), if any. */
      resultStatus: latest?.status ?? null,
    };
  });
type ScanOrderItem = z.infer<typeof scanOrderItemSchema>;

/** A page of `GET /api/radiology/orders/items`. */
export const scanOrderItemPageSchema = z.object({
  count: count,
  results: z.array(scanOrderItemSchema),
});

/** Only a list's total, e.g. `?size=1` to count a tab. */
export const countOnlySchema = z.object({ count: count }).transform(({ count }) => count);

/** The row a list shows for an item. */
export function toScanRecord(item: ScanOrderItem): ScanRecord {
  return {
    id: item.id,
    patient: {
      id: item.patient.id,
      name: item.patient.name,
      avatarUrl: item.patient.avatarUrl,
      hin: item.patient.hin,
      dateOfBirth: item.patient.dateOfBirth,
      sex: item.patient.sex,
    },
    scanType: item.scanType,
    requestedBy: item.requestedBy,
    requestedAt: item.requestedAt,
    stage: item.stage,
    seen: true, // TODO(api): no "seen" flag, so nothing shows as "New"
    progress: null, // TODO(api): no source (appointment or doctor request)
  };
}

/** The Recent Uploads card's status for a report's review status. */
export const uploadStatusOfResult: Record<string, UploadStatus> = {
  approved: "successful",
  pending: "processing",
  rejected: "failed",
};

/** `HospitalAppointment`s, as the schedule card shows them. */
export const appointmentPageSchema = z
  .object({
    results: z.array(
      z.object({
        sqid: z.string(),
        scheduled_time: dateTime,
        type: optionalText,
        note: optionalText,
        patient: z.object({ hin: text, firstname: text, lastname: text }),
      }),
    ),
  })
  .transform(({ results }): ScanSchedule => ({
    items: results.map((appointment) => ({
      id: appointment.sqid,
      at: appointment.scheduled_time,
      patient: {
        id: appointment.patient.hin,
        name: fullName(appointment.patient.firstname, appointment.patient.lastname),
        avatarUrl: null,
        hin: appointment.patient.hin,
      },
      // TODO(api): appointments carry no scan; the note or the type ("imaging") stands in.
      scanType: appointment.note ?? (appointment.type ? sentence(appointment.type) : "Imaging"),
    })),
  }));

/** `GET /api/radiology/patients`: patients with radiology orders here. */
export const radiologyPatientsSchema = z
  .object({ results: z.array(patientInfo) })
  .transform(({ results }): FoundPatient[] =>
    results.map((patient) => {
      const { sex: _sex, ...rest } = toPatient(patient);
      return { ...rest, phone: null, email: null };
    }),
  );

const monthKeys = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

/**
 * `GET /api/radiology/activity-chart-data`: scans carried out in each month of this year, January
 * first, from `{JAN: 4, FEB: 7, …}`. TODO(api): no response schema, so a month that's missing or
 * isn't a count reads as 0.
 */
export const scanActivitySchema = z
  .record(z.string(), z.unknown())
  .transform((months) => monthKeys.map((key) => count.catch(0).parse(months[key] ?? 0)));

/**
 * `GET /api/radiology/patients/recents`: patients with a scan result uploaded here in the last 24
 * hours, most recently scanned first.
 */
export const recentRadiologyPatientPageSchema = z
  .object({
    count: count,
    results: z.array(
      z.object({ hin: z.string(), firstname: text, lastname: text, scanned_at: dateTime }),
    ),
  })
  .transform(({ results }) =>
    results.map((patient) => ({
      hin: patient.hin,
      name: fullName(patient.firstname, patient.lastname) || patient.hin,
      scannedAt: patient.scanned_at,
    })),
  );

/** Replies to writes whose body the app doesn't use. */
export const anyResponseSchema = z.unknown();
