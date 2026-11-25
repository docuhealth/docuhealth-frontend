import type { ReadingNote } from "@/features/patient/lib/records";

/** One vital sign's latest reading: its name, value and unit, and how it sits if known. */
export function VitalTile({
  label,
  value,
  unit,
  note,
}: {
  label: string;
  value: number | string | null;
  unit: string;
  note: ReadingNote | null;
}) {
  return (
    <li className="flex flex-col gap-2 rounded-xl border bg-card p-4">
      <span className="type-caption text-fg-caption">{label}</span>
      <p className="type-title-lg text-fg-heading">
        {value ?? "-"} <span className="type-caption text-fg-caption">{unit}</span>
      </p>
      {note && (
        <span
          className={
            note.tone === "good" ? "type-caption text-success-500" : "type-caption text-warning-500"
          }
        >
          • {note.label}
        </span>
      )}
    </li>
  );
}
