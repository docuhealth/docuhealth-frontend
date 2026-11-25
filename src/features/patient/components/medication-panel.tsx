import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The tinted panel of label / value rows inside a medicine's dialogs. */
export function MedicationPanel({
  rows,
  header,
  footer,
  className,
}: {
  rows: [string, ReactNode][];
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border border-info-100 bg-info-100/40 px-4 py-2",
        className,
      )}
    >
      {header}
      <dl className="flex flex-col divide-y divide-info-100">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 py-3">
            <dt className="type-body-sm-regular text-fg-caption">{label}</dt>
            <dd className="text-right type-body-sm-regular text-fg-heading">{value ?? "—"}</dd>
          </div>
        ))}
      </dl>
      {footer}
    </div>
  );
}
