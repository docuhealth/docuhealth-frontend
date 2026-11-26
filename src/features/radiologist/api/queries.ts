import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { request } from "@/lib/api";
import type { Period } from "@/lib/period";
import {
  appointmentPageSchema,
  countOnlySchema,
  type RadiologyOverview,
  type RecentUploads,
  radiologistProfileSchema,
  radiologyPatientsSchema,
  recentRadiologyPatientPageSchema,
  scanActivitySchema,
  type ScanOrder,
  type ScanRecordList,
  type ScanRecordParams,
  type ScanSchedule,
  type ScanStage,
  scanOrderItemPageSchema,
  statusOfStage,
  toScanRecord,
  uploadStatusOfResult,
} from "@/features/radiologist/api/schemas";

// The radiologist's dashboard on the real API (docs/api/openapi.json). Where the API has no
// filter or field yet, it's marked TODO(api); see docs/backend-gaps-v2-migration.md, section 7.

export const radiologistKeys = {
  all: ["radiologist"] as const,
  profile: () => [...radiologistKeys.all, "profile"] as const,
  overview: (period: Period) => [...radiologistKeys.all, "overview", period] as const,
  schedule: (period: Period) => [...radiologistKeys.all, "schedule", period] as const,
  uploads: (period: Period) => [...radiologistKeys.all, "uploads", period] as const,
  scanRecords: (params: ScanRecordParams) =>
    [...radiologistKeys.all, "scan-records", params] as const,
  scanOrder: (id: string) => [...radiologistKeys.all, "scan-order", id] as const,
  patientLookup: (hin: string) => [...radiologistKeys.all, "patient-lookup", hin] as const,
};

const ITEMS_URL = "/api/radiology/orders/items";
const stages = Object.keys(statusOfStage) as ScanStage[];

export const radiologistProfileQuery = () =>
  queryOptions({
    queryKey: radiologistKeys.profile(),
    queryFn: () => request(radiologistProfileSchema, { url: "/api/auth/staff/profile" }),
  });

/** How many scan orders are at `stage` (every one, whatever the search). */
function countAt(stage: ScanStage) {
  return request(countOnlySchema, {
    url: ITEMS_URL,
    params: { status: statusOfStage[stage], page: 1, size: 1 },
  });
}

async function countAll() {
  const [pending, inProgress, completed, rejected] = await Promise.all(stages.map(countAt));
  return {
    pending: pending ?? 0,
    in_progress: inProgress ?? 0,
    completed: completed ?? 0,
    rejected: rejected ?? 0,
  };
}

/**
 * The overview's numbers, counted from each tab. For "This Month", completed scans are the
 * month's from the activity chart. TODO(api): the items can't be filtered by date, so the rest
 * are every order so far, whatever `period` says.
 */
export const radiologyOverviewQuery = (period: Period) =>
  queryOptions({
    queryKey: radiologistKeys.overview(period),
    queryFn: async (): Promise<RadiologyOverview> => {
      const [counts, monthly] = await Promise.all([
        countAll(),
        period === "month"
          ? request(scanActivitySchema, { url: "/api/radiology/activity-chart-data" })
          : null,
      ]);
      return {
        imagingRequests: counts.pending + counts.in_progress + counts.completed + counts.rejected,
        pendingOrders: counts.pending,
        completedScans: monthly ? (monthly[new Date().getMonth()] ?? 0) : counts.completed,
        completedScansSpan: monthly ? "month" : "all",
        scansInProgress: counts.in_progress,
      };
    },
  });

/** How many days ahead each period reaches. */
const periodDays = { today: 0, week: 7, month: 31 } as const satisfies Record<Period, number>;

// The cards keep showing what they had until the next period's rows arrive.

/**
 * The radiologist's appointments from now to the end of `period`, soonest first. The API wants a
 * `timeframe`, so it's today's plus (for a week or month) the upcoming ones up to then.
 */
export const scanScheduleQuery = (period: Period) =>
  queryOptions({
    queryKey: radiologistKeys.schedule(period),
    queryFn: async (): Promise<ScanSchedule> => {
      const until = new Date();
      until.setDate(until.getDate() + periodDays[period]);
      until.setHours(23, 59, 59, 999);
      const page = (timeframe: "today" | "upcoming") =>
        request(appointmentPageSchema, {
          url: "/api/hospital-ops/appointments/staff",
          params: {
            timeframe,
            page: 1,
            size: 20,
            ...(timeframe === "upcoming" && { scheduled_time_lte: until.toISOString() }),
          },
        });
      const pages = await Promise.all(
        period === "today" ? [page("today")] : [page("today"), page("upcoming")],
      );
      const items = pages
        .flatMap(({ items }) => items)
        .filter(({ at }) => new Date(at) >= startOfToday());
      return { items: items.sort((a, b) => a.at.localeCompare(b.at)) };
    },
    placeholderData: keepPreviousData,
  });

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/** How far back each period reaches, for the uploads card. */
const periodBack = { today: 1, week: 7, month: 31 } as const satisfies Record<Period, number>;

