import { type VitalStatus, statusTag, statusTone } from "@/features/patient/lib/vitals";
import { cn } from "@/lib/utils";

const tones = {
  good: "bg-success-100 text-success-700",
  near: "bg-warning-100 text-warning-700",
  watch: "bg-error-100 text-error-700",
};

/** A reading's status on a tint, like `Tag`: "Normal" green, "Elevated" amber, "High" red. */
export function VitalStatusTag({ status }: { status: VitalStatus }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-md px-2 py-0.5 type-caption-semibold",
        tones[statusTone(status)],
      )}
    >
      {statusTag(status)}
    </span>
  );
}
