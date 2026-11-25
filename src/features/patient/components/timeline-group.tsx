import { DateDivider } from "@/features/patient/components/date-divider";
import { TimelineRow } from "@/features/patient/components/timeline-row";
import type { TimelineEntry } from "@/features/patient/lib/timeline";

/** A month of the Timeline: its label on a rule, then its records in one card, threaded. */
export function TimelineGroup({ label, entries }: { label: string; entries: TimelineEntry[] }) {
  return (
    <section aria-label={label} className="flex flex-col gap-3">
      <DateDivider>{label}</DateDivider>
      <ul className="flex flex-col divide-y rounded-xl border bg-card">
        {entries.map((entry, index) => (
          <TimelineRow key={entry.id} entry={entry} joined={index < entries.length - 1} />
        ))}
      </ul>
    </section>
  );
}
