import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { request } from "@/lib/api";
import {
  dashboardOverviewSchema,
  hospitalProfileSchema,
  patientDetailSchema,
  patientFilterOptionsSchema,
  type PatientListParams,
  patientListSchema,
  patientQueueSchema,
  patientStatsSchema,
  staffDetailSchema,
  staffListSchema,
  type StaffFilter,
} from "@/features/hospital-admin/api/schemas";
import { type Period } from "@/lib/period";

// TODO(api): endpoint paths and shapes are provisional until the v2 hospital API is defined;
// src/mocks/hospital-admin.ts fakes them.

export const hospitalAdminKeys = {
  all: ["hospital-admin"] as const,
  profile: () => [...hospitalAdminKeys.all, "profile"] as const,
  overview: (period: Period) => [...hospitalAdminKeys.all, "overview", period] as const,
  queue: (search: string) => [...hospitalAdminKeys.all, "queue", search] as const,
  /** Every staff list, whatever its search, page or filter (e.g. to refresh them all). */
  staffLists: () => [...hospitalAdminKeys.all, "staff"] as const,
  staff: (search: string, page: number, filter: StaffFilter) =>
    [...hospitalAdminKeys.staffLists(), search, page, filter] as const,
  staffMember: (id: string, period: Period) =>
    [...hospitalAdminKeys.all, "staff-member", id, period] as const,
  patientStats: (period: Period) => [...hospitalAdminKeys.all, "patient-stats", period] as const,
  patients: (params: PatientListParams) => [...hospitalAdminKeys.all, "patients", params] as const,
  patient: (id: string) => [...hospitalAdminKeys.all, "patient", id] as const,
  patientFilterOptions: () => [...hospitalAdminKeys.all, "patient-filter-options"] as const,
};

export const hospitalProfileQuery = () =>
  queryOptions({
    queryKey: hospitalAdminKeys.profile(),
    queryFn: () => request(hospitalProfileSchema, { url: "/hospital/profile" }),
  });

export const dashboardOverviewQuery = (period: Period) =>
  queryOptions({
    queryKey: hospitalAdminKeys.overview(period),
    queryFn: () =>
      request(dashboardOverviewSchema, { url: "/hospital/dashboard", params: { period } }),
  });

// Searches keep showing the previous results until the new ones arrive.

export const patientQueueQuery = (search: string) =>
  queryOptions({
    queryKey: hospitalAdminKeys.queue(search),
    queryFn: () => request(patientQueueSchema, { url: "/hospital/queue", params: { search } }),
    placeholderData: keepPreviousData,
  });

export const STAFF_PAGE_SIZE = 10;

export const staffListQuery = (search: string, page: number, filter: StaffFilter = "all") =>
  queryOptions({
    queryKey: hospitalAdminKeys.staff(search, page, filter),
    queryFn: () =>
      request(staffListSchema, {
        url: "/hospital/staff",
        params: { search, page, pageSize: STAFF_PAGE_SIZE, filter },
      }),
    placeholderData: keepPreviousData,
  });

export const staffDetailQuery = (id: string, period: Period) =>
  queryOptions({
    queryKey: hospitalAdminKeys.staffMember(id, period),
    queryFn: () => request(staffDetailSchema, { url: `/hospital/staff/${id}`, params: { period } }),
  });

export const patientStatsQuery = (period: Period) =>
  queryOptions({
    queryKey: hospitalAdminKeys.patientStats(period),
    queryFn: () =>
      request(patientStatsSchema, { url: "/hospital/patients/stats", params: { period } }),
  });

export const PATIENTS_PAGE_SIZE = 6;

export const patientListQuery = (params: PatientListParams) =>
  queryOptions({
    queryKey: hospitalAdminKeys.patients(params),
    queryFn: () =>
      request(patientListSchema, {
        url: "/hospital/patients",
        params: { ...params, pageSize: PATIENTS_PAGE_SIZE },
      }),
    placeholderData: keepPreviousData,
  });

export const patientFilterOptionsQuery = () =>
  queryOptions({
    queryKey: hospitalAdminKeys.patientFilterOptions(),
    queryFn: () =>
      request(patientFilterOptionsSchema, { url: "/hospital/patients/filter-options" }),
  });

export const patientDetailQuery = (id: string) =>
  queryOptions({
    queryKey: hospitalAdminKeys.patient(id),
    queryFn: () => request(patientDetailSchema, { url: `/hospital/patients/${id}` }),
  });
