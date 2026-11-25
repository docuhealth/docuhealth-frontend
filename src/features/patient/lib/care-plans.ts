import type { CarePlan } from "@/features/patient/api/pending";
import { dated } from "@/features/patient/lib/dated";

const statuses: Record<CarePlan["status"], string> = {
  active: "Active",
  completed: "Completed",
  stopped: "Stopped",
};

/** "Active", "Completed", "Stopped". */
export const planStatusLabel = (plan: CarePlan) => statuses[plan.status];

/** Plans still running, and ones that ended (completed or stopped). */
export function splitPlans(plans: CarePlan[]) {
  return {
    active: plans.filter((plan) => plan.status === "active"),
    ended: plans.filter((plan) => plan.status !== "active"),
  };
}

/** A row's line: "ABC Hospital · Review 15 Dec 2026", or "LUTH · Ended 30 Aug 2026". */
export function planLine(plan: CarePlan) {
  const when =
    plan.status === "active"
      ? plan.nextReview && `Review ${dated(plan.nextReview)}`
      : plan.endedAt && `Ended ${dated(plan.endedAt)}`;
  return [plan.facility, when].filter(Boolean).join(" · ");
}

/** Under the title: "Set by Dr. Adaeze Okafor · ABC Hospital · Updated 25 Sep 2026". */
export function planByline(plan: CarePlan) {
  return [plan.setBy && `Set by ${plan.setBy}`, plan.facility, `Updated ${dated(plan.updatedAt)}`]
    .filter(Boolean)
    .join(" · ");
}

const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

/** The goal's latest reading: "Latest 128/80 on 25 Sep", or null with no reading. */
export function goalLatest(goal: NonNullable<CarePlan["goal"]>) {
  if (!goal.latest) return null;
  return goal.latestAt
    ? `Latest ${goal.latest} on ${dayMonth.format(new Date(goal.latestAt))}`
    : `Latest ${goal.latest}`;
}

/**
 * A plan item's line. A booked visit shows the next appointment's date ("15 Dec 2026 · Booked")
 * when there is one. TODO(api): plan items aren't linked to the appointment they're for.
 */
export function planItemLine(item: CarePlan["items"][number], nextAppointmentAt?: string | null) {
  if (item.kind === "visit" && nextAppointmentAt) {
    return `${dated(nextAppointmentAt)} · ${item.detail}`;
  }
  return item.detail;
}
