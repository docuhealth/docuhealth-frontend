import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { env } from "@/env";
import type { Power } from "@/features/patient/api/family";
import { request } from "@/lib/api";
import { NotAvailableYetError } from "@/lib/not-available";

// TODO(api): what the Family & proxy screens need that the API doesn't serve yet: a dependant's
// photo, the vaccines they're due and their growth (weight, height and BMI by age, with
// percentiles), and a way to change a proxy's powers (there's no update endpoint; ending the
// grant and asking again would cut the proxy off until they accept again). On the mock dev server
// (`npm run dev`) these come from src/mocks/patient-family.ts; elsewhere they're empty and
// saving powers fails with "… isn't available yet".

const PENDING = "/api/pending/patient/family";

const mocked = () => import.meta.env.DEV && env.VITE_ENABLE_MOCKS;

/** The mock server's demo data in dev; `empty` everywhere else. */
function pendingRequest<T extends z.ZodType>(schema: T, path: string, empty: z.output<T>) {
  if (!mocked()) return Promise.resolve(empty);
  return request(schema, { url: `${PENDING}${path}` });
}

/** An action on the mock server in dev; everywhere else it fails, saying `what` can't be done yet. */
function pendingAction<T extends z.ZodType>(schema: T, what: string, path: string, data: unknown) {
  if (!mocked()) return Promise.reject(new NotAvailableYetError(what));
  return request(schema, { method: "POST", url: `${PENDING}${path}`, data });
}

const growthMetricSchema = z.object({
  unit: z.string(),
  /** The latest reading's percentile for the child's age, e.g. 50. */
  percentile: z.number().nullable(),
  /** Oldest first: one reading per year of age. */
  points: z.array(z.object({ ageYears: z.number(), value: z.number() })),
});
export type GrowthMetric = z.output<typeof growthMetricSchema>;

const dependantExtrasSchema = z.object({
  hin: z.string(),
  photoUrl: z.string().nullable(),
  vaccinesDue: z.array(
    z.object({
      name: z.string(),
      /** "YYYY-MM-DD". */
      dueBy: z.string(),
      /** "Any DocuHealth clinic". */
      where: z.string().nullable(),
    }),
  ),
  growth: z.object({
    weight: growthMetricSchema,
    height: growthMetricSchema,
    bmi: growthMetricSchema,
  }),
});
export type DependantExtras = z.output<typeof dependantExtrasSchema>;

/** Each dependant's photo, due vaccines and growth, by HIN. */
export const dependantExtrasQuery = () =>
  queryOptions({
    queryKey: ["patient", "family", "pending", "dependants"] as const,
    queryFn: () => pendingRequest(z.array(dependantExtrasSchema), "/dependants", []),
  });

/** Change what a proxy may do. TODO(api): no endpoint changes a grant's powers. */
export function useUpdateProxyPowers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, powers }: { id: string; powers: Power[] }) =>
      pendingAction(
        z.unknown(),
        "Changing a proxy’s access",
        `/proxies/${encodeURIComponent(id)}/powers`,
        {
          powers,
        },
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patient", "family"] }),
  });
}
