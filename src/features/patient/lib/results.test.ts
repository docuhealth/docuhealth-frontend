import { describe, expect, it } from "vitest";
import type { LabResult } from "@/features/patient/api/pending";
import type { LabReport } from "@/features/patient/api/pending-results";
import type { VisitSummary } from "@/features/patient/api/schemas";
import {
  groupTestsByDay,
  labProgressSteps,
  labTestsOf,
  listTag,
  rangeLabel,
  rangePosition,
  rangeVerdict,
  type ResultValue,
  shortDoctor,
  slug,
  testHeaderLine,
  testRowDetail,
  valueRowDetail,
  valueTrend,
} from "@/features/patient/lib/results";

const now = new Date("2026-11-25T15:00:00");

const visit = (id: string, at: string, labTests: VisitSummary["labTests"]): VisitSummary => ({
  id,
  at,
  complaint: "Follow-up · Internal Medicine",
  diagnosis: null,
  facility: "ABC Hospital",
  clinician: { name: "Dr. Adaeze Okafor", specialty: null },
  vitals: null,
  labTests,
  scans: [],
  drugs: [],
  note: null,
});

const report = (visitId: string, test: string, fields: Partial<LabReport> = {}): LabReport => ({
  visitId,
  test,
  stage: "ready",
  laboratory: "ABC Hospital Laboratory",
  specimen: "Blood",
  method: null,
  orderedBy: null,
  collectedAt: "2026-11-20T08:12:00",
  receivedAt: null,
  resultedAt: "2026-11-20T14:40:00",
  about: null,
  values: [],
  qualitative: null,
  amendment: null,
  ...fields,
});

const haemoglobin: ResultValue = {
  id: "haemoglobin",
  name: "Haemoglobin",
  value: "12.8",
  unit: "g/dL",
  flag: "low",
  low: "13.0",
  high: "17.0",
  about: null,
  history: [
    { at: "2025-03-10T10:00:00", value: 10.2 },
    { at: "2025-11-10T10:00:00", value: 11.4 },
  ],
};
const { id: _id, ...haemoglobinReport } = haemoglobin;

const shared: LabResult[] = [
  {
    visitId: "6",
    test: "Creatinine",
    values: [{ name: "Creatinine", value: "88", unit: "µmol/L", flag: "normal" }],
  },
];

describe("labTestsOf", () => {
  const visits = [
    visit("7", "2026-11-20T10:00:00", [
      { name: "Full Blood Count", status: "result_ready" },
      { name: "Lipid Profile", status: "result_ready" },
    ]),
    visit("6", "2026-11-13T10:00:00", [
      { name: "Creatinine", status: "result_ready" },
      { name: "HbA1c", status: "pending" },
    ]),
  ];
  const reports = [
    report("7", "full blood count", {
      values: [haemoglobinReport, { ...haemoglobinReport, name: "MCV", flag: "normal" }],
    }),
    report("7", "Lipid Profile", { stage: "testing", collectedAt: "2026-11-25T08:40:00" }),
    report("6", "Urinalysis", {
      collectedAt: "2026-11-13T09:00:00",
      amendment: {
        at: "2026-11-15T10:00:00",
        summary: "Updated",
        changes: [],
        reason: null,
        by: null,
      },
    }),
  ];
  const tests = labTestsOf(visits, shared, reports, now);

  it("joins visits' tests with their reports and values, newest first", () => {
    expect(tests.map((test) => test.id)).toEqual([
      "7-lipid-profile",
      "7-full-blood-count",
      "6-creatinine",
      "6-hba1c",
      "6-urinalysis",
    ]);
    const fbc = tests[1];
    expect(fbc).toMatchObject({
      layout: "panel",
      laboratory: "ABC Hospital Laboratory",
      orderedBy: "Dr. Adaeze Okafor",
      isNew: true,
    });
    expect(fbc?.values[0]).toEqual(haemoglobin);
  });

  it("picks the layout from what's known", () => {
    expect(tests.map((test) => test.layout)).toEqual([
      "processing",
      "panel",
      "panel",
      "processing",
      "amended",
    ]);
    // Values shared without a report have no range.
    expect(tests[2]?.values[0]).toMatchObject({ id: "creatinine", low: null, high: null });
    expect(tests[2]?.isNew).toBe(false);
  });

  it("tags and describes each row", () => {
    expect(tests.map((test) => listTag(test).label)).toEqual([
      "Processing",
      "New",
      "Normal",
      "Processing",
      "Amended",
    ]);
    expect(tests.map((test) => testRowDetail(test, now))).toEqual([
      "ABC Hospital · Collected 8:40 AM",
      "2 tests · ABC Hospital · Dr. Okafor",
      "88 µmol/L · ABC Hospital",
      "ABC Hospital · Collected 13 Nov",
      "ABC Hospital · Amended 15 Nov",
    ]);
  });

  it("groups by day and heads a test", () => {
    expect(groupTestsByDay(tests, now).map((group) => group.label)).toEqual([
      "Today",
      "20 Nov, 2026",
      "13 Nov, 2026",
    ]);
    expect(testHeaderLine(tests[0]!, now)).toBe("Today · ABC Hospital Laboratory");
    expect(testHeaderLine(tests[1]!, now)).toBe("20 Nov 2026 · ABC Hospital Laboratory · 2 tests");
  });

  it("steps a processing test through the lab", () => {
    expect(labProgressSteps(tests[0]!, now).map((step) => [step.state, step.detail])).toEqual([
      ["done", "Today, 8:40 AM"],
      ["done", ""],
      ["current", "Usually ready within 24 hours"],
      ["pending", "We’ll notify you"],
    ]);
  });
});

