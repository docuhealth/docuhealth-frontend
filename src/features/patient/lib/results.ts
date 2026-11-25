import type { LabResult } from "@/features/patient/api/pending";
import type { LabReport } from "@/features/patient/api/pending-results";
import type { VisitSummary } from "@/features/patient/api/schemas";
import { orderStatusLabel } from "@/features/patient/lib/records";
import { dayLabel, type ProgressStep, scanTime } from "@/features/patient/lib/scans";
import type { TrendBucket } from "@/features/patient/lib/vitals";
import { formatDay, formatDayMonth, formatTime, plural } from "@/lib/format";

// Working out the Test results pages from the lab tests ordered at visits, their values (pending
// lab results) and, where there is one, the lab's report. TODO(api): reports, ranges, specimens,
// amendments and qualitative results aren't served to patients yet (api/pending-results.ts), so
// without a report only the test's name, order status and any shared values are known.

type Flag = "normal" | "low" | "high";

/** One value of a test, e.g. Haemoglobin 12.8 g/dL. */
export type ResultValue = {
  id: string;
  name: string;
  value: string;
  unit: string;
  flag: Flag;
  low: string | null;
  high: string | null;
  about: string | null;
  history: { at: string; value: number }[];
};

/** A lab test with what the pages show for it. */
export type LabTest = {
  id: string;
  visitId: string;
  name: string;
  status: string | null;
  /** When the sample was taken: the report's time, else the visit's. */
  at: string;
  facility: string | null;
  /** The lab that ran it: the report's, else the facility. */
  laboratory: string | null;
  orderedBy: string | null;
  /** The visit it was ordered at, e.g. "Follow-up · Internal Medicine". */
  visit: string | null;
  report: LabReport | null;
  values: ResultValue[];
  /** Which details page it gets: still processing, amended, a word result, or a list of values. */
  layout: "processing" | "amended" | "qualitative" | "panel";
  /** Its results came out within the last week. */
  isNew: boolean;
};

/** Order statuses that mean the results are out. */
const finalStatuses = new Set([
  "final",
  "completed",
  "result_ready",
  "result_accepted_by_lab_admin",
  "result_accepted_by_doctor",
]);

const NEW_FOR_DAYS = 7;
const DAY = 24 * 60 * 60_000;

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** A name as a URL segment: "Full Blood Count" → "full-blood-count". */
export const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Every lab test ordered at a visit, plus any the lab reported for a visit whose summary doesn't
 * list it, each with its values and report, newest first.
 */
export function labTestsOf(
  visits: VisitSummary[],
  results: LabResult[],
  reports: LabReport[],
  now = new Date(),
): LabTest[] {
  return visits
    .flatMap((visit) => {
      const ordered = visit.labTests.map((test) => ({ name: test.name, status: test.status }));
      const extra = reports
        .filter(
          (report) =>
            report.visitId === visit.id && !ordered.some((test) => same(test.name, report.test)),
        )
        .map((report) => ({ name: report.test, status: null }));
      return [...ordered, ...extra].map((test) => {
        const report =
          reports.find((entry) => entry.visitId === visit.id && same(entry.test, test.name)) ??
          null;
        const shared =
          results.find((entry) => entry.visitId === visit.id && same(entry.test, test.name))
            ?.values ?? [];
        const values: ResultValue[] = report?.values.length
          ? report.values.map((value) => ({ ...value, id: slug(value.name) }))
          : shared.map((value) => ({
              ...value,
              id: slug(value.name),
              low: null,
              high: null,
              about: null,
              history: [],
            }));
        const ready = report
          ? report.stage === "ready"
          : finalStatuses.has(test.status ?? "") || values.length > 0;
        const resultedAt = report?.resultedAt ? new Date(report.resultedAt).getTime() : null;
        return {
          id: `${visit.id}-${slug(test.name)}`,
          visitId: visit.id,
          name: test.name,
          status: test.status,
          at: report?.collectedAt ?? visit.at,
          facility: visit.facility,
          laboratory: report?.laboratory ?? visit.facility,
          orderedBy: report?.orderedBy ?? visit.clinician?.name ?? null,
          visit: visit.complaint ?? visit.facility,
          report,
          values,
          layout: !ready
            ? ("processing" as const)
            : report?.amendment
              ? ("amended" as const)
              : report?.qualitative
                ? ("qualitative" as const)
                : ("panel" as const),
          isNew:
            ready &&
            resultedAt != null &&
            resultedAt <= now.getTime() &&
            now.getTime() - resultedAt < NEW_FOR_DAYS * DAY,
        };
      });
    })
    .sort((a, b) => b.at.localeCompare(a.at));
}

