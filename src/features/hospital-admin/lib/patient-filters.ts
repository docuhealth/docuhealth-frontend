import type { PatientListParams, PatientTab } from "@/features/hospital-admin/api/schemas";

/** The filters above a Patient Management tab's table. */
export type PatientFilters = Pick<
  PatientListParams,
  "ward" | "doctor" | "visitType" | "date" | "sort"
>;

export const defaultPatientFilters: PatientFilters = {
  ward: "all",
  doctor: "all",
  visitType: "all",
  date: "anytime",
  sort: "latest",
};

/**
 * Which filters each tab shows, besides doctor and sort; `date` names the date it filters by,
 * e.g. "Check-In" for "Check-In: Anytime".
 */
export const tabFilters = {
  admitted: { ward: true, visitType: false, date: null },
  checked_in: { ward: true, visitType: false, date: "Check-In" },
  checked_out: { ward: false, visitType: true, date: "Check-Out" },
  discharged: { ward: true, visitType: false, date: "Discharged" },
} as const satisfies Record<PatientTab, { ward: boolean; visitType: boolean; date: string | null }>;

/** What to ask the API for: `filters` the tab doesn't show are left out. */
export function patientListParams(
  tab: PatientTab,
  { search = "", page = 1, filters = defaultPatientFilters } = {},
): PatientListParams {
  const shown = tabFilters[tab];
  return {
    tab,
    search,
    page,
    doctor: filters.doctor,
    sort: filters.sort,
    ward: shown.ward ? filters.ward : "all",
    visitType: shown.visitType ? filters.visitType : "all",
    date: shown.date ? filters.date : "anytime",
  };
}
