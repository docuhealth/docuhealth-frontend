import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * An appointment's facts as label-over-value pairs in a white card, one column (Details) or two
 * (a booking's summary, a cancelled one's).
 */
export function AppointmentFacts({
  label,
  facts,
  columns = 1,
}: {
  label: string;
  facts: [string, ReactNode][];
  columns?: 1 | 2;
}) {
  return (
    <dl
      aria-label={label}
      className={cn(
        "grid gap-x-6 rounded-xl border bg-card px-4 py-1",
        columns === 2 && "sm:grid-cols-2",
      )}
    >
      {facts.map(([name, value]) => (
        <div
          key={name}
          className={cn(
            "flex flex-col gap-1 border-b py-3 last:border-b-0",
            // Two columns: the last row has no rule under it either.
            columns === 2 && "sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0",
          )}
        >
          <dt className="type-caption text-fg-caption">{name}</dt>
          <dd className="type-body-sm-medium text-fg-heading">{value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
