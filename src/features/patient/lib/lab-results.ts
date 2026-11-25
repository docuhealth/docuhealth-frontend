import type { LabResult } from "@/features/patient/api/pending";

type Flag = LabResult["values"][number]["flag"];

const flagLabels: Record<Flag, string> = { normal: "Normal", high: "A little high", low: "Low" };

/** A result value's flag in plain words ("high" → "A little high"). */
export function flagLabel(flag: Flag) {
  return flagLabels[flag];
}

/** A test's results, summed up: "1 of 3 results slightly outside range" or all in range. */
export function rangeSummary(values: LabResult["values"]) {
  const outside = values.filter((value) => value.flag !== "normal").length;
  if (!values.length) return null;
  if (!outside) {
    return {
      label: values.length === 1 ? "In the normal range" : `All ${values.length} results in range`,
      outside: false,
    };
  }
  return {
    label: `${outside} of ${values.length} ${values.length === 1 ? "result" : "results"} slightly outside range`,
    outside: true,
  };
}

/** The values for one test at one visit, if the facility shared them. */
export function resultFor(results: LabResult[], visitId: string, test: string) {
  return results.find((result) => result.visitId === visitId && result.test === test) ?? null;
}

/** "₦40,000". */
export function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}
