import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { request } from "@/lib/api";
import {
  clinicalProfileSchema,
  patientInfoSchema,
  type Visit,
  type VisitList,
  type VisitPage,
  visitPageSchema,
  visitRecordPageSchema,
} from "@/features/clinical/api/schemas";

// The doctor's and nurse's shared reads on the real API (docs/api/openapi.json). TODO(api) marks
// workarounds; see docs/backend-gaps-v2-migration.md.

/** @public The doctor and nurse features build their keys on it in later steps. */
export const clinicalKeys = {
  all: ["clinical"] as const,
  profile: () => [...clinicalKeys.all, "profile"] as const,
  visits: (list: VisitList, search: string, page: number) =>
    [...clinicalKeys.all, "visits", list, search, page] as const,
  visit: (list: VisitList, id: string) => [...clinicalKeys.all, "visit", list, id] as const,
  patientInfo: (hin: string) => [...clinicalKeys.all, "patient-info", hin] as const,
  records: (kind: Visit["kind"], id: string, page: number) =>
    [...clinicalKeys.all, "records", kind, id, page] as const,
};

const PATIENTS_URL = "/api/hospital-ops/patients";

export const clinicalProfileQuery = () =>
  queryOptions({
    queryKey: clinicalKeys.profile(),
    queryFn: () => request(clinicalProfileSchema, { url: "/api/auth/staff/profile" }),
  });

export const VISITS_PAGE_SIZE = 10;

/** A page of one list's visits; the search matches names (TODO(api): not HINs). */
export const visitListQuery = (list: VisitList, search: string, page: number) =>
  queryOptions({
    queryKey: clinicalKeys.visits(list, search, page),
    queryFn: async (): Promise<VisitPage> => {
      const { count, results } = await request(visitPageSchema(list), {
        url: PATIENTS_URL,
        params: { status: list, search: search || undefined, page, size: VISITS_PAGE_SIZE },
      });
      return { total: count, items: results };
    },
    placeholderData: keepPreviousData,
  });

/** A visit the API doesn't have (or this member can't see). */
class VisitNotFoundError extends Error {
  constructor(id: string) {
    super(`Visit ${id} not found`);
    this.name = "VisitNotFoundError";
  }
}

/**
 * One visit, for its patient page. TODO(api): there's no endpoint for one admission or check-in,
 * so this pages through its list (100 at a time, up to 1,000) to find it.
 */
export const visitQuery = (list: VisitList, id: string) =>
  queryOptions({
    queryKey: clinicalKeys.visit(list, id),
    queryFn: async (): Promise<Visit> => {
      for (let page = 1; page <= 10; page++) {
        const { count, results } = await request(visitPageSchema(list), {
          url: PATIENTS_URL,
          params: { status: list, page, size: 100 },
        });
        const found = results.find((visit) => visit.id === id);
        if (found) return found;
        if (page * 100 >= count) break;
      }
      throw new VisitNotFoundError(id);
    },
  });

/** The patient's latest vitals and the drugs they're on. */
export const patientInfoQuery = (hin: string) =>
  queryOptions({
    queryKey: clinicalKeys.patientInfo(hin),
    queryFn: () =>
      request(patientInfoSchema, { url: `/api/patients/${encodeURIComponent(hin)}/info` }),
  });

export const RECORDS_PAGE_SIZE = 10;

/** What was recorded during the visit, newest first. */
export const visitRecordsQuery = (kind: Visit["kind"], id: string, page: number) =>
  queryOptions({
    queryKey: clinicalKeys.records(kind, id, page),
    queryFn: async () => {
      const { count, results } = await request(visitRecordPageSchema, {
        url: `/api/records/${kind === "admission" ? "admissions" : "check-ins"}/${encodeURIComponent(id)}/records`,
        params: { page, size: RECORDS_PAGE_SIZE },
      });
      return { total: count, items: results };
    },
    placeholderData: keepPreviousData,
  });