describe("values", () => {
  it("prints ranges and rows", () => {
    expect(rangeLabel(haemoglobin)).toBe("13.0–17.0");
    expect(rangeLabel(haemoglobin, " ")).toBe("13.0 – 17.0");
    expect(rangeLabel({ low: null, high: "5.7" })).toBe("< 5.7");
    expect(rangeLabel({ low: null, high: null })).toBeNull();
    expect(valueRowDetail(haemoglobin)).toBe("12.8 g/dL · Normal 13.0–17.0");
  });

  it("says where a value sits", () => {
    expect(rangeVerdict(haemoglobin)).toBe("Slightly below normal");
    expect(rangeVerdict({ ...haemoglobin, value: "9" })).toBe("Below normal");
    expect(rangeVerdict({ ...haemoglobin, value: "15" })).toBe("Within normal range");
    expect(rangeVerdict({ ...haemoglobin, value: "17.5" })).toBe("Slightly above normal");
    expect(rangeVerdict({ ...haemoglobin, value: "Negative" })).toBeNull();
    // Three zones each as wide as the range: 9–13, 13–17, 17–21.
    expect(rangePosition(haemoglobin)).toBeCloseTo(31.67, 1);
    expect(rangePosition({ ...haemoglobin, value: "30" })).toBe(98);
    expect(rangePosition({ ...haemoglobin, low: null })).toBeNull();
  });

  it("charts a value's readings over the chosen period", () => {
    const test = labTestsOf(
      [visit("7", "2026-09-25T10:00:00", [{ name: "Full Blood Count", status: null }])],
      [],
      [report("7", "Full Blood Count", { resultedAt: "2026-09-25T14:40:00" })],
      now,
    )[0]!;
    expect(valueTrend(haemoglobin, test, "all", now).map((bucket) => bucket.label)).toEqual([
      "Mar 2025",
      "Nov 2025",
      "Sep 2026",
    ]);
    expect(valueTrend(haemoglobin, test, "1y", now).map((bucket) => bucket.values)).toEqual([
      [12.8],
    ]);
    expect(valueTrend(haemoglobin, test, "3y", now)).toHaveLength(3);
  });

  it("shortens names", () => {
    expect(shortDoctor("Dr. Adaeze Okafor")).toBe("Dr. Okafor");
    expect(shortDoctor("Grace Udo")).toBe("Grace Udo");
    expect(slug("Malaria parasite (RDT)")).toBe("malaria-parasite-rdt");
  });
});
