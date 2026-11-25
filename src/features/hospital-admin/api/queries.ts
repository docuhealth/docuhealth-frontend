import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { request } from "@/lib/api";
import { NotAvailableYetError } from "@/lib/not-available";
import { type Period } from "@/lib/period";
import {
  administrationMetricsSchema,
  checkInPageSchema,
  countOnlySchema,
  facilitySubscriptionSchema,
  type DashboardOverview,
  guardianshipPageSchema,
  hospitalProfileSchema,
  isOpenCheckIn,
  type PatientDetail,
  type PatientFilterOptions,
  patientInfoSchema,
  type PatientList,
  type PatientListParams,
  patientManagementMetricsSchema,
  patientPageSchema,
  type PatientQueue,
  patientStatusOfTab,
  type PatientTab,
  patientTabLabels,
  type StaffDetail,
  staffDetailSchema,
  type StaffFilter,
  type StaffList,
  type StaffMember,
  staffPageSchema,
  staffRoleCountsSchema,
  subscriptionPlansSchema,
  toPatientDetail,
  toPatientVisit,
  toQueueEntry,
  toStaffDetail,
  toStaffMember,
  visitMetricsSchema,
  visitTimelinePageSchema,
  wardBedsSchema,
  type WardList,
  wardManagePageSchema,
  wardPageSchema,
} from "@/features/hospital-admin/api/schemas";

// The hospital admin on the real API (docs/api/openapi.json). Where the API has no endpoint,
// filter or field yet, it's marked TODO(api); see docs/backend-gaps-v2-migration.md, section 7.

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
  wards: (page: number) => [...hospitalAdminKeys.all, "wards", page] as const,
  wardBeds: (id: string) => [...hospitalAdminKeys.all, "ward-beds", id] as const,
  subscription: () => [...hospitalAdminKeys.all, "subscription"] as const,
};

const STAFF_URL = "/api/auth/staff";
const PATIENTS_URL = "/api/hospital-ops/patients";
export const WARDS_URL = "/api/hospital-ops/wards/manage";

export const hospitalProfileQuery = () =>
  queryOptions({
    queryKey: hospitalAdminKeys.profile(),
    queryFn: () => request(hospitalProfileSchema, { url: "/api/auth/staff/profile" }),
  });

/** A dashboard period as the API names it (its `period`, or `timeframe` on some endpoints). */
const apiPeriod = { today: "day", week: "week", month: "month" } as const satisfies Record<
  Period,
  string
>;

/** How many staff match `params`, e.g. one role. */
const countStaff = (params: Record<string, string> = {}) =>
  request(countOnlySchema, { url: STAFF_URL, params: { ...params, page: 1, size: 1 } });

/** The headline staff and facility numbers, `added` counting staff added in `period`. */
const administrationMetrics = (period?: Period) =>
  request(administrationMetricsSchema, {
    url: "/api/hospital-ops/administration-metrics",
    params: { timeframe: period && apiPeriod[period] },
  });

/** The overview's numbers: the team's size, who joined in `period`, and its split by role. */
export const dashboardOverviewQuery = (period: Period) =>
  queryOptions({
    queryKey: hospitalAdminKeys.overview(period),
    queryFn: async (): Promise<DashboardOverview> => {
      const [stats, staffByRole] = await Promise.all([
        administrationMetrics(period),
        request(staffRoleCountsSchema, { url: "/api/hospital-ops/staff-role-counts" }),
      ]);
      return { stats, staffByRole };
    },
  });

// Searches keep showing the previous results until the new ones arrive.

/**
 * Patients checked in and not yet checked out, longest wait first. The API lists every check-in,
 * newest first with closed ones included; the queue is only the open ones, so closed check-ins
 * are dropped here (from the newest 50).
 */
export const patientQueueQuery = (search: string) =>
  queryOptions({
    queryKey: hospitalAdminKeys.queue(search),
    queryFn: async (): Promise<PatientQueue> => {
      const { items } = await request(checkInPageSchema, {
        url: "/api/hospital-ops/patients-check-ins",
        params: { search: search || undefined, page: 1, size: 50 },
      });
      const now = Date.now();
      return {
        items: items
          .filter(isOpenCheckIn)
          .map((row) => toQueueEntry(row, now))
          .sort((a, b) => b.waitMinutes - a.waitMinutes),
      };
    },
    placeholderData: keepPreviousData,
  });

