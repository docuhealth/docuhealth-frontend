import { describe, expect, it } from "vitest";
import type { VisitSummary, VitalReading } from "@/features/patient/api/schemas";
import { healthTrend } from "@/features/patient/lib/health-trends";

const visit = (id: string, at: string): VisitSummary => ({
  id,
  at,
  complaint: null,
  diagnosis: null,
  facility: "Reddington Lab",
  clinician: null,
  vitals: null,
  labTests: [],
  scans: [],
  drugs: [],
  note: null,
});

const reading: VitalReading = {
  id: "r1",
  at: "2026-09-25T10:00:00",
  bloodPressure: "128/80",
  temperature: null,
  breathingRate: null,
  heartRate: null,
  height: null,
  weight: 78,
  spo2: null,
  bmi: null,
  recordedBy: null,
  facility: "ABC Hospital",
};

const sources = {
  vitals: [reading],
  visits: [visit("6", "2026-11-13T10:00:00")],
  results: [
    {
      visitId: "6",
      test: "HbA1c",
      values: [{ name: "HbA1c", value: "5.6", unit: "%", flag: "normal" as const }],
    },
  ],
  history: [
    {
      id: "a1c-2024",
      name: "HbA1c",
      value: 6.1,
      unit: "%",
      flag: "high" as const,
      at: "2025-10-20T10:00:00",
      facility: "ABC Hospital",
    },
  ],
};

describe("healthTrend", () => {
  it("charts blood pressure and weight from the vital signs", () => {
    const pressure = healthTrend("bloodPressure", sources);
    expect(pressure.series.map((series) => series.name)).toEqual(["Systolic", "Diastolic"]);
    expect(pressure.points[0]).toMatchObject({ value: "128/80", values: [128, 80] });
    expect(healthTrend("weight", sources).points[0]).toMatchObject({ value: "78", values: [78] });
  });

  it("charts a lab value from the visits' results, then its earlier values", () => {
    const hba1c = healthTrend("hba1c", sources);
    expect(hba1c).toMatchObject({ label: "HbA1c", unit: "%", band: { low: 4, high: 5.6 } });
    expect(hba1c.points).toEqual([
      {
        id: "6-HbA1c",
        at: "2026-11-13T10:00:00",
        facility: "Reddington Lab",
        values: [5.6],
        value: "5.6",
        status: { level: "normal", severe: false },
      },
      {
        id: "a1c-2024",
        at: "2025-10-20T10:00:00",
        facility: "ABC Hospital",
        values: [6.1],
        value: "6.1",
        status: { level: "high", severe: false },
      },
    ]);
  });

  it("has no points for a value never measured", () => {
    expect(healthTrend("creatinine", sources).points).toEqual([]);
  });
});
