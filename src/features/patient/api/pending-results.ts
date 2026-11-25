import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { env } from "@/env";
import { request } from "@/lib/api";

// TODO(api): the lab's side of a patient's test, which the API doesn't serve to patients yet: how
// far along it is, the specimen and times, reference ranges, earlier readings, amendments and
// qualitative results. Visit summaries only carry each test's name and order status, and the
// pending lab results (api/pending.ts) only values with flags. On the mock dev server these come
// from src/mocks/patient-results.ts; elsewhere they're empty and the pages show what the visit
// summaries know. When an endpoint lands, point `labReportsQuery` at it and parse its reply.

const PENDING = "/api/pending/patient/results";

/** The mock server's demo data in dev; `empty` everywhere else. */
function pendingRequest<T extends z.ZodType>(schema: T, path: string, empty: z.output<T>) {
  if (!(import.meta.env.DEV && env.VITE_ENABLE_MOCKS)) return Promise.resolve(empty);
  return request(schema, { url: `${PENDING}${path}` });
}

/** One value the lab measured, with its normal range and the patient's earlier readings. */
const reportValueSchema = z.object({
  name: z.string(),
  value: z.string(),
  unit: z.string(),
  flag: z.enum(["normal", "low", "high"]),
  /** The normal range's ends as the lab prints them ("13.0"), either may be open. */
  low: z.string().nullable(),
  high: z.string().nullable(),
  /** What the value means for the patient, in plain words. */
  about: z.string().nullable(),
  /** Earlier readings of the same value, for the trend chart. */
  history: z.array(z.object({ at: z.string(), value: z.number() })),
});

/** A lab test's report, keyed by the visit and the test's name. */
export const labReportSchema = z.object({
  visitId: z.string(),
  test: z.string(),
  /** Where it is: sample taken, being tested, or results out. */
  stage: z.enum(["collected", "testing", "ready"]),
  laboratory: z.string().nullable(),
  specimen: z.string().nullable(),
  method: z.string().nullable(),
  orderedBy: z.string().nullable(),
  collectedAt: z.string().nullable(),
  receivedAt: z.string().nullable(),
  resultedAt: z.string().nullable(),
  /** What the test looks at, in plain words. */
  about: z.string().nullable(),
  values: z.array(reportValueSchema),
  /** A result that's a word, not a number: "Negative", "Not detected". */
  qualitative: z
    .object({
      result: z.string(),
      finding: z.string(),
      normal: z.boolean(),
      explanation: z.string().nullable(),
    })
    .nullable(),
  /** The lab corrected the result after it was first shared. */
  amendment: z
    .object({
      at: z.string(),
      summary: z.string(),
      changes: z.array(z.object({ name: z.string(), from: z.string(), to: z.string() })),
      reason: z.string().nullable(),
      by: z.string().nullable(),
    })
    .nullable(),
});
export type LabReport = z.output<typeof labReportSchema>;

export const labReportsQuery = () =>
  queryOptions({
    queryKey: ["patient", "pending", "lab-reports"] as const,
    queryFn: () => pendingRequest(z.array(labReportSchema), "/reports", []),
  });
