import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { request } from "@/lib/api";
import { countOnlySchema } from "@/features/doctor/api/schemas";
import { doctorKeys } from "@/features/doctor/api/queries";

// The doctor's overview: `GET /api/hospital-ops/dashboards/doctor` (TODO(api): no response
// schema; read as staging returns it) and how many patients wait for a doctor.

/** A headline number and its change, in percent, on the period before. */
export type Total = { value: number; change: number | null };
export type MonthCount = { label: string; value: number };

export type DoctorOverview = {
  appointments: Total;
  referrals: Total;
  admissions: Total;
  admissionsByMonth: MonthCount[];
  dischargedByMonth: MonthCount[];
};

const total = z
  .object({ value: z.number().catch(0), increase: z.number().nullish().catch(null) })
  .nullish()
  .transform((entry): Total => ({ value: entry?.value ?? 0, change: entry?.increase ?? null }));

const months = z
  .array(z.object({ label: z.string(), value: z.number().catch(0) }))
  .nullish()
  .catch(null)
  .transform((entries) => entries ?? []);

const doctorDashboardSchema = z
  .object({
    summary: z
      .object({
        total_appointments: total,
        total_referrals: total,
        total_admissions: total,
      })
      .partial()
      .nullish(),
    charts: z
      .object({ admissions_overview: months, discharged_patients: months })
      .partial()
      .nullish(),
  })
  .transform(({ summary, charts }): DoctorOverview => ({
    appointments: summary?.total_appointments ?? { value: 0, change: null },
    referrals: summary?.total_referrals ?? { value: 0, change: null },
    admissions: summary?.total_admissions ?? { value: 0, change: null },
    admissionsByMonth: charts?.admissions_overview ?? [],
    dischargedByMonth: charts?.discharged_patients ?? [],
  }));

export const doctorOverviewQuery = () =>
  queryOptions({
    queryKey: [...doctorKeys.all, "overview"] as const,
    queryFn: () => request(doctorDashboardSchema, { url: "/api/hospital-ops/dashboards/doctor" }),
  });

/** How many checked-in patients wait for a doctor. */
export const waitingCountQuery = () =>
  queryOptions({
    queryKey: [...doctorKeys.all, "waiting-count"] as const,
    queryFn: () =>
      request(countOnlySchema, {
        url: "/api/hospital-ops/check-ins/doctor-queue",
        params: { status: "doctor_idle", page: 1, size: 1 },
      }),
  });
