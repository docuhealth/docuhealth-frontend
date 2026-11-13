import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The cards' row: two across on phones and tablets, four on wide screens. Pass `className` to
 * change that, e.g. `grid-cols-1 sm:grid-cols-2` when the values are long (dates, names).
 */
export function StatGrid({ className, ...props }: ComponentProps<"dl">) {
  return <dl className={cn("grid grid-cols-2 gap-4 xl:grid-cols-4", className)} {...props} />;
}

/**
 * A headline number (or short value): label with icon on a white frame, then the value and a
 * note in an inset grey panel. Used on every dashboard and detail page. It renders a `dt`/`dd`
 * pair, so put it in a `StatGrid` (or `StatBanner`). `value` can carry its own styling, e.g. a
 * status dot in the status color, or a muted "N/A".
 */
export function StatCard({
  icon,
  label,
  value,
  note,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  note: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col rounded-xl bg-card p-1 ring-1 ring-line">
      <dt className="flex items-center gap-2 px-3 py-2.5 type-caption text-fg-caption [&_svg]:size-4 [&_svg]:shrink-0">
        {icon}
        {label}
      </dt>
      <dd className="flex min-w-0 flex-1 flex-col gap-3 rounded-lg rounded-t-none border bg-surface px-2.5 py-3">
        {/* One line: a long value (e.g. a name) is cut with an ellipsis rather than wrapping. */}
        <span className="truncate type-stat text-fg-heading">{value}</span>
        <span className="type-caption text-fg-caption">{note}</span>
      </dd>
    </div>
  );
}
