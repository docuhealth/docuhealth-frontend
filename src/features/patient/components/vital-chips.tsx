/** One chip per thing to chart, one chosen: the Trends pages' picker (vital signs, lab values). */
export function VitalChips<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  /** What the chips pick, for screen readers: "Vital sign". */
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="flex flex-wrap gap-2">
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={
            value === option.value
              ? "rounded-full bg-fg-heading px-4 py-2 type-body-sm-medium text-white"
              : "rounded-full bg-card px-4 py-2 type-body-sm-regular text-fg-heading ring-1 ring-line hover:ring-fg-caption/40"
          }
        >
          {option.label}
        </button>
      ))}
    </fieldset>
  );
}
