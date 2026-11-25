import { ShareNetworkIcon } from "@phosphor-icons/react";
import { notYet } from "@/features/patient/lib/not-yet";

/** The round share button on a test's or a value's page. TODO(api): no sharing for patients yet. */
export function ResultShareButton() {
  return (
    <button
      type="button"
      aria-label="Share"
      onClick={notYet("Sharing results")}
      className="grid size-9 shrink-0 place-content-center rounded-full bg-card text-fg-heading ring-1 ring-line hover:ring-fg-caption/40"
    >
      <ShareNetworkIcon className="size-4" />
    </button>
  );
}
