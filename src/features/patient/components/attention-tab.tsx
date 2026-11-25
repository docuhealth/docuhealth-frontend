import type { Icon } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * One tab in "Needs your attention": an icon, what it is and its headline (e.g. "Recent Results"
 * over "Full Blood Count"), with how many are new in a green badge. `muted` draws one with nothing to open.
 */
export function AttentionTab({
  icon: TabIcon,
  label,
  value,
  newCount = 0,
  selected = false,
  muted = false,
  onSelect,
}: {
  icon: Icon;
  label: string;
  value: string;
  newCount?: number;
  selected?: boolean;
  muted?: boolean;
  onSelect?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  // Stepping with the arrows brings the chosen tab into view in the scrolling row.
  useEffect(() => {
    const tab = ref.current;
    const row = tab?.parentElement;
    if (!selected || !tab || !row) return;
    // Only the row scrolls, never the page.
    row.scrollTo?.({ left: tab.offsetLeft - row.offsetLeft, behavior: "smooth" });
  }, [selected]);
  const body = (
    <>
      <TabIcon className={cn("size-5 shrink-0", muted ? "text-fg-caption" : "text-fg-body")} />
      <span className="flex min-w-0 flex-col">
        <span className="flex items-center gap-1.5 type-caption text-fg-caption">
          {label}
          {newCount > 0 && (
            <>
              <span
                aria-hidden
                className="grid size-3.5 place-content-center rounded-full bg-success-700 text-[0.5625rem] leading-none font-semibold text-white"
              >
                {newCount}
              </span>
              <span className="sr-only">({newCount} new)</span>
            </>
          )}
        </span>
        <span
          className={cn(
            "truncate type-caption-medium",
            muted ? "text-fg-caption" : "text-fg-heading",
          )}
        >
          {value}
        </span>
      </span>
    </>
  );
  const className =
    "flex w-44 shrink-0 items-center gap-2 rounded-lg border border-transparent bg-card px-3 py-2 text-left";

  if (muted) return <div className={className}>{body}</div>;
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        className,
        "transition-colors",
        selected ? "border-primary" : "hover:border-fg-caption/40",
      )}
    >
      {body}
    </button>
  );
}