type Tone = "success" | "warning" | "info" | "neutral" | "brand" | "error";

const flagTags: Record<Flag, { tone: Tone; label: string }> = {
  normal: { tone: "success", label: "Normal" },
  low: { tone: "warning", label: "Low" },
  high: { tone: "error", label: "High" },
};

/** A value's tag: Normal, Low or High. */
export const flagTag = (flag: Flag) => flagTags[flag];

/** The tag a test wears on its details page: Processing, Amended or Final. */
export function statusTag(test: LabTest): { tone: Tone; label: string } {
  if (test.layout === "processing") return { tone: "neutral", label: "Processing" };
  if (test.layout === "amended") return { tone: "brand", label: "Amended" };
  return { tone: "brand", label: "Final" };
}

/** A test with a single value, which the list opens straight to. */
export const singleValue = (test: LabTest) =>
  test.layout === "panel" && test.values.length === 1 ? test.values[0] : null;

/** The tag a test wears in the list: its status, its one value's flag, or New. */
export function listTag(test: LabTest) {
  const single = singleValue(test);
  if (test.layout === "processing" || test.layout === "amended") return statusTag(test);
  if (single) return flagTag(single.flag);
  if (test.isNew) return { tone: "info" as const, label: "New" };
  return statusTag(test);
}

/** "Dr. Adaeze Okafor" → "Dr. Okafor"; other names as they are. */
export function shortDoctor(name: string | null) {
  if (!name?.startsWith("Dr. ")) return name;
  return `Dr. ${name.split(" ").at(-1)}`;
}

/** "12.8 g/dL". */
export const valueWithUnit = (value: ResultValue) =>
  [value.value, value.unit].filter(Boolean).join(" ");

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/** A list row's line: what came back, where, and who asked for it or when it changed. */
export function testRowDetail(test: LabTest, now = new Date()) {
  const single = singleValue(test);
  const at = new Date(test.at);
  const parts =
    test.layout === "processing"
      ? [test.facility, `Collected ${sameDay(at, now) ? formatTime(at) : formatDayMonth(at)}`]
      : test.layout === "amended" && test.report?.amendment
        ? [test.facility, `Amended ${formatDayMonth(new Date(test.report.amendment.at))}`]
        : test.layout === "qualitative" && test.report?.qualitative
          ? [test.report.qualitative.result, test.facility]
          : single
            ? [valueWithUnit(single), test.facility]
            : test.values.length
              ? [plural(test.values.length, "test"), test.facility, shortDoctor(test.orderedBy)]
              : [test.facility, orderStatusLabel(test.status)];
  return parts.filter(Boolean).join(" · ");
}

/** A value's normal range: "13.0–17.0", "< 5.7", "> 60", or null without one. */
export function rangeLabel(value: Pick<ResultValue, "low" | "high">, gap = "") {
  if (value.low && value.high) return `${value.low}${gap}–${gap}${value.high}`;
  if (value.high) return `< ${value.high}`;
  if (value.low) return `> ${value.low}`;
  return null;
}

/** A panel row's line: "12.8 g/dL · Normal 13.0–17.0". */
export function valueRowDetail(value: ResultValue) {
  const range = rangeLabel(value);
  return [valueWithUnit(value), range && `Normal ${range}`].filter(Boolean).join(" · ");
}

/** Tests in runs of the same day, each under its day's label, keeping their order. */
export function groupTestsByDay(tests: LabTest[], now = new Date()) {
  const groups: { label: string; tests: LabTest[] }[] = [];
  for (const test of tests) {
    const label = dayLabel(new Date(test.at), now);
    const last = groups.at(-1);
    if (last?.label === label) last.tests.push(test);
    else groups.push({ label, tests: [test] });
  }
  return groups;
}

