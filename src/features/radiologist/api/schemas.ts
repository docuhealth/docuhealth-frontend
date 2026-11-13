import { z } from "zod";
import type { Period } from "@/lib/period";

const count = z.number().int().nonnegative();

/** Turns a labels object's keys into a Zod enum. */
function enumOf<T extends Record<string, string>>(labels: T) {
  return z.enum(Object.keys(labels) as [keyof T & string, ...(keyof T & string)[]]);
}

/** The signed-in radiologist and their hospital, for the dashboard's shell and greeting. */
export const radiologistProfileSchema = z.object({
  hospital: z.object({
    name: z.string(),
    /** The banner photo the hospital's admin chose; `null` shows the default one. */
    bannerUrl: z.url().nullable(),
  }),
  user: z.object({
    /** e.g. "Dr."; `null` when they don't use one. */
    title: z.string().nullable(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    avatarUrl: z.url().nullable(),
  }),
  unreadNotifications: count,
  unreadMessages: count,
});
export type RadiologistProfile = z.infer<typeof radiologistProfileSchema>;

/** Headline numbers for the period asked for. */
export const radiologyOverviewSchema = z.object({
  /** Every scan requested in the period, whatever became of it. */
  imagingRequests: count,
  /** Requested and not started yet. */
  pendingOrders: count,
  completedScans: count,
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
export const scanScheduleSchema = z.object({
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

export const uploadStatusLabels = {
  successful: "Successful",
  processing: "Processing",
  failed: "Failed",
} as const;
export type UploadStatus = keyof typeof uploadStatusLabels;

/** Scan results uploaded in the period, newest first. */
export const recentUploadsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      uploadedAt: z.iso.datetime(),
      patient: patientSchema.pick({ id: true, name: true }),
      scanType: z.string(),
      status: enumOf(uploadStatusLabels),
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
export type ScanProgress = keyof typeof scanProgressLabels;

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
export const scanRecordListSchema = z.object({
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

export const scanFileKindLabels = { images: "Images", pdf: "PDF" } as const;

/** One scan order, with everything its page shows. */
export const scanOrderSchema = z.object({
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
  rejection: z.object({ at: z.iso.datetime(), reason: z.string() }).nullable(),
  /** The radiologist's report; set once the order is completed. */
  result: z
    .object({
      uploadedAt: z.iso.datetime(),
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
