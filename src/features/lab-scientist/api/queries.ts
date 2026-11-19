import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { request } from "@/lib/api";
import type { Period } from "@/lib/period";
import {
  labOverviewSchema,
  labProfileSchema,
  patientLookupSchema,
  pendingApprovalsSchema,
  testAppointmentsSchema,
  type TestRecordParams,
  testOrderSchema,
  testRecordListSchema,
} from "@/features/lab-scientist/api/schemas";

// TODO(api): endpoint paths and shapes are provisional until the v2 hospital API is defined;
// src/mocks/lab-scientist.ts fakes them.

export const labKeys = {
  all: ["lab-scientist"] as const,
  profile: () => [...labKeys.all, "profile"] as const,
  overview: (period: Period) => [...labKeys.all, "overview", period] as const,
  appointments: (period: Period) => [...labKeys.all, "appointments", period] as const,
  approvals: () => [...labKeys.all, "approvals"] as const,
  testRecords: (params: TestRecordParams) => [...labKeys.all, "test-records", params] as const,
  testOrder: (id: string) => [...labKeys.all, "test-order", id] as const,
  patientLookup: (hin: string) => [...labKeys.all, "patient-lookup", hin] as const,
};

export const testOrderQuery = (id: string) =>
  queryOptions({
    queryKey: labKeys.testOrder(id),
    queryFn: () =>
      request(testOrderSchema, { url: `/hospital/lab/test-orders/${encodeURIComponent(id)}` }),
  });

export const labProfileQuery = () =>
  queryOptions({
    queryKey: labKeys.profile(),
    queryFn: () => request(labProfileSchema, { url: "/hospital/lab/profile" }),
  });

export const labOverviewQuery = (period: Period) =>
  queryOptions({
    queryKey: labKeys.overview(period),
    queryFn: () =>
      request(labOverviewSchema, { url: "/hospital/lab/overview", params: { period } }),
  });

/** The card keeps showing what it had until the next period's rows arrive. */
export const testAppointmentsQuery = (period: Period) =>
  queryOptions({
    queryKey: labKeys.appointments(period),
    queryFn: () =>
      request(testAppointmentsSchema, { url: "/hospital/lab/appointments", params: { period } }),
    placeholderData: keepPreviousData,
  });

export const pendingApprovalsQuery = () =>
  queryOptions({
    queryKey: labKeys.approvals(),
    queryFn: () => request(pendingApprovalsSchema, { url: "/hospital/lab/approvals" }),
  });

/** Rows per page in the table and cards per page in the grid (two rows of three). */
export const TEST_RECORDS_PAGE_SIZES = { list: 7, grid: 6 } as const;

export const testRecordListQuery = (params: TestRecordParams) =>
  queryOptions({
    queryKey: labKeys.testRecords(params),
    queryFn: () => request(testRecordListSchema, { url: "/hospital/lab/test-orders", params }),
    placeholderData: keepPreviousData,
  });

/** Patients with this HIN (digits only), to book a test appointment for. */
export const patientLookupQuery = (hin: string) =>
  queryOptions({
    queryKey: labKeys.patientLookup(hin),
    queryFn: () => request(patientLookupSchema, { url: "/hospital/lab/patients", params: { hin } }),
  });
