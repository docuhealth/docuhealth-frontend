import { HammerIcon } from "@phosphor-icons/react";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";

/** A section whose screens aren't built yet. */
export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeading title={title} />
      <PatientEmpty
        icon={<HammerIcon />}
        title="This section is on its way"
        description="It will appear here once its design is ready."
      />
    </div>
  );
}
