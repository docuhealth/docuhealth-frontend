import { Link } from "@tanstack/react-router";
import labResultIconUrl from "@/assets/svgs/lab-result.svg";
import medicationIconUrl from "@/assets/svgs/medication-pill.svg";
import radiologyIconUrl from "@/assets/svgs/radiology.svg";
import visitsIconUrl from "@/assets/svgs/visits.svg";
import vitalSignsIconUrl from "@/assets/svgs/vital-signs.svg";
import { Tag } from "@/features/patient/components/tag";
import type { TimelineEntry, TimelineKind } from "@/features/patient/lib/timeline";

const icons: Record<TimelineKind, string> = {
  result: labResultIconUrl,
  visit: visitsIconUrl,
  vital: vitalSignsIconUrl,
  medication: medicationIconUrl,
  imaging: radiologyIconUrl,
};

/**
 * One Timeline row: the record kind's icon, its title, a line about it and when and where,
 * "New" when fresh, opening the record's page. `joined` draws the thread down to the next row.
 */
export function TimelineRow({ entry, joined }: { entry: TimelineEntry; joined: boolean }) {
  return (
    <li className="relative">
      {joined && (
        // The thread between this row's icon and the next one's.
        <span aria-hidden className="absolute top-9.5 -bottom-2 left-[1.5625rem] w-px bg-line" />
      )}
      <Link
        to={entry.to}
        params={entry.params}
        className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface"
      >
        <img src={icons[entry.kind]} alt="" className="mt-0.5 size-5 shrink-0" />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate type-body-sm-medium text-fg-heading">{entry.title}</span>
          {entry.detail && (
            <span className="truncate type-caption text-fg-body">{entry.detail}</span>
          )}
          <span className="truncate type-caption text-fg-caption">{entry.meta}</span>
        </span>
        {entry.isNew && <Tag tone="success">New</Tag>}
      </Link>
    </li>
  );
}
