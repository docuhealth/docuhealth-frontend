import { ShareNetworkIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { Button } from "@/components/ui/button";
import { carePlansQuery } from "@/features/patient/api/pending";
import { appointmentsQuery } from "@/features/patient/api/queries";
import { CarePlanEmpty } from "@/features/patient/components/care-plan-empty";
import { CarePlanGoalCard } from "@/features/patient/components/care-plan-goal-card";
import { CarePlanStatusTag } from "@/features/patient/components/care-plan-status-tag";
import { PageHeading } from "@/features/patient/components/page-heading";
import { DetailRows, RecordList, SectionLabel } from "@/features/patient/components/patient-ui";
import { PlanItemRow } from "@/features/patient/components/plan-item-row";
import { planByline, planItemLine } from "@/features/patient/lib/care-plans";
import { dated } from "@/features/patient/lib/dated";
import { notYet } from "@/features/patient/lib/not-yet";
import { nextAppointment } from "@/features/patient/lib/records";

/** One care plan: its goal, what's in it, and when it started and is next reviewed. */
export function CarePlanDetails({ planId }: { planId: string }) {
  const { data, isError } = useQuery(carePlansQuery());
  const { data: appointments } = useQuery(appointmentsQuery());
  const plan = data?.find((candidate) => candidate.id === planId);
  const next = appointments ? nextAppointment(appointments) : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="View details"
        back={{ to: "/patient/health/care-plans", label: "Back to Care plans" }}
      />
      {!data && !isError ? (
        <ListSkeleton />
      ) : !plan ? (
        <CarePlanEmpty
          title="Care plan not found"
          description="It may have been removed from your record."
        />
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="type-title-sm text-fg-heading">{plan.name}</h2>
                <CarePlanStatusTag plan={plan} />
              </div>
              <p className="type-caption text-fg-caption">{planByline(plan)}</p>
            </div>
            {/* TODO(api): no way to share a care plan yet. */}
            <Button
              variant="outline"
              size="icon-lg"
              aria-label="Share care plan"
              className="shrink-0 bg-card"
              onClick={notYet("Sharing a care plan")}
            >
              <ShareNetworkIcon />
            </Button>
          </div>
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              {plan.goal && <CarePlanGoalCard goal={plan.goal} />}
              {plan.items.length > 0 && (
                <section className="flex flex-col gap-2">
                  <SectionLabel>What’s in your plan</SectionLabel>
                  <RecordList label="What’s in your plan">
                    {plan.items.map((item) => (
                      <PlanItemRow
                        key={`${item.kind}-${item.title}`}
                        kind={item.kind}
                        title={item.title}
                        detail={planItemLine(item, next?.at)}
                      />
                    ))}
                  </RecordList>
                </section>
              )}
            </div>
            <DetailRows
              rows={[
                ["Started", dated(plan.startedAt)],
                plan.status === "active"
                  ? ["Next review", plan.nextReview && dated(plan.nextReview)]
                  : ["Ended", plan.endedAt && dated(plan.endedAt)],
                ["Care team", plan.careTeam],
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
}
