import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { request } from "@/lib/api";
import {
  type AdmissionPage,
  admissionPageSchema,
  countOnlySchema,
  type QueuePage,
  queuePageSchema,
  type QueueTab,
  queueTabLabels,
  type VitalsRequestPage,
  vitalsRequestPageSchema,
} from "@/features/nurse/api/schemas";

// The nurse's front line on the real API (docs/api/openapi.json). TODO(api) marks workarounds;
// see docs/backend-gaps-v2-migration.md.

export const nurseKeys = {
  all: ["nurse"] as const,
  queue: (tab: QueueTab, page: number) => [...nurseKeys.all, "queue", tab, page] as const,
  vitalsRequests: (search: string, page: number) =>
    [...nurseKeys.all, "vitals-requests", search, page] as const,
  admissions: (page: number) => [...nurseKeys.all, "admissions", page] as const,
};

const QUEUE_URL = "/api/hospital-ops/check-ins/nurse-queue";
const tabs = Object.keys(queueTabLabels) as QueueTab[];

/** How often the queue checks for new arrivals, as v1 did. */
const QUEUE_REFRESH = 30_000;

export const QUEUE_PAGE_SIZE = 10;

/** A page of one tab of the check-in queue, and every tab's count; it refreshes itself. */
export const nurseQueueQuery = (tab: QueueTab, page: number) =>
  queryOptions({
    queryKey: nurseKeys.queue(tab, page),
    queryFn: async (): Promise<QueuePage> => {
      const [list, ...counts] = await Promise.all([
        request(queuePageSchema, {
          url: QUEUE_URL,
          params: { status: tab, page, size: QUEUE_PAGE_SIZE },
        }),
        ...tabs.map((status) =>
          request(countOnlySchema, { url: QUEUE_URL, params: { status, page: 1, size: 1 } }),
        ),
      ]);
      return {
        total: list.count,
        counts: {
          pending: counts[0] ?? 0,
          sent_to_doctor: counts[1] ?? 0,
          closed: counts[2] ?? 0,
        },
        // Longest wait first for pending; most recent first for the rest.
        items:
          tab === "pending"
            ? list.results.sort((a, b) => a.checkedInAt.localeCompare(b.checkedInAt))
            : list.results.sort((a, b) =>
                (b.sentToDoctorAt ?? b.closedAt ?? b.checkedInAt).localeCompare(
                  a.sentToDoctorAt ?? a.closedAt ?? a.checkedInAt,
                ),
              ),
      };
    },
    placeholderData: keepPreviousData,
    refetchInterval: QUEUE_REFRESH,
  });

export const VITALS_REQUESTS_PAGE_SIZE = 6;

/** Doctors' vitals requests still waiting, oldest first. */
export const vitalsRequestsQuery = (search: string, page: number) =>
  queryOptions({
    queryKey: nurseKeys.vitalsRequests(search, page),
    queryFn: async (): Promise<VitalsRequestPage> => {
      const { count, results } = await request(vitalsRequestPageSchema, {
        url: "/api/records/vital-signs/requests/pending",
        params: { search: search || undefined, page, size: VITALS_REQUESTS_PAGE_SIZE },
      });
      return { total: count, items: results };
    },
    placeholderData: keepPreviousData,
    refetchInterval: QUEUE_REFRESH,
  });

export const ADMISSIONS_PAGE_SIZE = 6;

/** Patients admitted now, newest first. */
export const admissionsQuery = (page: number) =>
  queryOptions({
    queryKey: nurseKeys.admissions(page),
    queryFn: async (): Promise<AdmissionPage> => {
      const { count, results } = await request(admissionPageSchema, {
        url: "/api/hospital-ops/admissions",
        params: { page, size: ADMISSIONS_PAGE_SIZE },
      });
      return {
        total: count,
        items: results.sort((a, b) => b.admittedAt.localeCompare(a.admittedAt)),
      };
    },
    placeholderData: keepPreviousData,
  });
