import type { DrugRecord, VisitSummary } from "@/features/patient/api/schemas";

/** One of the home page's "Needs your attention" tabs. */
export type AttentionItem =
  | { key: "results"; label: string; value: string; newCount: number; visit: VisitSummary }
  | { key: "medications"; label: string; value: string; newCount: number; drugs: DrugRecord[] }
  | { key: "prescription"; label: string; value: string; newCount: number; drug: DrugRecord };

const READY = new Set([
  "result_ready",
  "result_accepted_by_lab_admin",
  "result_accepted_by_doctor",
]);
const FRESH_DAYS = 14;

const isRecent = (at: string, now: Date) =>
  now.getTime() - new Date(at).getTime() < FRESH_DAYS * 24 * 60 * 60 * 1000;

/**
 * What the patient should look at: the latest visit's lab tests, the medicines they're on, and
 * their newest prescription. `newCount` (the badge on its tab) counts what's arrived in the last
 * two weeks: ready results, or the prescription itself. TODO(api): no patient bills yet, so no outstanding-bill tab.
 */
export function attentionItems(
  visits: VisitSummary[],
  drugs: DrugRecord[],
  now = new Date(),
): AttentionItem[] {
  const items: AttentionItem[] = [];
  const withTests = visits.find((visit) => visit.labTests.length > 0);
  if (withTests) {
    items.push({
      key: "results",
      label: "Recent Results",
      value: withTests.labTests[0]!.name,
      newCount: isRecent(withTests.at, now)
        ? withTests.labTests.filter((test) => test.status != null && READY.has(test.status)).length
        : 0,
      visit: withTests,
    });
  }
  const current = drugs.filter((drug) => drug.status === "ongoing");
  if (current.length) {
    items.push({
      key: "medications",
      label: "Medications",
      value: current[0]!.name,
      newCount: 0,
      drugs: current,
    });
  }
  const newest = drugs[0];
  if (newest) {
    items.push({
      key: "prescription",
      label: "New Prescription",
      value: newest.name,
      newCount: isRecent(newest.at, now) ? 1 : 0,
      drug: newest,
    });
  }
  return items;
}
