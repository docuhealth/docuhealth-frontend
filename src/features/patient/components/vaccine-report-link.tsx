import { FlagIcon } from "@phosphor-icons/react";
import { notYet } from "@/features/patient/lib/not-yet";

/** "Something not right? Report it", in red. TODO(api): nowhere to send a correction yet. */
export function VaccineReportLink() {
  return (
    <button
      type="button"
      onClick={notYet("Reporting a problem with a vaccination record")}
      className="mx-auto flex items-center gap-1.5 type-caption-medium text-error-500 hover:underline"
    >
      <FlagIcon aria-hidden className="size-4" />
      Something not right? Report it
    </button>
  );
}
