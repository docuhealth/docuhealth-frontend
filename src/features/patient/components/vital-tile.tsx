import { VitalIcon } from "@/features/patient/components/vital-icon";
import type { VitalKey, VitalNote } from "@/features/patient/lib/vitals";
import { cn } from "@/lib/utils";

const dots = {
  good: "bg-success-500",
  near: "bg-warning-500",
  watch: "bg-error-500",
  info: "bg-fg-caption",
};

const words = {
  good: "text-success-700",
  near: "text-warning-700",
  watch: "text-error-700",
  info: "text-fg-caption",
};

/** One vital sign's latest reading: its icon and name, value and unit, and a note if known. */
export function VitalTile({
  vital,
  label,
  value,
  unit,
  note,
}: {
  vital: VitalKey;
  label: string;
  value: string | null;
  unit: string;
  note: VitalNote | null;
}) {
  return (
    <li className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <span className="flex items-center gap-1.5 type-caption text-fg-caption">
        <VitalIcon vital={vital} className="size-3.5 shrink-0" />
        {label}
      </span>
      <p className="type-stat text-fg-heading">
        {value ?? "—"}{" "}
        {value != null && <span className="type-caption text-fg-caption">{unit}</span>}
      </p>
      <span className={cn("flex items-center gap-1.5 type-caption", words[note?.tone ?? "info"])}>
        {note ? (
          <>
            <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", dots[note.tone])} />
            {note.label}
          </>
        ) : (
          value == null && "Not recorded"
        )}
      </span>
    </li>
  );
}
