import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { request } from "@/lib/api";
import { NotAvailableYetError } from "@/lib/not-available";
import { type Period } from "@/lib/period";
import { staffRoleLabels, type StaffRole } from "@/lib/staff-profile";
import {
  countOnlySchema,
  facilitySubscriptionSchema,
  type DashboardOverview,
  hospitalProfileSchema,
  type PatientDetail,
  type PatientFilterOptions,
  patientInfoSchema,
  type PatientList,
  type PatientListParams,
  patientPageSchema,
  type PatientQueue,
  type PatientStats,
  patientStatusOfTab,
  type PatientTab,
  patientTabLabels,
  type StaffDetail,
  type StaffFilter,
  type StaffList,
  type StaffMember,
  staffPageSchema,
  subscriptionPlansSchema,
  toPatientDetail,
  toPatientVisit,
  toQueueEntry,
  toStaffDetail,
  toStaffMember,
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

/** How many staff match `params`, e.g. one role. */
const countStaff = (params: Record<string, string> = {}) =>
  request(countOnlySchema, { url: STAFF_URL, params: { ...params, page: 1, size: 1 } });

/**
 * The overview's numbers: the team's size and its split by role. TODO(api): nothing says when
 * staff joined, who's an admin or how many facilities the hospital has, so those are null.
 */
export const dashboardOverviewQuery = (period: Period) =>
  queryOptions({
    queryKey: hospitalAdminKeys.overview(period),
    queryFn: async (): Promise<DashboardOverview> => {
      const roles = Object.keys(staffRoleLabels) as StaffRole[];
      const [totalStaff, ...byRole] = await Promise.all([
        countStaff(),
        ...roles.map((role) => countStaff({ role })),
      ]);
      return {
        stats: {
          totalStaff,
          addedThisMonth: null,
          addedLastMonth: null,
          administrators: null,
          facilities: null,
        },
        staffByRole: roles.map((role, index) => ({ role, count: byRole[index] ?? 0 })),
      };
    },
  });

// Searches keep showing the previous results until the new ones arrive.

/**
 * Patients checked in and not yet checked out, longest wait first. TODO(api): "outpatient"
 * includes patients already with the nurse or doctor.
 */
export const patientQueueQuery = (search: string) =>
  queryOptions({
    queryKey: hospitalAdminKeys.queue(search),
    queryFn: async (): Promise<PatientQueue> => {
      const { results } = await request(patientPageSchema, {
        url: PATIENTS_URL,
        params: { status: "outpatient", search: search || undefined, page: 1, size: 50 },
      });
      const now = Date.now();
      return {
        items: results
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
      const [members, staff] = await Promise.all([allStaff(search), countStaff()]);
      const matching = filter === "all" ? members : members.filter((m) => m.status === filter);
      return {
        total: matching.length,
        summary: { staff, admins: null },
        page,
        pageSize: STAFF_PAGE_SIZE,
        items: matching.slice((page - 1) * STAFF_PAGE_SIZE, page * STAFF_PAGE_SIZE),
      };
    },
    placeholderData: keepPreviousData,
  });

/** A staff member the API doesn't have (or this admin can't see). */
class StaffNotFoundError extends Error {
  constructor(id: string) {
    super(`Staff member ${id} not found`);
    this.name = "StaffNotFoundError";
  }
}

/**
 * One staff member's profile. TODO(api): there's no endpoint for one member, so this finds them
 * in the team list; their activity, access and other details wait on the API.
 */
export const staffDetailQuery = (id: string, period: Period) =>
  queryOptions({
    queryKey: hospitalAdminKeys.staffMember(id, period),
    queryFn: async (): Promise<StaffDetail> => {
      const member = (await allStaff("")).find((candidate) => candidate.id === id);
      if (!member) throw new StaffNotFoundError(id);
      return toStaffDetail(member);
    },
  });

/** Check-in numbers. TODO(api): no endpoint has them yet, so every figure is null. */
export const patientStatsQuery = (period: Period) =>
  queryOptions({
    queryKey: hospitalAdminKeys.patientStats(period),
    queryFn: (): PatientStats => ({
      totalCheckIns: null,
      newCheckIns: null,
      newCheckInsChange: null,
      checkInsThisMonth: null,
      checkInsThisMonthChange: null,
      returningPatients: null,
    }),
  });

export const PATIENTS_PAGE_SIZE = 6;

/** The filters the patient lists can't apply yet, and what to call them. TODO(api). */
function unsupportedFilter(params: PatientListParams) {
  if (params.ward !== "all") return "Filtering patients by ward";
  if (params.doctor !== "all") return "Filtering patients by doctor";
  if (params.visitType !== "all") return "Filtering patients by visit type";
  if (params.date !== "anytime") return "Filtering patients by date";
  if (params.sort !== "latest") return "Sorting patients";
  return null;
}

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

/** A patient's profile; `id` is their HIN. */
export const patientDetailQuery = (id: string) =>
  queryOptions({
    queryKey: hospitalAdminKeys.patient(id),
    queryFn: async (): Promise<PatientDetail> =>
      toPatientDetail(
        await request(patientInfoSchema, { url: `/api/patients/${encodeURIComponent(id)}/info` }),
      ),
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
