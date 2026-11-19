import { z } from "zod";
import type { Period } from "@/lib/period";

const count = z.number().int().nonnegative();

/** Turns a labels object's keys into a Zod enum. */
function enumOf<T extends Record<string, string>>(labels: T) {
  return z.enum(Object.keys(labels) as [keyof T & string, ...(keyof T & string)[]]);
}

/** The signed-in lab scientist and their hospital, for the dashboard's shell and greeting. */
export const labProfileSchema = z.object({
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
export type LabProfile = z.infer<typeof labProfileSchema>;

/** Headline numbers for the period asked for. */
export const labOverviewSchema = z.object({
  /** Every test requested in the period, whatever became of it. */
  totalTests: count,
  /** Requested and not processed yet (not limited to the period). */
  pendingTests: count,
  /** Results approved in the period. */
  approvedResults: count,
  /** Patients tested in the period who had been tested before. */
  returningPatients: count,
});
export type LabOverview = z.infer<typeof labOverviewSchema>;

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

/** Tests booked in the period, soonest first. */
export const testAppointmentsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      at: z.iso.datetime(),
      patient: patientSchema,
      /** e.g. "Full Blood Count". */
      testType: z.string(),
    }),
  ),
});
export type TestAppointments = z.infer<typeof testAppointmentsSchema>;

/** A test appointment just booked, as the list shows it. */
export const testAppointmentSchema = testAppointmentsSchema.shape.items.element;

/** Results entered and waiting for approval, newest first. */
export const pendingApprovalsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      /** e.g. "Lipid Profile". */
      testType: z.string(),
      patient: patientSchema.pick({ id: true, name: true }),
      /** When the result was entered. */
      enteredAt: z.iso.datetime(),
    }),
  ),
});
export type PendingApprovals = z.infer<typeof pendingApprovalsSchema>;

/** The Test Records tabs: where each order is in its life. */
export const testStageLabels = {
  pending: "Pending Test",
  in_progress: "In-Progress Test",
  completed: "Completed Test",
  rejected: "Rejected Test Order",
} as const;
export type TestStage = keyof typeof testStageLabels;

/** Why a test in progress is under way: booked as an appointment, or a doctor asked for it. */
export const testProgressLabels = {
  appointment: "Appt",
  doctor_request: "Doctor req",
} as const;

export const testSortLabels = { latest: "Latest", oldest: "Oldest" } as const;
export type TestSort = keyof typeof testSortLabels;

export type TestRecordParams = {
  stage: TestStage;
  search: string;
  sort: TestSort;
  page: number;
  pageSize: number;
  /** Only orders requested in this span; every order when left out. */
  period?: Period;
};

/** One page of a tab's test orders; `counts` covers every tab whatever the search. */
export const testRecordListSchema = z.object({
  counts: z.object({ pending: count, in_progress: count, completed: count, rejected: count }),
  total: count,
  items: z.array(
    z.object({
      id: z.string(),
      patient: patientSchema.extend({
        dateOfBirth: z.iso.date(),
        sex: enumOf(sexLabels),
      }),
      /** e.g. "Malaria/typhoid test". */
      testType: z.string(),
      /** The doctor who ordered it, e.g. "Dr. Raphael Jonnas". */
      requestedBy: z.string(),
      requestedAt: z.iso.datetime(),
      stage: enumOf(testStageLabels),
      /** The lab has opened it; unopened orders show as "New". */
      seen: z.boolean(),
      /** Set on in-progress orders only. */
      progress: enumOf(testProgressLabels).nullable(),
    }),
  ),
});
export type TestRecordList = z.infer<typeof testRecordListSchema>;
export type TestRecord = TestRecordList["items"][number];

/** How a result compares with its reference range. */
export const resultFlagLabels = {
  normal: "Normal",
  low: "Low",
  high: "High",
  critical_low: "Critical low",
  critical_high: "Critical high",
} as const;
export type ResultFlag = keyof typeof resultFlagLabels;

/** One test on an order, and the range a healthy result falls in. */
const testSchema = z.object({
  /** e.g. "Haemoglobin". */
  name: z.string(),
  /** The test's LOINC code, e.g. "718-7". */
  loinc: z.string(),
  /** e.g. "g/dL"; "" for a ratio with no unit. */
  unit: z.string(),
  referenceLow: z.number(),
  referenceHigh: z.number(),
});
export type LabTest = z.infer<typeof testSchema>;

/** One test order, with everything its page shows. */
export const testOrderSchema = z.object({
  id: z.string(),
  stage: enumOf(testStageLabels),
  patient: patientSchema.extend({
    dateOfBirth: z.iso.date(),
    sex: enumOf(sexLabels),
    /** Covered by an HMO. */
    hmo: z.boolean(),
  }),
  /** The tests asked for; one order can ask for several. */
  tests: z.array(testSchema).min(1),
  /** e.g. "1st trimester"; `null` when it doesn't apply. */
  pregnancyStatus: z.string().nullable(),
  /** The doctor who ordered it, e.g. "Dr. Lois David". */
  requestedBy: z.string(),
  requestedAt: z.iso.datetime(),
  /** Where the requesting doctor works. */
  provider: z.object({ name: z.string(), email: z.email() }),
  /** What the doctor wrote on the order. */
  note: z.string().nullable(),
  /** When the lab accepted it; `null` while pending or once rejected. */
  acceptedAt: z.iso.datetime().nullable(),
  /** When the sample was taken; `null` until it's logged. */
  sampleCollectedAt: z.iso.datetime().nullable(),
  rejection: z.object({ at: z.iso.datetime(), reason: z.string() }).nullable(),
  /** Set once the order is completed. */
  result: z
    .object({
      uploadedAt: z.iso.datetime(),
      /** One per test, in the order's order. */
      values: z.array(z.object({ loinc: z.string(), value: z.number() })),
      interpretation: z.string(),
      clinicalCorrelation: z.string(),
    })
    .nullable(),
});
export type TestOrder = z.infer<typeof testOrderSchema>;

/** Registered patients whose HIN matches the one looked up (one, or none). */
export const patientLookupSchema = z.object({
  items: z.array(
    patientSchema.extend({
      dateOfBirth: z.iso.date(),
      phone: z.string().nullable(),
      email: z.email().nullable(),
    }),
  ),
});
export type FoundPatient = z.infer<typeof patientLookupSchema>["items"][number];
