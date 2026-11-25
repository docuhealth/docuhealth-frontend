import { HeartIcon, PlusIcon } from "@phosphor-icons/react";
import { PatientEmpty } from "@/features/patient/components/patient-empty";

/** The care plans' "nothing here": a heart with a plus. */
export function CarePlanEmpty({ title, description }: { title: string; description: string }) {
  return (
    <PatientEmpty
      icon={
        <span className="relative">
          <HeartIcon />
          <PlusIcon className="absolute inset-0 m-auto size-3!" />
        </span>
      }
      title={title}
      description={description}
    />
  );
}
