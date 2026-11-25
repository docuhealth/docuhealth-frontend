import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { env } from "@/env";
import { request } from "@/lib/api";

// TODO(api): what the Health Trends and Healthcare facilities screens need that the API doesn't
// serve to patients yet: earlier lab values (for HbA1c, haemoglobin and creatinine trends) and a
// facility's location and photo. Like api/pending.ts: demo data from src/mocks/patient-health.ts
// on the mock dev server, empty everywhere else. When an endpoint lands, point its query at it.

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

/**
 * One lab value from before the lab results the visits carry (e.g. "HbA1c" 6.1 % three years
 * ago), newest first.
 */
export const labReadingSchema = z.object({
  id: z.string(),
  /** The value's name, as in a lab result: "HbA1c", "Haemoglobin", "Creatinine". */
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  flag: z.enum(["normal", "low", "high"]),
  at: z.string(),
  facility: z.string().nullable(),
});
export type LabReading = z.output<typeof labReadingSchema>;

export const labHistoryQuery = () =>
  queryOptions({
    queryKey: pendingKeys.of("lab-history"),
    queryFn: () => pendingRequest(z.array(labReadingSchema), "/lab-history", []),
  });

/** Where a facility is and its photo, by its name as visits give it. */
export const facilityProfileSchema = z.object({
  name: z.string(),
  /** "Ikeja, Lagos". */
  location: z.string().nullable(),
  photoUrl: z.string().nullable(),
});
export type FacilityProfile = z.output<typeof facilityProfileSchema>;

export const facilityProfilesQuery = () =>
  queryOptions({
    queryKey: pendingKeys.of("facility-profiles"),
    queryFn: () => pendingRequest(z.array(facilityProfileSchema), "/facilities", []),
  });
