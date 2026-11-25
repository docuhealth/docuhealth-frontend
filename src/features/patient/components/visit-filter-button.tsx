import { FunnelSimpleIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/** The Visits page's button that shows or hides the facility filter. */
export function VisitFilterButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Filter by facility"
      aria-expanded={open}
      className={cn(
        "grid size-9 shrink-0 place-content-center rounded-md ring-1 ring-line transition-colors hover:bg-surface [&_svg]:size-4.5",
        open ? "bg-surface text-fg-heading" : "bg-card text-fg-body",
      )}
    >
      <FunnelSimpleIcon />
    </button>
  );
}
