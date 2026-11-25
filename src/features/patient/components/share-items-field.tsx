import { Checkbox } from "@/components/ui/checkbox";
import { type RecordPart, recordParts } from "@/features/patient/api/pending-sharing";
import { recordPartLabels } from "@/features/patient/lib/sharing";
import { cn } from "@/lib/utils";

/** The parts of the record to share, as checkbox chips. */
export function ShareItemsField({
  value,
  invalid,
  onChange,
}: {
  value: RecordPart[];
  invalid: boolean;
  onChange: (value: RecordPart[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {recordParts.map((part) => {
        const checked = value.includes(part);
        return (
          <label
            key={part}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 type-caption-medium ring-1 transition-colors",
              checked
                ? "bg-brand-50 text-primary ring-primary"
                : "bg-card text-fg-caption ring-line hover:ring-fg-caption/40",
              invalid && !checked && "ring-destructive/50",
            )}
          >
            <Checkbox
              checked={checked}
              onCheckedChange={(on) =>
                onChange(
                  on
                    ? recordParts.filter((each) => each === part || value.includes(each))
                    : value.filter((each) => each !== part),
                )
              }
            />
            {recordPartLabels[part]}
          </label>
        );
      })}
    </div>
  );
}
