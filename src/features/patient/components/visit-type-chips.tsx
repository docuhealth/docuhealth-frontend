import { FunnelSimpleIcon } from "@phosphor-icons/react";
import { type VisitFilter, visitFilters } from "@/features/patient/lib/visits";
import { cn } from "@/lib/utils";

/** "All visits / Outpatient / Admissions / Emergency" chips, and a button for more filters. */
export function VisitTypeChips({
  value,
  onChange,
  filtersOpen,
  onToggleFilters,
}: {
  value: VisitFilter;
  onChange: (filter: VisitFilter) => void;
  filtersOpen: boolean;
  onToggleFilters: () => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-1 flex-wrap gap-2">
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
      <button
        type="button"
        onClick={onToggleFilters}
        aria-label="Filter by facility"
        aria-expanded={filtersOpen}
        className={cn(
          "grid size-9 shrink-0 place-content-center rounded-md ring-1 ring-line transition-colors hover:bg-surface [&_svg]:size-4.5",
          filtersOpen ? "bg-surface text-fg-heading" : "bg-card text-fg-body",
        )}
      >
        <FunnelSimpleIcon />
      </button>
    </div>
  );
}
