import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { request } from "@/lib/api";
import {
  countOnlySchema,
  type DoctorQueuePage,
  doctorQueuePageSchema,
  type DoctorQueueTab,
  doctorQueueTabLabels,
  type EncounterNotePage,
  encounterNotePageSchema,
  type LabOrderPage,
  labOrderPageSchema,
  nursePageSchema,
} from "@/features/doctor/api/schemas";

// The doctor's front line on the real API (docs/api/openapi.json). TODO(api) marks workarounds;
// see docs/backend-gaps-v2-migration.md.

export const doctorKeys = {
  all: ["doctor"] as const,
  queue: (tab: DoctorQueueTab, page: number) => [...doctorKeys.all, "queue", tab, page] as const,
  myConsultations: () => [...doctorKeys.all, "my-consultations"] as const,
  notes: (hin: string, page: number) => [...doctorKeys.all, "notes", hin, page] as const,
  labOrders: (hin: string, page: number) => [...doctorKeys.all, "lab-orders", hin, page] as const,
  nurses: () => [...doctorKeys.all, "nurses"] as const,
};

const QUEUE_URL = "/api/hospital-ops/check-ins/doctor-queue";
const tabs = Object.keys(doctorQueueTabLabels) as DoctorQueueTab[];

/** How often the queue checks for new patients, as v1 did. */
const QUEUE_REFRESH = 60_000;

export const DOCTOR_QUEUE_PAGE_SIZE = 10;

/** A page of one tab of the doctors' queue, and every tab's count; it refreshes itself. */
export const doctorQueueQuery = (tab: DoctorQueueTab, page: number) =>
  queryOptions({
    queryKey: doctorKeys.queue(tab, page),
    queryFn: async (): Promise<DoctorQueuePage> => {
      const [list, ...counts] = await Promise.all([
        request(doctorQueuePageSchema, {
          url: QUEUE_URL,
          params: { status: tab, page, size: DOCTOR_QUEUE_PAGE_SIZE },
        }),
        ...tabs.map((status) =>
          request(countOnlySchema, { url: QUEUE_URL, params: { status, page: 1, size: 1 } }),
        ),
      ]);
      return {
        total: list.count,
        counts: {
          doctor_idle: counts[0] ?? 0,
          doctor_active: counts[1] ?? 0,
          doctor_seen: counts[2] ?? 0,
        },
        // Longest wait first while waiting; most recent first after.
        items: list.results.sort((a, b) =>
          tab === "doctor_idle"
            ? (a.sentAt ?? a.checkedInAt).localeCompare(b.sentAt ?? b.checkedInAt)
            : (b.sentAt ?? b.checkedInAt).localeCompare(a.sentAt ?? a.checkedInAt),
        ),
      };
    },
    placeholderData: keepPreviousData,
    refetchInterval: QUEUE_REFRESH,
  });

/**
 * The check-ins this doctor is in consultation with: only they may write notes and orders on
 * them. TODO(api): there's no "mine" filter, so this reads the active list and picks theirs.
 */
export const myConsultationsQuery = (myId: string) =>
  queryOptions({
    queryKey: [...doctorKeys.myConsultations(), myId],
    queryFn: async (): Promise<Set<string>> => {
      const { results } = await request(doctorQueuePageSchema, {
        url: QUEUE_URL,
        params: { status: "doctor_active", page: 1, size: 100 },
      });
      return new Set(results.filter(({ claimedBy }) => claimedBy?.id === myId).map(({ id }) => id));
    },
  });

export const NOTES_PAGE_SIZE = 5;

/** The patient's encounter notes, newest first. */
export const encounterNotesQuery = (hin: string, page: number) =>
  queryOptions({
    queryKey: doctorKeys.notes(hin, page),
    queryFn: async (): Promise<EncounterNotePage> => {
      const { count, results } = await request(encounterNotePageSchema, {
        url: `/api/records/patients/${encodeURIComponent(hin)}/soap-notes`,
        params: { ordering: "-created_at", page, size: NOTES_PAGE_SIZE },
      });
      return { total: count, items: results };
    },
    placeholderData: keepPreviousData,
  });

export const LAB_ORDERS_PAGE_SIZE = 5;

/** The patient's lab orders at this hospital, newest first, with results once they're in. */
export const labOrdersQuery = (hin: string, page: number) =>
  queryOptions({
    queryKey: doctorKeys.labOrders(hin, page),
    queryFn: async (): Promise<LabOrderPage> => {
      const { count, results } = await request(labOrderPageSchema, {
        url: `/api/lab/patients/${encodeURIComponent(hin)}/test-orders`,
        params: { ordering: "-created_at", page, size: LAB_ORDERS_PAGE_SIZE },
      });
      return { total: count, items: results };
    },
    placeholderData: keepPreviousData,
  });

/** The hospital's nurses, to send a vitals request to one of them. */
export const nursesQuery = () =>
  queryOptions({
    queryKey: doctorKeys.nurses(),
    queryFn: () =>
      request(nursePageSchema, { url: "/api/auth/staff", params: { role: "nurse", size: 100 } }),
  });
