import type { ReactNode } from "react";

/**
 * A headline number: label (with icon) on a white frame, then the value and a note in an inset
 * grey panel. Its `dt`/`dd` belong in a `<dl>`, which also lays the cards out.
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
    <div className="flex flex-col rounded-xl bg-card p-1 ring-1 ring-line">
      <dt className="flex items-center gap-2 px-3 py-2.5 type-caption text-fg-caption [&_svg]:size-4">
        {icon}
        {label}
      </dt>
      <dd className="flex flex-1 flex-col gap-3 rounded-lg rounded-t-none border bg-surface px-2.5 py-3">
        <span className="type-stat text-fg-heading">{value}</span>
        <span className="type-caption text-fg-caption">{note}</span>
      </dd>
    </div>
  );
}
