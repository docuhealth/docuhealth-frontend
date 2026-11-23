import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { request } from "@/lib/api";
import {
  type ApplicationStatus,
  adminOverviewSchema,
  applicationPageSchema,
  hospitalUserPageSchema,
  patientUserPageSchema,
  planListSchema,
  type TrendPeriod,
  trendResponseSchema,
} from "@/features/dh-admin/api/schemas";

export const dhAdminKeys = {
  all: ["dh-admin"] as const,
  overview: () => [...dhAdminKeys.all, "overview"] as const,
  trend: (trend: Trend, period: TrendPeriod) =>
    [...dhAdminKeys.all, "trend", trend, period] as const,
  patients: (search: string, page: number) =>
    [...dhAdminKeys.all, "users", "patient", search, page] as const,
  hospitals: (search: string, page: number) =>
    [...dhAdminKeys.all, "users", "hospital", search, page] as const,
  applications: (status: ApplicationStatus, page: number) =>
    [...dhAdminKeys.all, "applications", status, page] as const,
  plans: () => [...dhAdminKeys.all, "plans"] as const,
};

export const adminOverviewQuery = () =>
  queryOptions({
    queryKey: dhAdminKeys.overview(),
    queryFn: () => request(adminOverviewSchema, { url: "/api/admin/dashboard" }),
  });

/** The overview's trends: who registered, who subscribed, and what came in. */
const trendUrls = {
  users: "/api/admin/dashboard/users",
  subscriptions: "/api/admin/dashboard/subscriptions",
  revenue: "/api/admin/dashboard/revenue",
} as const;
export type Trend = keyof typeof trendUrls;

export const trendQuery = (trend: Trend, period: TrendPeriod) =>
  queryOptions({
    queryKey: dhAdminKeys.trend(trend, period),
    queryFn: () => request(trendResponseSchema, { url: trendUrls[trend], params: { period } }),
  });

export const USERS_PAGE_SIZE = 10;

export const patientUsersQuery = (search: string, page: number) =>
  queryOptions({
    queryKey: dhAdminKeys.patients(search, page),
    queryFn: () =>
      request(patientUserPageSchema, {
        url: "/api/admin/users/patient",
        params: { search: search || undefined, page, size: USERS_PAGE_SIZE },
      }),
    placeholderData: keepPreviousData,
  });

export const hospitalUsersQuery = (search: string, page: number) =>
  queryOptions({
    queryKey: dhAdminKeys.hospitals(search, page),
    queryFn: () =>
      request(hospitalUserPageSchema, {
        url: "/api/admin/users/hospital",
        params: { search: search || undefined, page, size: USERS_PAGE_SIZE },
      }),
    placeholderData: keepPreviousData,
  });

export const APPLICATIONS_PAGE_SIZE = 10;

export const applicationsQuery = (status: ApplicationStatus, page: number) =>
  queryOptions({
    queryKey: dhAdminKeys.applications(status, page),
    queryFn: () =>
      request(applicationPageSchema, {
        url: "/api/admin/facility-applications",
        params: { status, page, size: APPLICATIONS_PAGE_SIZE },
      }),
  });

/** How many applications each status has, for the tabs. */
export const applicationCountQuery = (status: ApplicationStatus) =>
  queryOptions({
    queryKey: [...dhAdminKeys.all, "application-count", status] as const,
    queryFn: async () => {
      const { total } = await request(applicationPageSchema, {
        url: "/api/admin/facility-applications",
        params: { status, page: 1, size: 1 },
      });
      return total;
    },
  });

export const plansQuery = () =>
  queryOptions({
    queryKey: dhAdminKeys.plans(),
    queryFn: () => request(planListSchema, { url: "/api/payments/plans/all" }),
  });
