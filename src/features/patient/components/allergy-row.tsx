import { WarningIcon } from "@phosphor-icons/react";
import type { Allergy } from "@/features/patient/api/pending";
import { AllergySeverityTag } from "@/features/patient/components/allergy-severity-tag";
import { RecordRow } from "@/features/patient/components/patient-ui";
import { allergyLine } from "@/features/patient/lib/allergies";
import { dated } from "@/features/patient/lib/dated";
import { cn } from "@/lib/utils";

const tiles: Record<Allergy["severity"], string> = {
  severe: "bg-error-100 text-error-500",
  moderate: "bg-warning-100 text-warning-500",
  mild: "bg-line text-fg-body",
};

/** One allergy: a warning tinted by how severe it is, what it is, and where it was recorded. */
export function AllergyRow({ allergy }: { allergy: Allergy }) {
  return (
    <RecordRow
      icon={
        <span
          className={cn("grid size-9 place-content-center rounded-md", tiles[allergy.severity])}
        >
          <WarningIcon />
        </span>
      }
      title={allergy.name}
      detail={allergyLine(allergy)}
      meta={[allergy.facility, dated(allergy.at)].filter(Boolean).join(" · ")}
      status={<AllergySeverityTag severity={allergy.severity} />}
      to="/patient/health/allergies/$allergyId"
      params={{ allergyId: allergy.id }}
    />
  );
}
