import { ClipboardTextIcon } from "@phosphor-icons/react";

/** In place of a visit's notes when the facility shared none. */
export function VisitNoSummaryCard({
  facility,
  lab,
  hasResults,
}: {
  facility: string | null;
  lab: boolean;
  hasResults: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border bg-card px-6 py-8 text-center">
      <span className="grid size-12 place-content-center rounded-full bg-line text-fg-caption [&_svg]:size-6">
        <ClipboardTextIcon />
      </span>
      <p className="type-body-sm-medium text-fg-heading">No visit summary</p>
      <p className="max-w-110 type-body-sm-regular text-fg-body">
        {[
          `${facility ?? "The facility"} didn’t share notes for this visit.`,
          lab
            ? `This is normal for lab-only visits${hasResults ? " — your results are below." : "."}`
            : hasResults && "Your results are below.",
        ]
          .filter(Boolean)
          .join(" ")}
      </p>
    </div>
  );
}
