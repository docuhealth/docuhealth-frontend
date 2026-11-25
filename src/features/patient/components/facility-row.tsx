import { CalendarBlankIcon, CaretRightIcon, FileTextIcon, MapPinIcon } from "@phosphor-icons/react";
import { FacilityTile } from "@/features/patient/components/facility-tile";
import type { FacilityView } from "@/features/patient/lib/facilities";
import { notYet } from "@/features/patient/lib/not-yet";
import { formatDayMonth, plural } from "@/lib/format";

/** One facility: photo or initials, name, where it is, the last visit and how many records. */
export function FacilityRow({ facility }: { facility: FacilityView }) {
  return (
    <li>
      {/* TODO(design): no page for one facility yet. */}
      <button
        type="button"
        onClick={notYet("A facility’s page")}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface"
      >
        <FacilityTile name={facility.name} photoUrl={facility.photoUrl} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate type-body-sm-medium text-fg-heading">{facility.name}</span>
          {facility.location && (
            <span className="flex items-center gap-1 type-caption text-fg-caption">
              <MapPinIcon aria-hidden className="size-3.5 shrink-0" />
              <span className="truncate">{facility.location}</span>
            </span>
          )}
          <span className="flex flex-wrap items-center gap-x-1.5 type-caption text-fg-caption">
            <span className="flex items-center gap-1">
              <CalendarBlankIcon aria-hidden className="size-3.5 shrink-0" />
              {facility.lastVisit
                ? `Last visit ${formatDayMonth(new Date(facility.lastVisit))}`
                : "No visits yet"}
            </span>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1">
              <FileTextIcon aria-hidden className="size-3.5 shrink-0" />
              {plural(facility.records, "record")}
            </span>
          </span>
        </span>
        <CaretRightIcon aria-hidden className="mt-1 size-4 shrink-0 text-fg-caption" />
      </button>
    </li>
  );
}
