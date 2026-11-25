import type { ScanReport } from "@/features/patient/api/pending";
import type { scansOf } from "@/features/patient/lib/records";
import { formatDateCommaTime, formatDayMonth, formatTime, plural } from "@/lib/format";

// Working out the scan pages' views from the scans ordered at visits and, where there is one, the
// scan's report record. TODO(api): reports, stages and images aren't served to patients yet
// (api/pending.ts), so without a record only the order's status is known.

/** A scan ordered at a visit. */
export type Scan = ReturnType<typeof scansOf>[number];

/** A scan with its report (if any) and what the pages show for it. */
export type ScanView = Scan & {
  report: ScanReport | null;
  /** When it was done: the report's scan time, else the visit's. */
  scannedAt: string;
  /** The report is out (`ready`), or it's still being worked on (`progress`). */
  state: "ready" | "progress";
  /** The report came out within the last two weeks. */
  isNew: boolean;
};

/** Order statuses that mean the scan's report is finished. */
const finalStatuses = new Set([
  "final",
  "completed",
  "result_ready",
  "result_accepted_by_lab_admin",
  "result_accepted_by_doctor",
]);

const NEW_FOR_DAYS = 14;
const DAY = 24 * 60 * 60_000;

/** Every scan with its report and state, newest first. */
export function scanViews(scans: Scan[], reports: ScanReport[], now = new Date()): ScanView[] {
  return scans
    .map((scan) => {
      const report = reports.find((candidate) => candidate.scanId === scan.id) ?? null;
      const ready = report ? report.stage === "ready" : finalStatuses.has(scan.status ?? "");
      const reportedAt = report?.reportedAt ? new Date(report.reportedAt).getTime() : null;
      return {
        ...scan,
        report,
        scannedAt: report?.scannedAt ?? scan.at,
        state: ready ? ("ready" as const) : ("progress" as const),
        isNew:
          ready &&
          reportedAt != null &&
          now.getTime() - reportedAt < NEW_FOR_DAYS * DAY &&
          reportedAt <= now.getTime(),
      };
    })
    .sort((a, b) => b.scannedAt.localeCompare(a.scannedAt));
}

/** The tag a scan wears: awaiting its report, newly reported, or final. */
export function scanTag(scan: ScanView) {
  if (scan.state === "progress") return { tone: "warning" as const, label: "Awaiting report" };
  if (scan.isNew) return { tone: "info" as const, label: "New" };
  return { tone: "brand" as const, label: "Final" };
}

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/** A day as the list's dividers print it: "Today", "Yesterday" or "25 Sep, 2026". */
export function dayLabel(date: Date, now = new Date()) {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, now)) return "Today";
  if (sameDay(date, yesterday)) return "Yesterday";
  return `${formatDayMonth(date)}, ${date.getFullYear()}`;
}

/** Scans in runs of the same day, each under its day's label, keeping their order. */
export function groupByDay(scans: ScanView[], now = new Date()) {
  const groups: { label: string; scans: ScanView[] }[] = [];
  for (const scan of scans) {
    const label = dayLabel(new Date(scan.scannedAt), now);
    const last = groups.at(-1);
    if (last?.label === label) last.scans.push(scan);
    else groups.push({ label, scans: [scan] });
  }
  return groups;
}

/** A list row's line: where, then the time (today), the images, or "Report only". */
export function scanRowDetail(scan: ScanView, now = new Date()) {
  const at = new Date(scan.scannedAt);
  const extra = sameDay(at, now)
    ? formatTime(at)
    : scan.state === "ready" && scan.report
      ? scan.report.images
        ? plural(scan.report.images, "image")
        : "Report only"
      : null;
  return [scan.facility, extra].filter(Boolean).join(" · ");
}

/** When something happened, as the details print it: "Today, 9:20 AM" or "25 Sep 2026, 9:20 AM". */
export function scanTime(at: string, now = new Date()) {
  const date = new Date(at);
  return sameDay(date, now) ? `Today, ${formatTime(date)}` : formatDateCommaTime(date);
}

export type ProgressStep = {
  label: string;
  state: "done" | "current" | "pending";
  /** The time it happened, or what to expect. */
  detail: string;
};

/** Steps done so far at each stage (the images being taken is part of the scan). */
const stepsDone = { scanned: 1, captured: 2, reviewing: 2, ready: 4 };

/**
 * A scan's way to its report: scan done, images captured, a specialist reviewing, report ready.
 * Without a report record only the scan itself is known.
 */
export function progressSteps(scan: ScanView, now = new Date()): ProgressStep[] {
  const done = stepsDone[scan.report?.stage ?? "scanned"];
  const steps = [
    { label: "Scan done", at: scan.scannedAt, hint: "" },
    { label: "Images captured", at: scan.report?.capturedAt ?? null, hint: "In progress" },
    { label: "Specialist reviewing", at: null, hint: "Usually 2–3 working days" },
    { label: "Report ready", at: scan.report?.reportedAt ?? null, hint: "We’ll notify you" },
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
