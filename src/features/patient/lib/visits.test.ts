import { describe, expect, it } from "vitest";
import type { VisitDetail } from "@/features/patient/api/pending";
import type { Appointment, VisitSummary } from "@/features/patient/api/schemas";
import {
  filterVisits,
  formatStay,
  hasSummary,
  labHeadline,
  shortClinician,
  visitRows,
} from "@/features/patient/lib/visits";

const visit = (id: string, fields: Partial<VisitSummary> = {}): VisitSummary => ({
  id,
  at: "2026-11-25T09:30:00",
  complaint: null,
  diagnosis: null,
  facility: "ABC Hospital",
  clinician: { name: "Dr. Adaeze Okafor", specialty: null },
  vitals: null,
  labTests: [],
  scans: [],
  drugs: [],
  note: null,
  ...fields,
});

const detail = (visitId: string, fields: Partial<VisitDetail>): VisitDetail => ({
  visitId,
  type: "outpatient",
  nights: null,
  discharged: false,
  nextSteps: [],
  ...fields,
});

const now = new Date("2026-10-01T00:00:00");
const appointment: Appointment = {
  id: "a1",
  status: "confirmed",
  at: "2026-12-15T10:00:00",
  type: "Follow-up",
  clinician: { name: "Dr. Adaeze Okafor", specialty: "Internal Medicine" },
  facility: "ABC Hospital",
};

describe("visit rows", () => {
  const visits = [
    visit("7", { complaint: "Follow-up · Internal Medicine", diagnosis: "High blood pressure" }),
    visit("6", { at: "2026-11-18T10:00:00", facility: "Reddington Lab", clinician: null }),
    visit("5", { at: "2026-08-10T10:00:00", facility: "LUTH", complaint: "Admission" }),
    visit("4", { complaint: "Fever" }),
  ];
  const details = [
    detail("7", {}),
    detail("6", { type: "lab" }),
    detail("5", { type: "admission", nights: 4, discharged: true }),
  ];
  const rows = visitRows(visits, [appointment], details, now);

  it("puts booked appointments first, then past visits with their titles, lines and tags", () => {
    expect(rows.map((row) => [row.when, row.title, row.line, row.status])).toEqual([
      [
        "upcoming",
        "Follow-up · Internal Medicine",
        "15 Dec 2026, 10:00 AM · ABC Hospital",
        "booked",
      ],
      [
        "past",
        "Follow-up · Internal Medicine",
        "25 Nov 2026 · ABC Hospital · Dr. Okafor",
        "summary",
      ],
      ["past", "Lab visit", "18 Nov 2026 · Reddington Lab", "no-summary"],
      ["past", "Admission", "10–14 Aug 2026 · LUTH · 4 nights", "discharged"],
      ["past", "Fever", "25 Nov 2026 · ABC Hospital · Dr. Okafor", "summary"],
    ]);
  });

  it("shows a visit of unknown type only under all visits", () => {
    expect(filterVisits(rows, "all", null)).toHaveLength(5);
    expect(filterVisits(rows, "outpatient", null).map((row) => row.id)).toEqual([
      "appointment-a1",
      "visit-7",
    ]);
    expect(filterVisits(rows, "admission", null).map((row) => row.id)).toEqual(["visit-5"]);
    expect(filterVisits(rows, "emergency", null)).toHaveLength(0);
    expect(filterVisits(rows, "all", "LUTH").map((row) => row.id)).toEqual(["visit-5"]);
  });

  it("leaves out cancelled and past appointments", () => {
    const old = { ...appointment, id: "a2", at: "2026-01-01T10:00:00" };
    const cancelled = { ...appointment, id: "a3", status: "cancelled" as const };
    expect(visitRows([], [old, cancelled], [], now)).toEqual([]);
  });
});

describe("visit helpers", () => {
  it("counts a visit with a complaint, diagnosis or note as having a summary", () => {
    expect(hasSummary(visit("1"))).toBe(false);
    expect(hasSummary(visit("1", { note: "Rest" }))).toBe(true);
  });

  it("shortens a doctor's name", () => {
    expect(shortClinician("Dr. Adaeze Okafor")).toBe("Dr. Okafor");
    expect(shortClinician("Grace Udo")).toBe("Grace Udo");
    expect(shortClinician(null)).toBeNull();
  });

  it("writes a stay's dates", () => {
    expect(formatStay(new Date(2026, 7, 10), new Date(2026, 7, 14))).toBe("10–14 Aug 2026");
    expect(formatStay(new Date(2026, 6, 28), new Date(2026, 7, 1))).toBe("28 Jul – 1 Aug 2026");
    expect(formatStay(new Date(2025, 11, 30), new Date(2026, 0, 3))).toBe(
      "30 Dec 2025 – 3 Jan 2026",
    );
  });

  it("picks a lab test's value outside range, else its first", () => {
    const values = [
      { name: "Haemoglobin", value: "13.8", unit: "g/dL", flag: "normal" as const },
      { name: "WBC", value: "11.8", unit: "×10⁹/L", flag: "high" as const },
    ];
    expect(labHeadline({ visitId: "7", test: "FBC", values })).toEqual({
      line: "WBC 11.8 ×10⁹/L",
      flag: "high",
    });
    expect(labHeadline({ visitId: "7", test: "FBC", values: values.slice(0, 1) })?.line).toBe(
      "Haemoglobin 13.8 g/dL",
    );
    expect(labHeadline(null)).toBeNull();
  });
});
