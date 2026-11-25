import { type VitalKey, vitalKeys, vitalLabels } from "@/features/patient/lib/vitals";

/** One chip per vital sign, one chosen: the Trends page's picker. */
export function VitalChips({
  value,
  onChange,
}: {
  value: VitalKey;
  onChange: (vital: VitalKey) => void;
}) {
  return (
    <fieldset className="flex flex-wrap gap-2">
      <legend className="sr-only">Vital sign</legend>
      {vitalKeys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={value === key}
          className={
            value === key
              ? "rounded-full bg-fg-heading px-4 py-2 type-body-sm-medium text-white"
              : "rounded-full bg-card px-4 py-2 type-body-sm-regular text-fg-heading ring-1 ring-line hover:ring-fg-caption/40"
          }
        >
          {vitalLabels[key]}
        </button>
      ))}
    </fieldset>
  );
}
