import { pdfFileName } from "@/lib/export-element";
import type {
  LabTest,
  ResultFlag,
  TestOrder,
  TestStage,
} from "@/features/lab-scientist/api/schemas";

/** Each stage's color, shared by its pill and the order page's status card. */
export const stageTones = {
  pending: "warning",
  in_progress: "info",
  completed: "success",
  rejected: "error",
} as const satisfies Record<TestStage, "warning" | "info" | "success" | "error">;

/** Where an order stands, in a word. */
export const stageStatusLabels = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  rejected: "Rejected",
} as const satisfies Record<TestStage, string>;

/**
 * How `value` compares with the test's reference range: outside it is low or high, and more than
 * half the range's width past an end is critical. `null` when the test has no numeric range.
 */
export function flagFor(test: LabTest, value: number): ResultFlag | null {
  const { referenceLow: low, referenceHigh: high } = test;
  if (low === null || high === null) return null;
  const margin = (high - low) / 2;
  if (value < low) return value < low - margin ? "critical_low" : "low";
  if (value > high) return value > high + margin ? "critical_high" : "high";
  return "normal";
}

/** e.g. "13.0 – 17.0 g/dL", or the test's own wording when its range isn't numeric. */
export function referenceRange(test: LabTest) {
  const unit = test.unit ? ` ${test.unit}` : "";
  if (test.referenceLow !== null && test.referenceHigh !== null) {
    return `${test.referenceLow} – ${test.referenceHigh}${unit}`;
  }
  if (test.referenceLow !== null) return `≥ ${test.referenceLow}${unit}`;
  if (test.referenceHigh !== null) return `≤ ${test.referenceHigh}${unit}`;
  return test.referenceText ?? "—";
}

/** e.g. "Haemoglobin, PCV" for the summary; the test's name alone when there's one. */
export function testNames(tests: LabTest[]) {
  return tests.map((test) => test.name).join(", ");
}

/** The order's tests whose result waits for the lab admin. */
export const resultsAwaitingReview = (order: TestOrder) =>
  order.items.filter((item) => item.status === "result_ready");

/**
 * Why the order's results can't be printed or downloaded; `null` when they can. As in v1, only
 * results that are in can leave: every test has one (awaiting the lab admin, or approved), never
 * a pending, in-progress, sample-collected or rejected order.
 */
export function resultExportBlocker(order: TestOrder): string | null {
  if (order.stage !== "completed") return "Results can be printed once every test has one.";
  if (!order.result) return "The results aren’t in yet.";
  return null;
}

/** The PDF's name: patient, tests and hospital, e.g. "ada_obi_full_blood_count_luth.pdf". */
export function resultFileName(order: TestOrder) {
  const tests = [
    ...new Set(order.items.filter((item) => item.status !== "rejected").map((item) => item.name)),
  ];
  return pdfFileName(order.patient.name, tests.join(" ") || "lab test", order.provider.name);
}

/** Where a test's result stands in its review, for the official report. */
export const resultReviewLabels: Record<string, string> = {
  result_ready: "Result ready",
  result_accepted_by_lab_admin: "Approved by the lab",
  result_accepted_by_doctor: "Approved by the doctor",
};
