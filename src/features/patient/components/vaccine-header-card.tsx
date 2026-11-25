import { ShareNetworkIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { notYet } from "@/features/patient/lib/not-yet";

/** The card atop the Immunization pages: a title and its tag, a line, and a share button. */
export function VaccineHeaderCard({
  title,
  tag,
  detail,
}: {
  title: string;
  tag?: ReactNode;
  detail: string | null;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="type-body-sm-medium text-fg-heading">{title}</h2>
          {tag}
        </div>
        {detail && <p className="type-caption text-fg-caption">{detail}</p>}
      </div>
      {/* TODO(api): nothing to share immunization records with yet. */}
      <button
        type="button"
        aria-label="Share"
        onClick={notYet("Sharing your vaccination record")}
        className="grid size-9 shrink-0 place-content-center rounded-md ring-1 ring-line transition-colors hover:bg-surface"
      >
        <ShareNetworkIcon className="size-4.5 text-fg-heading" />
      </button>
    </div>
  );
}
