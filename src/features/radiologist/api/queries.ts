import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { request } from "@/lib/api";
import type { Period } from "@/lib/period";
import {
  radiologistProfileSchema,
  radiologyOverviewSchema,
  recentUploadsSchema,
  type ScanRecordParams,
  scanOrderSchema,
  scanRecordListSchema,
  scanScheduleSchema,
} from "@/features/radiologist/api/schemas";

// TODO(api): endpoint paths and shapes are provisional until the v2 hospital API is defined;
// src/mocks/radiologist.ts fakes them.

export const radiologistKeys = {
  all: ["radiologist"] as const,
  profile: () => [...radiologistKeys.all, "profile"] as const,
  overview: (period: Period) => [...radiologistKeys.all, "overview", period] as const,
  schedule: (period: Period) => [...radiologistKeys.all, "schedule", period] as const,
  uploads: (period: Period) => [...radiologistKeys.all, "uploads", period] as const,
  scanRecords: (params: ScanRecordParams) =>
    [...radiologistKeys.all, "scan-records", params] as const,
  scanOrder: (id: string) => [...radiologistKeys.all, "scan-order", id] as const,
};

export const radiologistProfileQuery = () =>
  queryOptions({
    queryKey: radiologistKeys.profile(),
    queryFn: () => request(radiologistProfileSchema, { url: "/hospital/radiology/profile" }),
  });

export const radiologyOverviewQuery = (period: Period) =>
  queryOptions({
    queryKey: radiologistKeys.overview(period),
    queryFn: () =>
      request(radiologyOverviewSchema, {
        url: "/hospital/radiology/overview",
        params: { period },
      }),
  });

// The cards keep showing what they had until the next period's rows arrive.

export const scanScheduleQuery = (period: Period) =>
  queryOptions({
    queryKey: radiologistKeys.schedule(period),
    queryFn: () =>
      request(scanScheduleSchema, { url: "/hospital/radiology/schedule", params: { period } }),
    placeholderData: keepPreviousData,
  });

export const recentUploadsQuery = (period: Period) =>
  queryOptions({
    queryKey: radiologistKeys.uploads(period),
    queryFn: () =>
      request(recentUploadsSchema, { url: "/hospital/radiology/uploads", params: { period } }),
    placeholderData: keepPreviousData,
  });

/** Rows per page in the table and cards per page in the grid (two rows of three). */
export const SCAN_RECORDS_PAGE_SIZES = { list: 8, grid: 6 } as const;
/** The Scan Orders page fits one row fewer in its table. */
export const SCAN_ORDERS_PAGE_SIZES = { list: 7, grid: 6 } as const;

export const scanRecordListQuery = (params: ScanRecordParams) =>
  queryOptions({
    queryKey: radiologistKeys.scanRecords(params),
    queryFn: () =>
      request(scanRecordListSchema, {
        url: "/hospital/radiology/scan-orders",
        params,
      }),
    placeholderData: keepPreviousData,
  });

export const scanOrderQuery = (id: string) =>
  queryOptions({
    queryKey: radiologistKeys.scanOrder(id),
    queryFn: () =>
      request(scanOrderSchema, {
        url: `/hospital/radiology/scan-orders/${encodeURIComponent(id)}`,
      }),
  });