/** The latest completed scans, for their scan type and report status. */
async function latestCompleted() {
  const { results } = await request(scanOrderItemPageSchema, {
    url: ITEMS_URL,
    params: { status: "completed", page: 1, size: 50 },
  });
  return results.flatMap((item) => (item.result ? [{ ...item, result: item.result }] : []));
}

const uploadStatusOf = (item: { resultStatus: string | null }) =>
  uploadStatusOfResult[item.resultStatus ?? ""] ?? "processing";

/**
 * Reports uploaded in `period`, newest first, with their review status. "Today" is the patients
 * whose result went up in the last 24 hours, each with their latest report's scan and status
 * (found among the latest completed scans). TODO(api): for a week or month there's no date filter
 * or upload ordering on the items, so it reads the latest completed scans and keeps those in the
 * period.
 */
export const recentUploadsQuery = (period: Period) =>
  queryOptions({
    queryKey: radiologistKeys.uploads(period),
    queryFn: async (): Promise<RecentUploads> => {
      if (period === "today") {
        const [patients, completed] = await Promise.all([
          request(recentRadiologyPatientPageSchema, {
            url: "/api/radiology/patients/recents",
            params: { page: 1, size: 50 },
          }),
          latestCompleted(),
        ]);
        return {
          items: patients.map((patient) => {
            const latest = completed
              .filter((item) => item.patient.hin === patient.hin)
              .sort((a, b) => b.result.uploadedAt.localeCompare(a.result.uploadedAt))[0];
            return {
              id: latest?.id ?? `patient-${patient.hin}`,
              uploadedAt: patient.scannedAt,
              patient: { id: patient.hin, name: patient.name },
              scanType: latest?.scanType ?? "Scan result",
              status: latest ? uploadStatusOf(latest) : null,
            };
          }),
        };
      }
      const since = Date.now() - periodBack[period] * 24 * 60 * 60_000;
      const items = (await latestCompleted()).flatMap((item) =>
        new Date(item.result.uploadedAt).getTime() >= since
          ? [
              {
                id: item.id,
                uploadedAt: item.result.uploadedAt,
                patient: { id: item.patient.id, name: item.patient.name },
                scanType: item.scanType,
                status: uploadStatusOf(item),
              },
            ]
          : [],
      );
      return { items: items.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)) };
    },
    placeholderData: keepPreviousData,
  });

/** Rows per page in the table and cards per page in the grid (two rows of three). */
export const SCAN_RECORDS_PAGE_SIZES = { list: 8, grid: 6 } as const;
/** The Scan Orders page fits one row fewer in its table. */
export const SCAN_ORDERS_PAGE_SIZES = { list: 7, grid: 6 } as const;

/**
 * One page of a tab's scan orders, and every tab's count. TODO(api): `sort` only orders the page
 * it's given and `period` isn't applied, since the items have no ordering or date filters.
 */
export const scanRecordListQuery = (params: ScanRecordParams) =>
  queryOptions({
    queryKey: radiologistKeys.scanRecords(params),
    queryFn: async (): Promise<ScanRecordList> => {
      const [page, counts] = await Promise.all([
        request(scanOrderItemPageSchema, {
          url: ITEMS_URL,
          params: {
            status: statusOfStage[params.stage],
            search: params.search || undefined,
            page: params.page,
            size: params.pageSize,
          },
        }),
        countAll(),
      ]);
      const direction = params.sort === "oldest" ? 1 : -1;
      return {
        counts,
        total: page.count,
        items: page.results
          .map(toScanRecord)
          .sort((a, b) => a.requestedAt.localeCompare(b.requestedAt) * direction),
      };
    },
    placeholderData: keepPreviousData,
  });

/**
 * Patients with this HIN (digits only), to book a scan appointment for. TODO(api): radiologists
 * can't look a HIN up, and their patient list ignores filters, so this searches the patients who
 * already have radiology orders here.
 */
export const patientLookupQuery = (hin: string) =>
  queryOptions({
    queryKey: radiologistKeys.patientLookup(hin),
    queryFn: async () => {
      const patients = await request(radiologyPatientsSchema, {
        url: "/api/radiology/patients",
        params: { page: 1, size: 100 },
      });
      return { items: patients.filter((patient) => patient.hin === hin) };
    },
  });

/** A scan order the API doesn't have (or the radiologist can't see). */
class ScanOrderNotFoundError extends Error {
  constructor(id: string) {
    super(`Scan order ${id} not found`);
    this.name = "ScanOrderNotFoundError";
  }
}

/**
 * One scan order. TODO(api): there's no endpoint for a single item, so this looks through each
 * tab's latest items for it, all four at once.
 */
export const scanOrderQuery = (id: string) =>
  queryOptions({
    queryKey: radiologistKeys.scanOrder(id),
    queryFn: async (): Promise<ScanOrder> => {
      const pages = await Promise.all(
        stages.map((stage) =>
          request(scanOrderItemPageSchema, {
            url: ITEMS_URL,
            params: { status: statusOfStage[stage], page: 1, size: 100 },
          }),
        ),
      );
      const found = pages.flatMap(({ results }) => results).find((item) => item.id === id);
      if (!found) throw new ScanOrderNotFoundError(id);
      return found;
    },
  });
