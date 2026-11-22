import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { request } from "@/lib/api";
import {
  type AdmissionRequestList,
  admissionRequestPageSchema,
  type AdmissionStatus,
  admissionStatusLabels,
  countOnlySchema,
} from "@/features/admissions/api/schemas";

export const admissionKeys = {
  all: ["admissions"] as const,
  requests: (status: AdmissionStatus, search: string, page: number) =>
    [...admissionKeys.all, "requests", status, search, page] as const,
};

const REQUESTS_URL = "/api/hospital-ops/admissions/requests";
export const ADMISSIONS_PAGE_SIZE = 10;

const statuses = Object.keys(admissionStatusLabels) as AdmissionStatus[];

/** A page of one tab's requests (newest first, as the API sends them), and every tab's count. */
export const admissionRequestsQuery = (status: AdmissionStatus, search: string, page: number) =>
  queryOptions({
    queryKey: admissionKeys.requests(status, search, page),
    queryFn: async (): Promise<AdmissionRequestList> => {
      const [list, ...counts] = await Promise.all([
        request(admissionRequestPageSchema, {
          url: REQUESTS_URL,
          params: { status, search: search || undefined, page, size: ADMISSIONS_PAGE_SIZE },
        }),
        ...statuses.map((tab) =>
          request(countOnlySchema, {
            url: REQUESTS_URL,
            params: { status: tab, page: 1, size: 1 },
          }),
        ),
      ]);
      return {
        total: list.count,
        counts: { pending: counts[0] ?? 0, accepted: counts[1] ?? 0, rejected: counts[2] ?? 0 },
        items: list.results,
      };
    },
    placeholderData: keepPreviousData,
  });
