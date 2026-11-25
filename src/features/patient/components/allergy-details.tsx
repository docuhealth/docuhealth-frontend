import { WarningCircleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { allergiesQuery } from "@/features/patient/api/pending";
import { AllergySeverityTag } from "@/features/patient/components/allergy-severity-tag";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { DetailRows, ReportChange, SectionLabel } from "@/features/patient/components/patient-ui";
import { allergyKindLine, severityLabel } from "@/features/patient/lib/allergies";
import { dated } from "@/features/patient/lib/dated";

/** One allergy: what to avoid, how it shows, who recorded it and the care team's note. */
export function AllergyDetails({ allergyId }: { allergyId: string }) {
  const { data, isError } = useQuery(allergiesQuery());
  const allergy = data?.find((candidate) => candidate.id === allergyId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="View details"
        back={{ to: "/patient/health/allergies", label: "Back to Allergies" }}
      />
      {!data && !isError ? (
        <ListSkeleton />
      ) : !allergy ? (
        <PatientEmpty
          icon={<WarningCircleIcon />}
          title="Allergy not found"
          description="It may have been removed from your record."
        />
      ) : (
        <>
          <div className="flex flex-col gap-0.5 rounded-xl border bg-card px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="type-title-sm text-fg-heading">{allergy.name}</p>
              <AllergySeverityTag severity={allergy.severity} />
            </div>
            <p className="type-caption text-fg-caption">{allergyKindLine(allergy)}</p>
          </div>
          {allergy.avoid && (
            <div className="rounded-xl bg-info-100 px-4 py-3">
              <p className="type-body-sm-medium text-info-500">What to avoid</p>
              <p className="type-body-sm-regular text-fg-body">{allergy.avoid}</p>
            </div>
          )}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="flex flex-col gap-2">
              <SectionLabel>Details</SectionLabel>
              <DetailRows
                rows={[
                  ["Reaction", allergy.reaction],
                  ["Severity", severityLabel(allergy.severity)],
                  ["First recorded", dated(allergy.at)],
                  ["Facility", allergy.facility],
                  ["Recorded by", allergy.recordedBy],
                ]}
              />
            </section>
            {allergy.note && (
              <section className="flex flex-col gap-2">
                <SectionLabel>Note from your care team</SectionLabel>
                <p className="rounded-xl border bg-card px-4 py-3 type-body-sm-regular text-fg-heading">
                  {allergy.note}
                </p>
              </section>
            )}
          </div>
          <ReportChange />
        </>
      )}
    </div>
  );
}
