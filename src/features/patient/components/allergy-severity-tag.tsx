import type { Allergy } from "@/features/patient/api/pending";
import { severityLabel } from "@/features/patient/lib/allergies";
import { cn } from "@/lib/utils";

const tones: Record<Allergy["severity"], string> = {
  severe: "bg-error-100 text-error-700",
  moderate: "bg-warning-100 text-warning-700",
  mild: "bg-line text-fg-body",
};

/** "Severe" on red, "Moderate" on amber, "Mild" on grey, without a dot. */
export function AllergySeverityTag({ severity }: { severity: Allergy["severity"] }) {
  return (
    <span className={cn("rounded-md px-2 py-0.5 type-caption-semibold", tones[severity])}>
      {severityLabel(severity)}
    </span>
  );
}
