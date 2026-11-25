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

/**
 * One vital sign's latest reading: its icon and name on the card, and the value, unit and note on
 * a grey panel inside it.
 */
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
    <li className="flex flex-col rounded-xl border bg-card p-1">
      <span className="flex items-center gap-1.5 px-3 pt-2 pb-2.5 type-caption text-fg-caption">
        <VitalIcon vital={vital} className="size-4 shrink-0" />
        {label}
      </span>
      <div className="flex flex-1 flex-col gap-2.5 rounded-lg bg-surface px-3 py-3.5">
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
      </div>
    </li>
  );
}