export const STAFF_PAGE_SIZE = 10;

/** Every staff member matching `search`, a page of 100 at a time. */
async function allStaff(search: string): Promise<StaffMember[]> {
  const members: StaffMember[] = [];
  for (let page = 1; ; page++) {
    const { results, next } = await request(staffPageSchema, {
      url: STAFF_URL,
      params: { search: search || undefined, page, size: 100 },
    });
    members.push(...results.map(toStaffMember));
    if (!next || results.length === 0) return members;
  }
}

/**
 * A page of the team. TODO(api): the staff list can't filter by status or admin access, so the
 * whole team is read and filtered here; "Admins" waits on the API saying who's an admin.
 */
export const staffListQuery = (search: string, page: number, filter: StaffFilter = "all") =>
  queryOptions({
    queryKey: hospitalAdminKeys.staff(search, page, filter),
    queryFn: async (): Promise<StaffList> => {
      if (filter === "admins") throw new NotAvailableYetError("Showing only admins");
      const [members, staff, { administrators }] = await Promise.all([
        allStaff(search),
        countStaff(),
        administrationMetrics(),
      ]);
      const matching = filter === "all" ? members : members.filter((m) => m.status === filter);
      return {
        total: matching.length,
        summary: { staff, admins: administrators },
        page,
        pageSize: STAFF_PAGE_SIZE,
        items: matching.slice((page - 1) * STAFF_PAGE_SIZE, page * STAFF_PAGE_SIZE),
      };
    },
    placeholderData: keepPreviousData,
  });

/**
 * One staff member's profile and their activity in `period` (a 404 for someone this admin can't
 * see). Their phone number and team status are only in the staff list, so that's read too.
 */
export const staffDetailQuery = (id: string, period: Period) =>
  queryOptions({
    queryKey: hospitalAdminKeys.staffMember(id, period),
    queryFn: async (): Promise<StaffDetail> => {
      const [detail, team] = await Promise.all([
        request(staffDetailSchema, {
          url: `/api/hospital-ops/staff/${encodeURIComponent(id)}`,
          params: { period: apiPeriod[period] },
        }),
        allStaff(""),
      ]);
      return toStaffDetail(
        detail,
        team.find((member) => member.id === id),
      );
    },
  });

/** Check-in numbers for `period`. */
export const patientStatsQuery = (period: Period) =>
  queryOptions({
    queryKey: hospitalAdminKeys.patientStats(period),
    queryFn: () =>
      request(patientManagementMetricsSchema, {
        url: "/api/hospital-ops/patient-management/metrics",
        params: { period: apiPeriod[period] },
      }),
  });

export const PATIENTS_PAGE_SIZE = 6;

/** The filters the patient lists can't apply yet, and what to call them. TODO(api). */
function unsupportedFilter(params: PatientListParams) {
  if (params.ward !== "all") return "Filtering patients by ward";
  if (params.doctor !== "all") return "Filtering patients by doctor";
  if (params.visitType !== "all") return "Filtering patients by visit type";
  if (params.sort !== "latest") return "Sorting patients";
  return null;
}

/** The date filter as the API's `period`; each list filters on its own date. */
const datePeriod = {
  anytime: undefined,
  today: "day",
  week: "week",
  month: "month",
} as const satisfies Record<PatientListParams["date"], string | undefined>;

const tabs = Object.keys(patientTabLabels) as PatientTab[];

