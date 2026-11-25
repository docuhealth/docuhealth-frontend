import type { CarePlan } from "@/features/patient/api/pending";
import { CarePlanStatusTag } from "@/features/patient/components/care-plan-status-tag";
import { RecordRow } from "@/features/patient/components/patient-ui";
import { planLine } from "@/features/patient/lib/care-plans";

/** One care plan: its name, where it's from and when it's reviewed or ended, and its status. */
export function CarePlanRow({ plan }: { plan: CarePlan }) {
  return (
    <RecordRow
      title={plan.name}
      detail={planLine(plan)}
      status={<CarePlanStatusTag plan={plan} />}
      to="/patient/health/care-plans/$planId"
      params={{ planId: plan.id }}
    />
  );
}
