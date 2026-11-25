import { ListDashesIcon, TabsIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/** How the Visits page lays its list out: by type in one list, or in Upcoming / Past tabs. */
export type VisitView = "list" | "tabs";

const views = [
  { value: "list", label: "One list, by type", icon: ListDashesIcon },
  { value: "tabs", label: "Upcoming and past tabs", icon: TabsIcon },
] as const;

/** Two icon buttons that switch the Visits page between its list and tab layouts. */
export function VisitViewSwitch({
  value,
  onChange,
}: {
  value: VisitView;
  onChange: (view: VisitView) => void;
}) {
  return (
    <fieldset className="flex shrink-0 rounded-md ring-1 ring-line">
      <legend className="sr-only">Show visits as</legend>
      {views.map(({ value: view, label, icon: Icon }) => (
        <button
          key={view}
          type="button"
          aria-label={label}
          title={label}
          aria-pressed={value === view}
          onClick={() => onChange(view)}
          className={cn(
            "grid size-9 place-content-center transition-colors first:rounded-l-md last:rounded-r-md [&_svg]:size-4.5",
            value === view
              ? "bg-surface text-fg-heading"
              : "bg-card text-fg-caption hover:text-fg-body",
          )}
        >
          <Icon />
        </button>
      ))}
    </fieldset>
  );
}