/** A page of one tab's patients, and every tab's count. */
export const patientListQuery = (params: PatientListParams) =>
  queryOptions({
    queryKey: hospitalAdminKeys.patients(params),
    queryFn: async (): Promise<PatientList> => {
      const unsupported = unsupportedFilter(params);
      if (unsupported) throw new NotAvailableYetError(unsupported);
      const [page, ...counts] = await Promise.all([
        request(patientPageSchema, {
          url: PATIENTS_URL,
          params: {
            status: patientStatusOfTab[params.tab],
            period: datePeriod[params.date],
            search: params.search || undefined,
            page: params.page,
            size: PATIENTS_PAGE_SIZE,
          },
        }),
        ...tabs.map((tab) =>
          request(countOnlySchema, {
            url: PATIENTS_URL,
            params: { status: patientStatusOfTab[tab], page: 1, size: 1 },
          }),
        ),
      ]);
      const now = Date.now();
      return {
        total: page.count,
        counts: {
          admitted: counts[0] ?? 0,
          checked_in: counts[1] ?? 0,
          checked_out: counts[2] ?? 0,
          discharged: counts[3] ?? 0,
        },
        page: params.page,
        pageSize: PATIENTS_PAGE_SIZE,
        items: page.results.map((row) => toPatientVisit(params.tab, row, now)),
      };
    },
    placeholderData: keepPreviousData,
  });

/** The hospital's wards and doctors, for the filters. */
export const patientFilterOptionsQuery = () =>
  queryOptions({
    queryKey: hospitalAdminKeys.patientFilterOptions(),
    queryFn: async (): Promise<PatientFilterOptions> => {
      const [wards, doctors] = await Promise.all([
        // The admin's own list; the staff one (`/wards`) may refuse admins.
        request(wardPageSchema, { url: WARDS_URL, params: { page: 1, size: 100 } }),
        request(staffPageSchema, {
          url: STAFF_URL,
          params: { role: "doctor", page: 1, size: 100 },
        }),
      ]);
      return {
        wards: wards.results.map(({ sqid, name }) => ({ id: sqid, name })),
        doctors: doctors.results.map(({ id, name }) => ({ id, name: `Dr. ${name}` })),
      };
    },
  });

/** How many of a patient's visits, and of their guardians or dependants, the profile reads. */
const PROFILE_LIST_SIZE = 100;

/**
 * A patient's profile, with their visits at this hospital and their guardians or dependants;
 * `id` is their HIN.
 */
export const patientDetailQuery = (id: string) =>
  queryOptions({
    queryKey: hospitalAdminKeys.patient(id),
    queryFn: async (): Promise<PatientDetail> => {
      const url = `/api/patients/${encodeURIComponent(id)}`;
      const list = { page: 1, size: PROFILE_LIST_SIZE };
      const [record, metrics, linked, visits] = await Promise.all([
        request(patientInfoSchema, { url: `${url}/info` }),
        request(visitMetricsSchema, { url: `${url}/visit-metrics` }),
        request(guardianshipPageSchema, { url: `${url}/guardianship`, params: list }),
        request(visitTimelinePageSchema, { url: `${url}/visits`, params: list }),
      ]);
      return toPatientDetail(record, metrics, linked.items, visits.items);
    },
  });

export const WARDS_PAGE_SIZE = 12;

/** A page of the hospital's wards, with their beds. */
export const wardListQuery = (page: number) =>
  queryOptions({
    queryKey: hospitalAdminKeys.wards(page),
    queryFn: async (): Promise<WardList> => {
      const { count, results } = await request(wardManagePageSchema, {
        url: WARDS_URL,
        params: { page, size: WARDS_PAGE_SIZE },
      });
      return { total: count, items: results };
    },
    placeholderData: keepPreviousData,
  });

/** One ward's beds as they are now, for its Manage dialog. */
export const wardBedsQuery = (id: string) =>
  queryOptions({
    queryKey: hospitalAdminKeys.wardBeds(id),
    queryFn: () =>
      request(wardBedsSchema, { url: `/api/hospital-ops/wards/${encodeURIComponent(id)}/beds` }),
  });

/** The hospital's plan and the plans it can choose. */
export const subscriptionQuery = () =>
  queryOptions({
    queryKey: hospitalAdminKeys.subscription(),
    queryFn: async () => {
      const [current, plans] = await Promise.all([
        request(facilitySubscriptionSchema, { url: "/api/auth/facility" }),
        request(subscriptionPlansSchema, { url: "/api/payments/plans/role/hospital" }),
      ]);
      return { current, plans };
    },
  });
