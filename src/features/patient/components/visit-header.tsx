import { DownloadSimpleIcon } from "@phosphor-icons/react";
import type { VisitSummary } from "@/features/patient/api/schemas";
import { Tag } from "@/features/patient/components/tag";
import { notYet } from "@/features/patient/lib/not-yet";
import { formatDateCommaTime, formatDay } from "@/lib/format";

/** A visit's title, when and where, a "No summary" tag when nothing was shared, and download. */
export function VisitHeader({
  visit,
  title,
  summary,
}: {
  visit: VisitSummary;
  title: string;
  summary: boolean;
}) {
  const at = new Date(visit.at);
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="type-title-sm text-fg-heading">{title}</h2>
          {!summary && <Tag tone="neutral">No summary</Tag>}
        </div>
        <p className="type-caption text-fg-caption">
          {[
            summary ? formatDateCommaTime(at) : formatDay(at),
            visit.facility,
            visit.clinician?.name,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      {summary && (
        // TODO(api): no visit summary download for patients yet.
        <button
          type="button"
          aria-label="Download visit summary"
          onClick={notYet("Downloading a visit summary")}
          className="grid size-9 shrink-0 place-content-center rounded-md bg-card text-fg-body ring-1 ring-line transition-colors hover:bg-surface [&_svg]:size-4.5"
        >
          <DownloadSimpleIcon />
        </button>
      )}
    </div>
  );
}
