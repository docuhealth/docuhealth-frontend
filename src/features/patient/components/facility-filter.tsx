/** Chips to show one facility's records, or all of them (`null`). */
export function FacilityFilter({
  facilities,
  value,
  onChange,
}: {
  facilities: string[];
  value: string | null;
  onChange: (facility: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {[null, ...facilities].map((name) => (
        <button
          key={name ?? "all"}
          type="button"
          onClick={() => onChange(name)}
          aria-pressed={value === name}
          className={
            value === name
              ? "rounded-full bg-fg-heading px-4 py-2 type-body-sm-medium text-white"
              : "rounded-full bg-card px-4 py-2 type-body-sm-regular text-fg-heading ring-1 ring-line hover:ring-fg-caption/40"
          }
        >
          {name ?? "All facilities"}
        </button>
      ))}
    </div>
  );
}
