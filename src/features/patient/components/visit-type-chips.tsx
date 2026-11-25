import { type VisitFilter, visitFilters } from "@/features/patient/lib/visits";

/** "All visits / Outpatient / Admissions / Emergency" chips. */
export function VisitTypeChips({
  value,
  onChange,
}: {
  value: VisitFilter;
  onChange: (filter: VisitFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {visitFilters.map((filter) => (
        <button
          key={filter.value}
          type="button"
          onClick={() => onChange(filter.value)}
          aria-pressed={value === filter.value}
          className={
            value === filter.value
              ? "rounded-full bg-fg-heading px-4 py-2 type-body-sm-medium text-white"
              : "rounded-full bg-card px-4 py-2 type-body-sm-regular text-fg-heading ring-1 ring-line hover:ring-fg-caption/40"
          }
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
