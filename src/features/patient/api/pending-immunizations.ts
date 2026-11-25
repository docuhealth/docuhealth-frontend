import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { env } from "@/env";
import { request } from "@/lib/api";

// TODO(api): no immunization records are served to patients (nothing in docs/api/openapi.json).
// Like api/pending.ts: demo data from src/mocks/patient-health.ts on the mock dev server, empty
// everywhere else, so the screens show their empty state. When an endpoint lands, point
// `immunizationsQuery` at it and parse its reply into this shape.

const PENDING = "/api/pending/patient";

/** The mock server's demo data in dev; `empty` everywhere else. */
function pendingRequest<T extends z.ZodType>(schema: T, path: string, empty: z.output<T>) {
  if (!(import.meta.env.DEV && env.VITE_ENABLE_MOCKS)) return Promise.resolve(empty);
  return request(schema, { url: `${PENDING}${path}` });
}

/** One entry in a vaccine's history: a dose, a booster, or a whole primary series. */
const doseSchema = z.object({
  kind: z.enum(["dose", "booster", "series"]),
  /** A dose's number in the course ("Dose 3"). */
  number: z.number().nullable(),
  /** How many doses the entry stands for: 1, or a series' doses. */
  count: z.number(),
  /** Null when only the vaccine card says it was given. */
  at: z.string().nullable(),
  /** The product and strength: "Engerix-B 20 mcg". */
  brand: z.string().nullable(),
  facility: z.string().nullable(),
  givenBy: z.string().nullable(),
  batch: z.string().nullable(),
  childhood: z.boolean(),
  /** Recorded from the patient's vaccine card rather than by a facility. */
  fromCard: z.boolean(),
});
export type VaccineDose = z.output<typeof doseSchema>;

export const vaccineSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** The facility that holds the record. */
  facility: z.string().nullable(),
  updatedAt: z.string(),
  /** Doses in the primary course, when it has a set number ("3 of 3 doses"). */
  dosesTotal: z.number().nullable(),
  /** One dose protects for life (yellow fever). */
  lifelong: z.boolean(),
  /** The next dose or booster due, if any. */
  due: z
    .object({
      at: z.string(),
      kind: z.enum(["dose", "booster"]),
      /** "2 weeks before". */
      reminder: z.string().nullable(),
    })
    .nullable(),
  protectsAgainst: z.string().nullable(),
  /** Newest first. */
  doses: z.array(doseSchema),
});
export type Vaccine = z.output<typeof vaccineSchema>;

export const immunizationsQuery = () =>
  queryOptions({
    queryKey: ["patient", "pending", "immunizations"] as const,
    queryFn: () => pendingRequest(z.array(vaccineSchema), "/immunizations", []),
  });
