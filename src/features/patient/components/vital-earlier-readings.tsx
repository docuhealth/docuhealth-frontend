import { CaretRightIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { VitalGroupDialog } from "@/features/patient/components/vital-group-dialog";
import type { ReadingGroup } from "@/features/patient/lib/vitals";
import { formatDay, plural } from "@/lib/format";

/**
 * "Earlier readings": a centred divider, then one row per day and facility, each opening that
 * day's readings in a dialog.
 */
export function VitalEarlierReadings({ groups }: { groups: ReadingGroup[] }) {
  const [open, setOpen] = useState<ReadingGroup | null>(null);
  return (
    <section aria-labelledby="earlier-readings" className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span aria-hidden className="h-px flex-1 bg-line" />
        <h2
          id="earlier-readings"
          className="type-caption-medium tracking-wide text-fg-caption uppercase"
        >
          Earlier readings
        </h2>
        <span aria-hidden className="h-px flex-1 bg-line" />
      </div>
      <ul className="flex flex-col divide-y rounded-xl border bg-card">
        {groups.map((group) => (
          <li key={group.key}>
            <button
              type="button"
              onClick={() => setOpen(group)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface"
            >
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate type-body-sm-medium text-fg-heading">
                  {formatDay(new Date(group.at))}
                </span>
                <span className="truncate type-caption text-fg-caption">
                  {[group.facility, plural(group.count, "reading")].filter(Boolean).join(" · ")}
                </span>
              </span>
              <CaretRightIcon className="size-4 shrink-0 text-fg-caption" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <VitalGroupDialog group={open} onClose={() => setOpen(null)} />
    </section>
  );
}
