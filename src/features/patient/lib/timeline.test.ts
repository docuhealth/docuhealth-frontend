import { describe, expect, it } from "vitest";
import type { DrugRecord, VisitSummary, VitalReading } from "@/features/patient/api/schemas";
import type { ScanView } from "@/features/patient/lib/scans";
import {
  filterTimeline,
  groupByMonth,
  timelineEntries,
  type TimelineSources,
} from "@/features/patient/lib/timeline";

const now = new Date("2026-10-25T12:00:00");

const visit = (id: string, fields: Partial<VisitSummary> = {}): VisitSummary => ({
  id,
  at: "2026-09-25T10:00:00",
  complaint: null,
  diagnosis: null,
  facility: "ABC Hospital",
  clinician: { name: "Dr. Adaeze Okafor", specialty: "Internal Medicine" },
  vitals: null,
  labTests: [],
  scans: [],
  drugs: [],
  note: null,
  ...fields,
});

const reading = (at: string, bloodPressure: string | null): VitalReading => ({
  id: `vitals-${at}`,
  at,
  bloodPressure,
  temperature: null,
  breathingRate: null,
  heartRate: null,
  height: null,
  weight: null,
  spo2: null,
  bmi: null,
  recordedBy: null,
  facility: "ABC Hospital",
});

const amlodipine: DrugRecord = {
  id: "drug-1",
  name: "Amlodipine 10 mg",
  how: "Tablet · Oral · Once daily",
  quantity: "90 tablets",
  duration: "90 days",
  status: "ongoing",
  at: "2026-09-25T11:00:00",
  dispensing: "dispensed",
  dispensedAt: null,
};

const chestXray: ScanView = {
  id: "3-0",
  visitId: "3",
  name: "Chest X-ray",
  status: "completed",
  at: "2026-06-03T10:00:00",
  facility: "LUTH Radiology",
  orderedBy: null,
  report: {
    scanId: "3-0",
    stage: "ready",
    scannedAt: "2026-06-03T10:00:00",
    capturedAt: null,
    images: 2,
    bodyPart: null,
    type: null,
    reportedBy: null,
    reportedAt: "2026-06-04T10:00:00",
    impression: "No acute findings",
    findings: null,
  },
  scannedAt: "2026-06-03T10:00:00",
  state: "ready",
  isNew: false,
};

const sources: TimelineSources = {
  visits: [
    visit("7", {
      at: "2026-10-18T10:00:00",
      labTests: [{ name: "Full Blood Count", status: "result_ready" }],
    }),
    visit("6", { complaint: "Follow-up visit", diagnosis: "Hypertension review" }),
  ],
  visitDetails: [{ visitId: "7", type: "lab", nights: null, discharged: false, nextSteps: [] }],
  vitals: [reading("2026-09-25T10:30:00", "128/80"), reading("2026-09-01T10:00:00", null)],
  drugs: [amlodipine],
  medicationDetails: [],
  scans: [chestXray],
};

describe("timelineEntries", () => {
  const entries = timelineEntries(sources, now);

  it("merges every record, newest first, linking each to its page", () => {
    expect(entries.map((entry) => [entry.kind, entry.title])).toEqual([
      ["result", "Full Blood Count"],
      ["medication", "Amlodipine 10 mg prescribed"],
      ["vital", "Blood pressure 128/80 mmHg"],
      ["visit", "Follow-up visit"],
      ["imaging", "Chest X-ray"],
    ]);
    expect(entries[0]).toMatchObject({
      detail: "Result ready · tap to view",
      isNew: true,
      to: "/patient/health/results/$resultId",
      params: { resultId: "7-full-blood-count" },
    });
    expect(entries.at(-1)).toMatchObject({
      detail: "Impression: no acute findings",
      meta: "3 Jun 2026 · LUTH Radiology",
      params: { scanId: "3-0" },
    });
  });

  it("writes a line for each kind", () => {
    const byKind = Object.fromEntries(entries.map((entry) => [entry.kind, entry]));
    expect(byKind.visit).toMatchObject({
      detail: "Internal Medicine · Hypertension review",
      meta: "25 Sep 2026 · ABC Hospital · Dr. Okafor",
    });
    expect(byKind.vital?.detail).toBe("Within your target (<140/90)");
    expect(byKind.medication?.detail).toBe("Once daily · 90 days");
  });

  it("filters by kind and facility", () => {
    expect(filterTimeline(entries, "results", null).map((entry) => entry.kind)).toEqual([
      "result",
      "vital",
    ]);
    expect(filterTimeline(entries, "imaging", "ABC Hospital")).toEqual([]);
    expect(filterTimeline(entries, "all", "LUTH Radiology")).toHaveLength(1);
  });

  it("groups by month", () => {
    expect(groupByMonth(entries).map((group) => [group.label, group.entries.length])).toEqual([
      ["October 2026", 1],
      ["September 2026", 3],
      ["June 2026", 1],
    ]);
  });

  it("is empty with nothing on record", () => {
    expect(
      timelineEntries({
        visits: [],
        visitDetails: [],
        vitals: [],
        drugs: [],
        medicationDetails: [],
        scans: [],
      }),
    ).toEqual([]);
  });
});
