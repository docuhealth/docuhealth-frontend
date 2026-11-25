import { WarningCircleIcon } from "@phosphor-icons/react";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";

/** TODO(api): no allergy records for patients yet, so this is always the empty state. */
export function AllergiesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Allergies" subtitle="No allergies recorded" />
      <PatientEmpty
        icon={<WarningCircleIcon />}
        title="No allergies recorded"
        description="Allergies your facilities record will show here once DocuHealth can share them with you."
      />
    </div>
  );
}
