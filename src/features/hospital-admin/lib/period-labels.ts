import type { Period } from "@/lib/period";

/** A period in a stat card's label, e.g. "Added this month". */
export const thisPeriodLabels = {
  today: "today",
  week: "this week",
  month: "this month",
} as const satisfies Record<Period, string>;

/** The period before, for a change, e.g. "+3 vs last month". */
export const previousPeriodLabels = {
  today: "yesterday",
  week: "last week",
  month: "last month",
} as const satisfies Record<Period, string>;
