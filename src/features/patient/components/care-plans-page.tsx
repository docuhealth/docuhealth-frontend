import { FunnelSimpleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { Button } from "@/components/ui/button";
import { carePlansQuery } from "@/features/patient/api/pending";
import { CarePlanEmpty } from "@/features/patient/components/care-plan-empty";
import { CarePlanRow } from "@/features/patient/components/care-plan-row";
import { PageHeading } from "@/features/patient/components/page-heading";
import { RecordList, Segments } from "@/features/patient/components/patient-ui";
import { splitPlans } from "@/features/patient/lib/care-plans";
import { notYet } from "@/features/patient/lib/not-yet";

const back = { to: "/patient/health", label: "Back to Health" } as const;

/** The patient's care plans, running and ended. TODO(api): they come from `pending.ts`. */
export function CarePlansPage() {
  const { data, isError } = useQuery(carePlansQuery());
  const [tab, setTab] = useState<"active" | "ended">("active");
  const { active, ended } = splitPlans(data ?? []);
  const shown = tab === "active" ? active : ended;
  const loading = !data && !isError;
  const empty = !loading && active.length + ended.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Care plans"
        subtitle={
          loading
            ? null
            : empty
              ? "No care plans yet"
              : `${active.length} active · ${ended.length} ended`
        }
        back={back}
      />
      {loading ? (
        <ListSkeleton />
      ) : empty ? (
        <CarePlanEmpty
          title="No care plans yet"
          description="Any care plans created by your healthcare team will appear here."
        />
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <Segments
              label="Care plans"
              value={tab}
              onChange={setTab}
              options={[
                { value: "active", label: `Active (${active.length})` },
                { value: "ended", label: `Ended (${ended.length})` },
              ]}
            />
            {/* TODO(api): nothing to filter care plans by (facility, condition) yet. */}
            <Button
              variant="outline"
              size="icon-lg"
              aria-label="Filter care plans"
              className="shrink-0 bg-card"
              onClick={notYet("Filtering care plans")}
            >
              <FunnelSimpleIcon />
            </Button>
          </div>
          {shown.length === 0 ? (
            <CarePlanEmpty
              title={tab === "active" ? "No active care plans" : "No ended care plans"}
              description={
                tab === "active"
                  ? "Plans your healthcare team is running with you will show here."
                  : "Plans that are completed or stopped will show here."
              }
            />
          ) : (
            <RecordList label="Care plans">
              {shown.map((plan) => (
                <CarePlanRow key={plan.id} plan={plan} />
              ))}
            </RecordList>
          )}
        </>
      )}
    </div>
  );
}
