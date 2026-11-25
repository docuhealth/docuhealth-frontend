import { HeartIcon, PlusIcon } from "@phosphor-icons/react";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";

/** TODO(api): care plans can't be read by patients yet, so this is always the empty state. */
export function CarePlansPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Care plans" subtitle="No care plans yet" />
      <PatientEmpty
        icon={
          <span className="relative">
            <HeartIcon />
            <PlusIcon className="absolute inset-0 m-auto size-3!" />
          </span>
        }
        title="No care plans yet"
        description="Any care plans created by your healthcare team will appear here."
      />
    </div>
  );
}
