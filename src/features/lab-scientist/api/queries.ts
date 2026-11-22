import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { request } from "@/lib/api";
import type { Period } from "@/lib/period";
import {
  appointmentPageSchema,
  type FoundPatient,
  labDashboardSchema,
  labOrderPageSchema,
  labOrderSchema,
  labProfileSchema,
  type PendingApprovals,
  type TestAppointments,
  type TestRecordList,
  type TestRecordParams,
  type TestStage,
  testStageLabels,
  toTestRecord,
} from "@/features/lab-scientist/api/schemas";

// The lab dashboard on the real API (docs/api/openapi.json). Where the API has no filter or field
// yet, it's marked TODO(api); see docs/backend-gaps-v2-migration.md, section 7.

export const labKeys = {
  all: ["lab-scientist"] as const,
  profile: () => [...labKeys.all, "profile"] as const,
  overview: (period: Period) => [...labKeys.all, "overview", period] as const,
  appointments: (period: Period) => [...labKeys.all, "appointments", period] as const,
  orders: () => [...labKeys.all, "orders"] as const,
  testOrder: (id: string) => [...labKeys.all, "test-order", id] as const,
};

export const labProfileQuery = () =>
  queryOptions({
    queryKey: labKeys.profile(),
    queryFn: () => request(labProfileSchema, { url: "/api/auth/staff/profile" }),
  });

/**
 * The overview's numbers (tests, not orders). TODO(api): the dashboard has no approved-results
 * or returning-patients figure and ignores dates, so `period` doesn't change it yet.
 */
export const labOverviewQuery = (period: Period) =>
  queryOptions({
    queryKey: labKeys.overview(period),
    queryFn: () => request(labDashboardSchema, { url: "/api/lab/dashboard" }),
  });

/** How many days ahead each period reaches. */
const periodDays = { today: 0, week: 7, month: 31 } as const satisfies Record<Period, number>;

/**
 * The lab's appointments from now to the end of `period`, soonest first. The API wants a
 * `timeframe`, so it's today's plus (for a week or month) the upcoming ones up to then.
 */
export const testAppointmentsQuery = (period: Period) =>
  queryOptions({
    queryKey: labKeys.appointments(period),
    queryFn: async (): Promise<TestAppointments> => {
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
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const items = pages
        .flatMap(({ items }) => items)
        .filter(({ at }) => new Date(at) >= today)
        .sort((a, b) => a.at.localeCompare(b.at));
      return { items };
    },
    placeholderData: keepPreviousData,
  });

/** Every item status the API filters by; an order is listed under each of its tests' statuses. */
const itemStatuses = [
  "pending",
  "sample_collected",
  "in_progress",
  "result_ready",
  "result_accepted_by_lab_admin",
  "result_accepted_by_doctor",
  "rejected",
] as const;

/**
 * Every order the lab can see, each once. TODO(api): the list filters whole orders by any test's
 * status, so the tabs, counts, search and sort are worked out here from all of them.
 */
const allOrdersQuery = () =>
  queryOptions({
    queryKey: labKeys.orders(),
    queryFn: async () => {
      const pages = await Promise.all(
        itemStatuses.map((status) =>
          request(labOrderPageSchema, {
            url: "/api/lab/test-orders",
            params: { status, page: 1, size: 100, ordering: "-created_at" },
          }),
        ),
      );
      const byId = new Map(
        pages.flatMap(({ results }) => results).map((entry) => [entry.order.id, entry]),
      );
      return [...byId.values()].sort((a, b) =>
        b.order.requestedAt.localeCompare(a.order.requestedAt),
      );
    },
  });

/** Results waiting for the lab admin's approval, newest first. */
export const pendingApprovalsQuery = () =>
  queryOptions({
    ...allOrdersQuery(),
    select: (entries): PendingApprovals => ({
      items: entries
        .flatMap(({ order, awaitingApproval }) =>
          awaitingApproval.map((test) => ({
            id: order.id,
            testType: test.name,
            patient: { id: order.patient.id, name: order.patient.name },
            enteredAt: test.enteredAt,
          })),
        )
        .sort((a, b) => b.enteredAt.localeCompare(a.enteredAt)),
    }),
  });

/** Rows per page in the table and cards per page in the grid (two rows of three). */
export const TEST_RECORDS_PAGE_SIZES = { list: 7, grid: 6 } as const;

const stages = Object.keys(testStageLabels) as TestStage[];

/** One page of a tab's orders, and every tab's count. TODO(api): `period` isn't applied. */
export const testRecordListQuery = (params: TestRecordParams) =>
  queryOptions({
    ...allOrdersQuery(),
    select: (entries): TestRecordList => {
      const term = params.search.trim().toLowerCase();
      const records = entries.map(({ order }) => toTestRecord(order));
      const counts = Object.fromEntries(
        stages.map((stage) => [stage, records.filter((record) => record.stage === stage).length]),
      ) as Record<TestStage, number>;
      const matching = records
        .filter(
          (record) =>
            record.stage === params.stage &&
            (!term ||
              [record.patient.name, record.patient.hin, record.testType].some((value) =>
                value.toLowerCase().includes(term),
              )),
        )
        .sort(
          (a, b) =>
            a.requestedAt.localeCompare(b.requestedAt) * (params.sort === "oldest" ? 1 : -1),
        );
      const start = (params.page - 1) * params.pageSize;
      return {
        counts,
        total: matching.length,
        items: matching.slice(start, start + params.pageSize),
      };
    },
  });

/**
 * Patients with this HIN (digits only), to book a test for. TODO(api): lab staff can't look a
 * HIN up, so this searches the patients who already have orders at the lab.
 */
export const patientLookupQuery = (hin: string) =>
  queryOptions({
    ...allOrdersQuery(),
    select: (entries): { items: FoundPatient[] } => {
      const found = entries.find(({ order }) => order.patient.hin === hin)?.order.patient;
      return found
        ? {
            items: [
              {
                id: found.id,
                name: found.name,
                avatarUrl: found.avatarUrl,
                hin: found.hin,
                dateOfBirth: found.dateOfBirth,
                phone: null,
                email: null,
              },
            ],
          }
        : { items: [] };
    },
  });

export const testOrderQuery = (id: string) =>
  queryOptions({
    queryKey: labKeys.testOrder(id),
    queryFn: () =>
      request(labOrderSchema, { url: `/api/lab/test-orders/${encodeURIComponent(id)}` }),
  });
