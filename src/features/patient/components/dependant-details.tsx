import { UserIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { dependantsQuery } from "@/features/patient/api/family";
import { dependantExtrasQuery } from "@/features/patient/api/pending-family";
import { DependantGrowthCard } from "@/features/patient/components/dependant-growth-card";
import { DependantVaccineDue } from "@/features/patient/components/dependant-vaccine-due";
import { FamilyDetailsDialog } from "@/features/patient/components/family-details-dialog";
import { FamilyProfileCard } from "@/features/patient/components/family-profile-card";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { dated } from "@/features/patient/lib/dated";
import { GENDERS, ageWords } from "@/features/patient/lib/family";

/** One dependant: who they are, the vaccines they're due, and how they're growing. */
export function DependantDetails({ hin }: { hin: string }) {
  const { data, isError } = useQuery(dependantsQuery());
  // TODO(api): photo, due vaccines and growth are pending data (api/pending-family.ts).
  const extras = useQuery(dependantExtrasQuery()).data ?? [];
  const [showDetails, setShowDetails] = useState(false);
  const dependant = data?.find((candidate) => candidate.hin === hin);
  const extra = extras.find((candidate) => candidate.hin === hin);
  const back = { to: "/patient/family" as const, label: "Back to Family & proxy" };

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title={dependant?.name ?? "Dependent"} back={back} />
      {!data && !isError ? (
        <ListSkeleton />
      ) : !dependant ? (
        <PatientEmpty
          icon={<UserIcon />}
          title="Dependent not found"
          description="They may no longer be linked to your account."
        />
      ) : (
        <>
          <FamilyProfileCard
            name={dependant.name}
            photoUrl={extra?.photoUrl}
            detail={`${ageWords(dependant.dob)} · HIN ${dependant.hin}`}
            onOpen={() => setShowDetails(true)}
          />
          {extra?.vaccinesDue.map((vaccine) => (
            <DependantVaccineDue
              key={vaccine.name}
              name={vaccine.name}
              dueBy={vaccine.dueBy}
              where={vaccine.where}
            />
          ))}
          <DependantGrowthCard name={dependant.firstName} growth={extra?.growth ?? null} />
          {showDetails && (
            <FamilyDetailsDialog
              title={dependant.name}
              description="Your dependent’s details."
              rows={[
                ["HIN", dependant.hin],
                ["Date of birth", dated(dependant.dob)],
                ["Age", ageWords(dependant.dob)],
                ["Gender", GENDERS[dependant.gender] ?? null],
              ]}
              onClose={() => setShowDetails(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
