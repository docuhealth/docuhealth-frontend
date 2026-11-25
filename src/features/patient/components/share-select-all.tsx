import { Checkbox } from "@/components/ui/checkbox";
import { FieldLabel } from "@/components/ui/field";
import { type RecordPart, recordParts } from "@/features/patient/api/pending-sharing";

/** "Select all" beside the field's label: ticks every part, or clears them once all are ticked. */
export function ShareSelectAll({
  value,
  onChange,
}: {
  value: RecordPart[];
  onChange: (value: RecordPart[]) => void;
}) {
  const all = value.length === recordParts.length;
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="share-select-all"
        checked={all}
        onCheckedChange={() => onChange(all ? [] : [...recordParts])}
      />
      <FieldLabel htmlFor="share-select-all" className="type-caption-medium text-primary">
        Select all
      </FieldLabel>
    </div>
  );
}
