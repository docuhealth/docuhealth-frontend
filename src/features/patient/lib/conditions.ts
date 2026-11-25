import type { CarePlan } from "@/features/patient/api/pending";
import type { VitalReading } from "@/features/patient/api/schemas";
import type { Condition } from "@/features/patient/lib/records";
import { formatDay } from "@/lib/format";

// Working out the Conditions screens. TODO(api): conditions have no status, onset or code yet;
// they're the diagnoses of the patient's visits (lib/records.ts, conditionsOf).

const monthYear = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });

/** The line under a condition: "Since Nov 2025" while active, else the day it was recorded. */
export function conditionLine(condition: Condition) {
  const at = new Date(condition.at);
  return condition.active ? `Since ${monthYear.format(at)}` : formatDay(at);
}

/** The care plan set for a condition, if any. */
export function carePlanFor(plans: CarePlan[], conditionId: string) {
  return plans.find((plan) => plan.conditionId === conditionId) ?? null;
}

/** "Care plan · goal under 128/80", or just "Care plan". */
export function carePlanLine(plan: CarePlan) {
  return plan.goal ? `Care plan · goal under ${plan.goal.target}` : "Care plan";
}

/** Whether blood pressure is worth showing with a condition: its plan aims at it, or its name. */
export function tracksBloodPressure(name: string, plan: CarePlan | null) {
  return plan?.goal?.unit === "mmHg" || /blood pressure|hypertension/i.test(name);
}

/** The newest reading with a blood pressure. */
export function latestBloodPressure(readings: VitalReading[]) {
  return (
    readings
      .filter((reading) => reading.bloodPressure)
      .toSorted((a, b) => b.at.localeCompare(a.at))[0] ?? null
  );
}

/** "Latest · 25 Sep 2026 · within target" (the target from the plan's goal, when it has one). */
export function bloodPressureLine(reading: VitalReading, plan: CarePlan | null) {
  const target = plan?.goal ? (plan.goal.onTrack ? "within target" : "above target") : null;
  return ["Latest", formatDay(new Date(reading.at)), target].filter(Boolean).join(" · ");
}
