import { describe, expect, it } from "vitest";
import {
  defaultPatientFilters,
  patientListParams,
} from "@/features/hospital-admin/lib/patient-filters";

describe("patientListParams", () => {
  const filters = {
    ward: "icu",
    doctor: "doctor-2",
    visitType: "emergency",
    date: "week",
    sort: "oldest",
  } as const;

  it("defaults to the first page, unfiltered", () => {
    expect(patientListParams("admitted")).toEqual({
      tab: "admitted",
      search: "",
      page: 1,
      ...defaultPatientFilters,
    });
  });

  it("leaves out the filters a tab doesn't show", () => {
    expect(patientListParams("admitted", { filters })).toMatchObject({
      ward: "icu",
      visitType: "all",
      date: "anytime",
    });
    expect(patientListParams("checked_out", { filters })).toMatchObject({
      ward: "all",
      visitType: "emergency",
      date: "week",
    });
  });

  it("keeps the doctor and sort on every tab", () => {
    expect(patientListParams("discharged", { filters })).toMatchObject({
      doctor: "doctor-2",
      sort: "oldest",
    });
  });
});
