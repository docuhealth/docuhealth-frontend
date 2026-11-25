import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { env } from "@/env";
import { request } from "@/lib/api";

// TODO(api): records the patient screens are designed for but the API doesn't serve to patients
// yet (docs/backend-gaps-v2-migration.md, "Patient dashboard"). Each has the shape its screen
// needs. On the mock dev server (`npm run dev`) they come from src/mocks/patient-pending.ts so
// the populated screens can be seen and worked on; on staging and live they're empty until the
// endpoint exists, and the screens show their empty states. When an endpoint lands, point its
// query at the real path, parse the real reply, and drop it from `pendingRequest`.

const PENDING = "/api/pending/patient";

/** The mock server's demo data in dev; `empty` everywhere else. */
function pendingRequest<T extends z.ZodType>(schema: T, path: string, empty: z.output<T>) {
  if (!(import.meta.env.DEV && env.VITE_ENABLE_MOCKS)) return Promise.resolve(empty);
  return request(schema, { url: `${PENDING}${path}` });
}

const pendingKeys = {
  all: ["patient", "pending"] as const,
  of: (what: string) => [...pendingKeys.all, what] as const,
};

/** Facts about the patient that aren't in any visit: blood group, genotype, counts, glucose. */
export const healthProfileSchema = z.object({
  bloodGroup: z.string().nullable(),
  genotype: z.string().nullable(),
  /** Files the patient or a facility uploaded. */
  documents: z.number(),
  immunizations: z.object({ doses: z.number(), due: z.number() }),
  /** Naira owed across facilities. */
  outstandingBill: z.number().nullable(),
  glucose: z.object({ value: z.number(), at: z.string(), context: z.string() }).nullable(),
});
export type HealthProfile = z.output<typeof healthProfileSchema>;

const emptyProfile: HealthProfile = {
  bloodGroup: null,
  genotype: null,
  documents: 0,
  immunizations: { doses: 0, due: 0 },
  outstandingBill: null,
  glucose: null,
};

export const healthProfileQuery = () =>
  queryOptions({
    queryKey: pendingKeys.of("profile"),
    queryFn: () => pendingRequest(healthProfileSchema, "/profile", emptyProfile),
  });

export const allergySchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(["food", "medicine", "material", "other"]),
  /** What happens, e.g. "Hives (urticaria)". */
  reaction: z.string(),
  severity: z.enum(["severe", "moderate", "mild"]),
  active: z.boolean(),
  facility: z.string().nullable(),
  recordedBy: z.string().nullable(),
  at: z.string(),
  /** "What to avoid", in plain words. */
  avoid: z.string().nullable(),
  /** The care team's note. */
  note: z.string().nullable(),
});
export type Allergy = z.output<typeof allergySchema>;

export const allergiesQuery = () =>
  queryOptions({
    queryKey: pendingKeys.of("allergies"),
    queryFn: () => pendingRequest(z.array(allergySchema), "/allergies", []),
  });

const planItemSchema = z.object({
  kind: z.enum(["medication", "monitoring", "visit", "test"]),
  title: z.string(),
  detail: z.string(),
});

export const carePlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["active", "completed", "stopped"]),
  facility: z.string().nullable(),
  setBy: z.string().nullable(),
  startedAt: z.string(),
  updatedAt: z.string(),
  nextReview: z.string().nullable(),
  endedAt: z.string().nullable(),
  careTeam: z.string().nullable(),
  /** The diagnosis it's for: the visit id the condition pages use. */
  conditionId: z.string().nullable(),
  goal: z
    .object({
      target: z.string(),
      unit: z.string(),
      latest: z.string().nullable(),
      latestAt: z.string().nullable(),
      onTrack: z.boolean(),
    })
    .nullable(),
  items: z.array(planItemSchema),
});
export type CarePlan = z.output<typeof carePlanSchema>;

export const carePlansQuery = () =>
  queryOptions({
    queryKey: pendingKeys.of("care-plans"),
    queryFn: () => pendingRequest(z.array(carePlanSchema), "/care-plans", []),
  });

/** A scan's report and images, keyed by the scan pages' id (`{visitId}-{index}`). */
export const scanReportSchema = z.object({
  scanId: z.string(),
  /** Where it is: done, images taken, a specialist reviewing, or the report is ready. */
  stage: z.enum(["scanned", "captured", "reviewing", "ready"]),
  scannedAt: z.string(),
  capturedAt: z.string().nullable(),
  images: z.number(),
  bodyPart: z.string().nullable(),
  type: z.string().nullable(),
  reportedBy: z.string().nullable(),
  reportedAt: z.string().nullable(),
  impression: z.string().nullable(),
  findings: z.string().nullable(),
});
export type ScanReport = z.output<typeof scanReportSchema>;

export const scanReportsQuery = () =>
  queryOptions({
    queryKey: pendingKeys.of("scan-reports"),
    queryFn: () => pendingRequest(z.array(scanReportSchema), "/scan-reports", []),
  });

/** A lab test's values, keyed by the visit and the test's name. */
export const labResultSchema = z.object({
  visitId: z.string(),
  test: z.string(),
  values: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
      unit: z.string(),
      flag: z.enum(["normal", "low", "high"]),
    }),
  ),
});
export type LabResult = z.output<typeof labResultSchema>;

export const labResultsQuery = () =>
  queryOptions({
    queryKey: pendingKeys.of("lab-results"),
    queryFn: () => pendingRequest(z.array(labResultSchema), "/lab-results", []),
  });

/** What kind of visit it was, and what comes next, keyed by the visit's id. */
export const visitDetailSchema = z.object({
  visitId: z.string(),
  type: z.enum(["outpatient", "admission", "emergency", "lab"]),
  /** For an admission: nights stayed, and whether they've been discharged. */
  nights: z.number().nullable(),
  discharged: z.boolean(),
  nextSteps: z.array(
    z.object({ kind: z.enum(["visit", "test"]), title: z.string(), detail: z.string() }),
  ),
});
export type VisitDetail = z.output<typeof visitDetailSchema>;

export const visitDetailsQuery = () =>
  queryOptions({
    queryKey: pendingKeys.of("visit-details"),
    queryFn: () => pendingRequest(z.array(visitDetailSchema), "/visit-details", []),
  });

/** Who prescribed and dispensed a medicine, keyed by the drug record's id. */
export const medicationDetailSchema = z.object({
  drugId: z.string(),
  prescribedBy: z.string().nullable(),
  facility: z.string().nullable(),
  pharmacy: z.string().nullable(),
  dispensedBy: z.string().nullable(),
  refills: z.string().nullable(),
  paymentStatus: z.enum(["paid", "unpaid", "covered"]).nullable(),
  /** How to take it, in plain words. */
  instructions: z.string().nullable(),
  endsAt: z.string().nullable(),
});
export type MedicationDetail = z.output<typeof medicationDetailSchema>;

export const medicationDetailsQuery = () =>
  queryOptions({
    queryKey: pendingKeys.of("medication-details"),
    queryFn: () => pendingRequest(z.array(medicationDetailSchema), "/medication-details", []),
  });