/** The line under a test's name: "Today · ABC Hospital Laboratory · 6 tests". */
export function testHeaderLine(test: LabTest, now = new Date()) {
  const at = new Date(test.at);
  return [
    sameDay(at, now) ? "Today" : formatDay(at),
    test.laboratory,
    test.layout === "panel" && test.values.length > 1 ? plural(test.values.length, "test") : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** "Blood · 25 Sep, 8:12 AM": the specimen and when it was taken. */
export function specimenLine(test: LabTest) {
  const at = test.report?.collectedAt ? new Date(test.report.collectedAt) : null;
  return (
    [test.report?.specimen, at && `${formatDayMonth(at)}, ${formatTime(at)}`]
      .filter(Boolean)
      .join(" · ") || null
  );
}

/** Steps done so far at each stage. */
const stepsDone = { collected: 1, testing: 2, ready: 4 };

/** A test's way to its results: sample collected, received by the lab, testing, results ready. */
export function labProgressSteps(test: LabTest, now = new Date()): ProgressStep[] {
  const done = stepsDone[test.report?.stage ?? "collected"];
  const steps = [
    { label: "Sample collected", at: test.at, hint: "" },
    { label: "Received by the lab", at: test.report?.receivedAt ?? null, hint: "On its way" },
    { label: "Testing in progress", at: null, hint: "Usually ready within 24 hours" },
    { label: "Results ready", at: test.report?.resultedAt ?? null, hint: "We’ll notify you" },
  ];
  return steps.map((step, index) => {
    const state = index < done ? "done" : index === done ? "current" : "pending";
    return {
      label: step.label,
      state,
      detail: state === "done" ? (step.at ? scanTime(step.at, now) : "") : step.hint,
    };
  });
}

/** Where a value sits against its range, in words: "Slightly below normal", "Within normal range". */
export function rangeVerdict(value: ResultValue) {
  const reading = Number(value.value);
  const low = value.low == null ? null : Number(value.low);
  const high = value.high == null ? null : Number(value.high);
  if (Number.isNaN(reading) || (low == null && high == null)) return null;
  // Within a quarter of the range (a tenth of a one-sided limit) outside it is "slightly".
  const slack = low != null && high != null ? (high - low) * 0.25 : (low ?? high ?? 0) * 0.1;
  if (low != null && reading < low)
    return reading >= low - slack ? "Slightly below normal" : "Below normal";
  if (high != null && reading > high)
    return reading <= high + slack ? "Slightly above normal" : "Above normal";
  return "Within normal range";
}

/**
 * Where the marker sits on the range bar, 0–100: the bar is three equal zones (low, normal,
 * high), each as wide as the normal range.
 */
export function rangePosition(value: ResultValue) {
  const reading = Number(value.value);
  const low = Number(value.low);
  const high = Number(value.high);
  if ([reading, low, high].some(Number.isNaN) || value.low == null || value.high == null)
    return null;
  const span = high - low || 1;
  const position = ((reading - (low - span)) / (span * 3)) * 100;
  return Math.min(98, Math.max(2, position));
}

/** How far back a value's trend looks. */
export type ResultPeriod = "all" | "1y" | "3y";

const monthYear = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });

/** A value's readings for the trend chart, oldest first: the earlier ones and this one. */
export function valueTrend(
  value: ResultValue,
  test: LabTest,
  period: ResultPeriod,
  now = new Date(),
): TrendBucket[] {
  const from = new Date(now);
  if (period === "1y") from.setFullYear(now.getFullYear() - 1);
  if (period === "3y") from.setFullYear(now.getFullYear() - 3);
  const current = Number(value.value);
  const readings = [
    ...value.history,
    ...(Number.isNaN(current) ? [] : [{ at: test.report?.resultedAt ?? test.at, value: current }]),
  ];
  return readings
    .filter((reading) => period === "all" || new Date(reading.at) >= from)
    .sort((a, b) => a.at.localeCompare(b.at))
    .map((reading) => {
      const at = new Date(reading.at);
      return {
        key: reading.at,
        // en-GB writes September "Sept" in newer browsers; the designs write "Sep".
        label: monthYear.format(at).replace(/\bSept\b/, "Sep"),
        longLabel: formatDay(at),
        values: [reading.value],
      };
    });
}

/** A value's normal range as the chart's band, when it has both ends. */
export function rangeBand(value: ResultValue) {
  const low = Number(value.low);
  const high = Number(value.high);
  if (value.low == null || value.high == null || Number.isNaN(low) || Number.isNaN(high))
    return null;
  return { low, high };
}
