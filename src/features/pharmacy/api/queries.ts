import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { request } from "@/lib/api";
import {
  countOnlySchema,
  type DispensedTrend,
  dispensedTrendSchema,
  type PharmacyOverview,
  pharmacyProfileSchema,
  type PrescriptionList,
  prescriptionPageSchema,
  prescriptionSchema,
  type RecentPatientList,
  recentPatientPageSchema,
  type TrendPeriod,
} from "@/features/pharmacy/api/schemas";

// The pharmacy on the real API (docs/api/openapi.json). Where the API has no endpoint, filter or
// field yet, it's marked TODO(api); see docs/backend-gaps-v2-migration.md.

/** The Prescriptions page's tabs; the API calls settled ones "dispensed". */
export type PrescriptionTab = "pending" | "settled";
export type PrescriptionSort = "latest" | "oldest";

export const pharmacyKeys = {
  all: ["pharmacy"] as const,
  profile: () => [...pharmacyKeys.all, "profile"] as const,
  overview: () => [...pharmacyKeys.all, "overview"] as const,
  trend: (period: TrendPeriod) => [...pharmacyKeys.all, "trend", period] as const,
  recentPatients: (days: number, page: number) =>
    [...pharmacyKeys.all, "recent-patients", days, page] as const,
  prescriptions: (tab: PrescriptionTab, sort: PrescriptionSort, page: number) =>
    [...pharmacyKeys.all, "prescriptions", tab, sort, page] as const,
  prescription: (id: string) => [...pharmacyKeys.all, "prescription", id] as const,
};

const ORDERS_URL = "/api/pharmacy/orders";
const RECENT_URL = "/api/pharmacy/patients/recent";

/** The API's `status` for each tab: an order is pending while any drug is. */
const statusOfTab = { pending: "pending", settled: "dispensed" } as const;

export const pharmacyProfileQuery = () =>
  queryOptions({
    queryKey: pharmacyKeys.profile(),
    queryFn: () => request(pharmacyProfileSchema, { url: "/api/auth/staff/profile" }),
  });

/** The overview's numbers, counted from their lists. TODO(api): no pharmacy dashboard endpoint. */
export const pharmacyOverviewQuery = () =>
  queryOptions({
    queryKey: pharmacyKeys.overview(),
    queryFn: async (): Promise<PharmacyOverview> => {
      const [pending, settled, recentPatients] = await Promise.all([
        request(countOnlySchema, { url: ORDERS_URL, params: { status: "pending", size: 1 } }),
        request(countOnlySchema, { url: ORDERS_URL, params: { status: "dispensed", size: 1 } }),
        request(countOnlySchema, { url: RECENT_URL, params: { days: 7, size: 1 } }),
      ]);
      return { pending, settled, recentPatients };
    },
  });

/** Drugs dispensed per day, week, month or year, oldest first. */
export const dispensedTrendQuery = (period: TrendPeriod) =>
  queryOptions({
    queryKey: pharmacyKeys.trend(period),
    queryFn: async (): Promise<DispensedTrend> =>
      (
        await request(dispensedTrendSchema, {
          url: "/api/pharmacy/orders/trend",
          params: { period },
        })
      )
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date)),
    placeholderData: keepPreviousData,
  });

export const RECENT_PATIENTS_PAGE_SIZE = 8;

/** Patients given drugs in the last `days`, most recent first. */
export const recentPatientsQuery = (days: number, page: number) =>
  queryOptions({
    queryKey: pharmacyKeys.recentPatients(days, page),
    queryFn: async (): Promise<RecentPatientList> => {
      const { count, results } = await request(recentPatientPageSchema, {
        url: RECENT_URL,
        params: { days, page, size: RECENT_PATIENTS_PAGE_SIZE },
      });
      return {
        total: count,
        items: results.sort((a, b) => b.lastDispensedAt.localeCompare(a.lastDispensedAt)),
      };
    },
    placeholderData: keepPreviousData,
  });

export const PRESCRIPTIONS_PAGE_SIZE = 10;

/** A page of one tab's prescriptions, and both tabs' counts. TODO(api): no search yet. */
export const prescriptionListQuery = (tab: PrescriptionTab, sort: PrescriptionSort, page: number) =>
  queryOptions({
    queryKey: pharmacyKeys.prescriptions(tab, sort, page),
    queryFn: async (): Promise<PrescriptionList> => {
      const [list, pending, settled] = await Promise.all([
        request(prescriptionPageSchema, {
          url: ORDERS_URL,
          params: {
            status: statusOfTab[tab],
            ordering: sort === "latest" ? "-created_at" : "created_at",
            page,
            size: PRESCRIPTIONS_PAGE_SIZE,
          },
        }),
        request(countOnlySchema, { url: ORDERS_URL, params: { status: "pending", size: 1 } }),
        request(countOnlySchema, { url: ORDERS_URL, params: { status: "dispensed", size: 1 } }),
      ]);
      return { total: list.count, counts: { pending, settled }, items: list.results };
    },
    placeholderData: keepPreviousData,
  });

export const prescriptionQuery = (id: string) =>
  queryOptions({
    queryKey: pharmacyKeys.prescription(id),
    queryFn: () => request(prescriptionSchema, { url: `${ORDERS_URL}/${encodeURIComponent(id)}` }),
  });
