import type { LabTest, ResultFlag, TestStage } from "@/features/lab-scientist/api/schemas";

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
 * half the range's width past an end is critical.
 */
export function flagFor(test: LabTest, value: number): ResultFlag {
  const margin = (test.referenceHigh - test.referenceLow) / 2;
  if (value < test.referenceLow) {
    return value < test.referenceLow - margin ? "critical_low" : "low";
  }
  if (value > test.referenceHigh) {
    return value > test.referenceHigh + margin ? "critical_high" : "high";
  }
  return "normal";
}

/** e.g. "13.0 – 17.0 g/dL". */
export function referenceRange(test: LabTest) {
  return `${test.referenceLow} – ${test.referenceHigh}${test.unit ? ` ${test.unit}` : ""}`;
}

/** e.g. "Haemoglobin, PCV" for the summary; the test's name alone when there's one. */
export function testNames(tests: LabTest[]) {
  return tests.map((test) => test.name).join(", ");
}
