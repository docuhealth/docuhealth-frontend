import { SyringeIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { immunizationsQuery } from "@/features/patient/api/pending-immunizations";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { VaccineDetails } from "@/features/patient/components/vaccine-details";

/**
 * One vaccine: when the next dose is due (or that it's complete), its doses, and who gave the
 * last one. TODO(api): the records come from api/pending-immunizations.ts.
 */
export function ImmunizationDetails({ vaccineId }: { vaccineId: string }) {
  const { data, isError } = useQuery(immunizationsQuery());
  const vaccine = data?.find((candidate) => candidate.id === vaccineId);

  return (
    <div className="flex flex-col gap-4">
      <PageHeading
        title="Immunization"
        back={{ to: "/patient/health/immunizations", label: "Back to Immunization" }}
      />
      {!data && !isError ? (
        <ListSkeleton />
      ) : !vaccine ? (
        <PatientEmpty
          icon={<SyringeIcon />}
          title="Vaccine not found"
          description="It may have been removed from your record."
        />
      ) : (
        <VaccineDetails vaccine={vaccine} />
      )}
    </div>
  );
}
