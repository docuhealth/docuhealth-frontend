import type { LinkProps } from "@tanstack/react-router";
import type { MedicationDetail, VisitDetail } from "@/features/patient/api/pending";
import type { DrugRecord, VisitSummary, VitalReading } from "@/features/patient/api/schemas";
import { slug } from "@/features/patient/lib/results";
import type { ScanView } from "@/features/patient/lib/scans";
import {
  detailFor,
  frequencyOfDrug,
  shortClinician,
  visitTitle,
} from "@/features/patient/lib/visits";
import { bloodPressureStatus } from "@/features/patient/lib/vitals";
import { formatDay } from "@/lib/format";

// The Timeline: everything already on the patient's record, merged into one dated feed: visit
// summaries, lab results, blood pressure readings, prescriptions and scans. Nothing here is new
// data; it's the other record pages' data side by side.

export type TimelineKind = "result" | "visit" | "vital" | "medication" | "imaging";

export type TimelineFilter = "all" | "results" | "visits" | "medications" | "imaging";

export const timelineFilters: { value: TimelineFilter; label: string; kinds: TimelineKind[] }[] = [
  { value: "all", label: "All", kinds: ["result", "visit", "vital", "medication", "imaging"] },
  // Readings are results too: a measurement, like a lab value.
  { value: "results", label: "Results", kinds: ["result", "vital"] },
  { value: "visits", label: "Visits", kinds: ["visit"] },
  { value: "medications", label: "Medications", kinds: ["medication"] },
  { value: "imaging", label: "Imaging", kinds: ["imaging"] },
];

/** One row of the Timeline. */
export type TimelineEntry = {
  id: string;
  kind: TimelineKind;
  at: string;
  title: string;
  /** The line under the title: "Result ready · tap to view". */
  detail: string | null;
  /** "25 Sep 2026 · ABC Hospital · Dr. Okafor". */
  meta: string;
  facility: string | null;
  /** Arrived in the last two weeks. */
  isNew: boolean;
  /** The record's own page. */
  to: LinkProps["to"];
  params?: LinkProps["params"];
};

/** The Timeline's sources, as the record pages already have them. */
export type TimelineSources = {
  visits: VisitSummary[];
  visitDetails: VisitDetail[];
  vitals: VitalReading[];
  drugs: DrugRecord[];
  medicationDetails: MedicationDetail[];
  scans: ScanView[];
};

const READY = new Set([
  "result_ready",
  "result_accepted_by_lab_admin",
  "result_accepted_by_doctor",
  "completed",
]);
const FRESH_DAYS = 14;
const DAY = 24 * 60 * 60_000;

const isRecent = (at: string, now: Date) => {
  const age = now.getTime() - new Date(at).getTime();
  return age >= 0 && age < FRESH_DAYS * DAY;
};

const line = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(" · ");

/** "Within your target (<140/90)" or how far out of it a blood pressure reading is. */
function pressureNote(reading: string | null) {
  const status = bloodPressureStatus(reading);
  if (!status) return null;
  if (status.level === "normal") return "Within your target (<140/90)";
  if (status.level === "low") return "Below your target range";
  return status.severe ? "Above your target (<140/90)" : "Near the top of your target (<140/90)";
}

/** Every record as a Timeline entry, newest first. */
export function timelineEntries(sources: TimelineSources, now = new Date()): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  for (const visit of sources.visits) {
    const detail = detailFor(sources.visitDetails, visit.id);
    const clinician = shortClinician(visit.clinician?.name);
    // A lab-only visit is its results; it has no write-up of its own to show.
    if (detail?.type !== "lab" && (visit.complaint || visit.diagnosis || visit.note || clinician)) {
      entries.push({
        id: `visit-${visit.id}`,
        kind: "visit",
        at: visit.at,
        title: visitTitle(visit, detail),
        detail: line(visit.clinician?.specialty, visit.diagnosis) || null,
        meta: line(formatDay(new Date(visit.at)), visit.facility, clinician),
        facility: visit.facility,
        isNew: false,
        to: "/patient/health/visits/$visitId",
        params: { visitId: visit.id },
      });
    }
    visit.labTests.forEach((test, index) => {
      const ready = test.status != null && READY.has(test.status);
      entries.push({
        id: `result-${visit.id}-${index}`,
        kind: "result",
        at: visit.at,
        title: test.name,
        detail: ready ? "Result ready · tap to view" : "Awaiting result",
        meta: line(formatDay(new Date(visit.at)), visit.facility),
        facility: visit.facility,
        isNew: ready && isRecent(visit.at, now),
        // The Test results pages' id for a visit's test.
        to: "/patient/health/results/$resultId",
        params: { resultId: `${visit.id}-${slug(test.name)}` },
      });
    });
  }

  for (const reading of sources.vitals) {
    if (!reading.bloodPressure) continue;
    entries.push({
      id: `vital-${reading.id}`,
      kind: "vital",
      at: reading.at,
      title: `Blood pressure ${reading.bloodPressure} mmHg`,
      detail: pressureNote(reading.bloodPressure),
      meta: line(formatDay(new Date(reading.at)), reading.facility),
      facility: reading.facility,
      isNew: false,
      to: "/patient/health/vitals",
    });
  }

  for (const drug of sources.drugs) {
    const detail = sources.medicationDetails.find((entry) => entry.drugId === drug.id) ?? null;
    const frequency = frequencyOfDrug(drug);
    entries.push({
      id: `medication-${drug.id}`,
      kind: "medication",
      at: drug.at,
      title: `${drug.name} prescribed`,
      detail:
        line(frequency && frequency.charAt(0).toUpperCase() + frequency.slice(1), drug.duration) ||
        null,
      meta: line(formatDay(new Date(drug.at)), detail?.facility),
      facility: detail?.facility ?? null,
      isNew: isRecent(drug.at, now),
      to: "/patient/health/medications",
    });
  }

  for (const scan of sources.scans) {
    const impression = scan.report?.impression;
    entries.push({
      id: `imaging-${scan.id}`,
      kind: "imaging",
      at: scan.scannedAt,
      title: scan.name,
      detail:
        scan.state === "ready"
          ? impression
            ? `Impression: ${impression.charAt(0).toLowerCase()}${impression.slice(1)}`
            : "Report ready · tap to view"
          : "Awaiting report",
      meta: line(formatDay(new Date(scan.scannedAt)), scan.facility),
      facility: scan.facility,
      isNew: scan.isNew,
      to: "/patient/health/scans/$scanId",
      params: { scanId: scan.id },
    });
  }

  return entries.sort((a, b) => b.at.localeCompare(a.at));
}

/** The entries a chip and the facility filter show. */
export function filterTimeline(
  entries: TimelineEntry[],
  filter: TimelineFilter,
  facility: string | null,
) {
  const kinds = timelineFilters.find((entry) => entry.value === filter)?.kinds ?? [];
  return entries.filter(
    (entry) => kinds.includes(entry.kind) && (facility === null || entry.facility === facility),
  );
}

const monthYear = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

/** Entries in runs of the same month ("October 2026"), keeping their order. */
export function groupByMonth(entries: TimelineEntry[]) {
  const groups: { label: string; entries: TimelineEntry[] }[] = [];
  for (const entry of entries) {
    const label = monthYear.format(new Date(entry.at));
    const last = groups.at(-1);
    if (last?.label === label) last.entries.push(entry);
    else groups.push({ label, entries: [entry] });
  }
  return groups;
}
