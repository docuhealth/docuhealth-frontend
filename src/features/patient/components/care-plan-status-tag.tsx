import type { CarePlan } from "@/features/patient/api/pending";
import { Tag } from "@/features/patient/components/tag";
import { planStatusLabel } from "@/features/patient/lib/care-plans";

/** "Active" in green; "Completed" or "Stopped" in grey. */
export function CarePlanStatusTag({ plan }: { plan: CarePlan }) {
  return <Tag tone={plan.status === "active" ? "success" : "neutral"}>{planStatusLabel(plan)}</Tag>;
}
