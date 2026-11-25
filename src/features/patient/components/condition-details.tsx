import { BookOpenIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { carePlansQuery } from "@/features/patient/api/pending";
import { drugsQuery, vitalsQuery } from "@/features/patient/api/queries";
import { ConditionRelated } from "@/features/patient/components/condition-related";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { DetailRows, ReportChange, SectionLabel } from "@/features/patient/components/patient-ui";
import { Tag } from "@/features/patient/components/tag";
import { carePlanFor } from "@/features/patient/lib/conditions";
import { conditionsOf } from "@/features/patient/lib/records";
import { useVisits } from "@/features/patient/lib/use-visits";
import { formatDay } from "@/lib/format";

/** One diagnosis: what it means, when and where it was recorded, and what goes with it. */
export function ConditionDetails({ conditionId }: { conditionId: string }) {
  const { data, isError } = useVisits();
  const plans = useQuery(carePlansQuery());
  const drugs = useQuery(drugsQuery());
  const vitals = useQuery(vitalsQuery());
  const visit = data?.find((candidate) => candidate.id === conditionId);
  const condition = data ? conditionsOf(data).find((c) => c.id === conditionId) : undefined;
  const plan = carePlanFor(plans.data ?? [], conditionId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="View details"
        back={{ to: "/patient/health/conditions", label: "Back to Conditions" }}
      />
      {!data && !isError ? (
        <ListSkeleton />
      ) : !condition || !visit ? (
        <PatientEmpty
          icon={<BookOpenIcon />}
          title="Condition not found"
          description="It may have been removed from your record."
        />
      ) : (
        <>
          {/* TODO(api): no other name or ICD code for a diagnosis, for the line under it. */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card px-4 py-3">
            <h2 className="type-body-sm-tight-semibold text-fg-heading">{condition.name}</h2>
            {condition.active ? (
              <Tag tone="success">Active</Tag>
            ) : (
              <Tag tone="neutral">Resolved</Tag>
            )}
          </div>
          {/* TODO(api): no plain-language explanation of a diagnosis yet. */}
          <div className="flex flex-col gap-1 rounded-xl bg-info-100 px-4 py-3">
            <p className="type-body-sm-tight-semibold text-info-600">What this means</p>
            <p className="type-caption text-fg-body">
              Ask your doctor to explain this diagnosis and what it means for you at your next
              visit.
            </p>
          </div>
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <SectionLabel>Details</SectionLabel>
              <DetailRows
                rows={[
                  ["Diagnosed", formatDay(new Date(visit.at))],
                  ["Facility", visit.facility],
                  ["Clinician", visit.clinician?.name],
                  ["Visit", visit.complaint],
                ]}
              />
            </div>
            <div className="flex flex-col gap-2">
              <SectionLabel>Related</SectionLabel>
              <ConditionRelated
                name={condition.name}
                visit={visit}
                drugs={drugs.data ?? []}
                plan={plan}
                readings={vitals.data ?? []}
              />
            </div>
          </div>
        </>
      )}
      <ReportChange />
    </div>
  );
}
