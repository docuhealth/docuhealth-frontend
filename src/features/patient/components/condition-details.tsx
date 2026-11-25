import { BookOpenIcon } from "@phosphor-icons/react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { StatusPill } from "@/components/dashboard/status-pill";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import {
  DetailRows,
  RecordList,
  RecordRow,
  ReportChange,
  SectionLabel,
} from "@/features/patient/components/patient-ui";
import { dated } from "@/features/patient/lib/dated";
import { conditionsOf } from "@/features/patient/lib/records";
import { useVisits } from "@/features/patient/lib/use-visits";

/** One diagnosis: when and where it was recorded, by whom, and at which visit. */
export function ConditionDetails({ conditionId }: { conditionId: string }) {
  const { data } = useVisits();
  const visit = data?.find((candidate) => candidate.id === conditionId);
  const condition = data ? conditionsOf(data).find((c) => c.id === conditionId) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="View details"
        back={{ to: "/patient/health/conditions", label: "Back to Conditions" }}
      />
      {!data ? (
        <ListSkeleton />
      ) : !condition || !visit ? (
        <PatientEmpty
          icon={<BookOpenIcon />}
          title="Condition not found"
          description="It may have been removed from your record."
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card px-4 py-3">
            <p className="type-title-sm text-fg-heading">{condition.name}</p>
            <StatusPill tone={condition.active ? "success" : "neutral"}>
              {condition.active ? "Active" : "Resolved"}
            </StatusPill>
          </div>
          {/* TODO(api): no plain-language explanation of a diagnosis yet. */}
          <div className="rounded-xl bg-info-100 px-4 py-3">
            <p className="type-body-sm-medium text-info-500">What this means</p>
            <p className="type-body-sm-regular text-fg-body">
              Ask your doctor to explain this diagnosis at your next visit.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <SectionLabel>Details</SectionLabel>
              <DetailRows
                rows={[
                  ["Diagnosed", dated(visit.at)],
                  ["Facility", visit.facility],
                  ["Clinician", visit.clinician?.name],
                  ["Visit", visit.complaint],
                ]}
              />
            </div>
            <div className="flex flex-col gap-2">
              <SectionLabel>Related</SectionLabel>
              {visit.drugs.length ? (
                <RecordList label="Related">
                  {visit.drugs.map((drug) => (
                    <RecordRow key={drug.name} title={drug.name} detail="Medication" />
                  ))}
                </RecordList>
              ) : (
                <p className="rounded-xl border bg-card px-4 py-3 type-body-sm-regular text-fg-caption">
                  Nothing else recorded with this diagnosis.
                </p>
              )}
            </div>
          </div>
        </>
      )}
      <ReportChange />
    </div>
  );
}
