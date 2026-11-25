import { queryOptions } from "@tanstack/react-query";
import { paginated, request } from "@/lib/api";
import {
  appointmentSchema,
  drugRecordSchema,
  visitSummarySchema,
  vitalReadingSchema,
} from "@/features/patient/api/schemas";

// The patient's own records on the real API. Each list is read in one page of up to 100 and
// worked through in the browser: a patient has tens of visits, not thousands.
// TODO(api): no patient profile endpoint; the name and HIN come from the login.

const PAGE = { page: 1, size: 100 } as const;

const patientKeys = {
  all: ["patient"] as const,
  visits: (hin: string) => [...patientKeys.all, "visits", hin] as const,
  appointments: () => [...patientKeys.all, "appointments"] as const,
  drugs: () => [...patientKeys.all, "drugs"] as const,
  vitals: () => [...patientKeys.all, "vitals"] as const,
};

/** Every visit summary, newest first: diagnoses, vitals, lab tests, scans and drugs per visit. */
export const visitsQuery = (hin: string) =>
  queryOptions({
    queryKey: patientKeys.visits(hin),
    queryFn: () =>
      request(paginated(visitSummarySchema), {
        url: `/api/records/summaries/${encodeURIComponent(hin)}`,
        params: { ...PAGE, ordering: "-created_at" },
      }),
    select: (page) => [...page.items].sort((a, b) => b.at.localeCompare(a.at)),
    enabled: !!hin,
  });

/** The patient's appointments, soonest first. */
export const appointmentsQuery = () =>
  queryOptions({
    queryKey: patientKeys.appointments(),
    queryFn: () =>
      request(paginated(appointmentSchema), {
        url: "/api/hospital-ops/appointments/mine",
        params: PAGE,
      }),
    select: (page) => [...page.items].sort((a, b) => a.at.localeCompare(b.at)),
  });

/** The patient's drug records, newest first. */
export const drugsQuery = () =>
  queryOptions({
    queryKey: patientKeys.drugs(),
    queryFn: () =>
      request(paginated(drugRecordSchema), {
        url: "/api/pharmacy/patients/drug-records",
        params: PAGE,
      }),
    select: (page) => [...page.items].sort((a, b) => b.at.localeCompare(a.at)),
  });

/** Every set of vital signs recorded for the patient, newest first. */
export const vitalsQuery = () =>
  queryOptions({
    queryKey: patientKeys.vitals(),
    queryFn: () =>
      request(paginated(vitalReadingSchema), {
        url: "/api/records/vital-signs/mine",
        params: PAGE,
      }),
    select: (page) => [...page.items].sort((a, b) => b.at.localeCompare(a.at)),
  });
