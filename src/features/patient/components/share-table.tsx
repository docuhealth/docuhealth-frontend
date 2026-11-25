import { useState } from "react";
import type { Share } from "@/features/patient/api/pending-sharing";
import { ShareFacilityIcon } from "@/features/patient/components/share-facility-icon";
import { ShareStatusTag } from "@/features/patient/components/share-status-tag";
import { facilityLabel, sharedItems, shareStatus } from "@/features/patient/lib/sharing";
import { formatDay } from "@/lib/format";

/**
 * The patient's shares: who with, what, until when, and a way to stop each running one. A table
 * from tablet width; on phones each row stacks (same markup, so one list for screen readers).
 */
export function ShareTable({
  shares,
  onStop,
}: {
  shares: Share[];
  onStop: (share: Share) => void;
}) {
  // Statuses as of when the table opened.
  const [now] = useState(() => new Date());
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <table className="w-full max-sm:block">
        <thead className="bg-surface max-sm:hidden">
          <tr className="text-left type-caption-medium text-fg-body">
            <th scope="col" className="px-4 py-3 font-[inherit]">
              Shared with
            </th>
            <th scope="col" className="px-4 py-3 font-[inherit]">
              What’s shared
            </th>
            <th scope="col" className="px-4 py-3 font-[inherit]">
              Expires
            </th>
            <th scope="col" className="px-4 py-3 font-[inherit]">
              Status
            </th>
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y max-sm:block">
          {shares.map((share) => {
            const status = shareStatus(share, now);
            return (
              <tr
                key={share.id}
                aria-label={share.recipient.name}
                className="max-sm:flex max-sm:flex-wrap max-sm:items-center max-sm:gap-x-3 max-sm:gap-y-2 max-sm:p-4"
              >
                <td className="px-4 py-3 max-sm:w-full max-sm:p-0">
                  <div className="flex items-center gap-3">
                    <ShareFacilityIcon />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate type-body-sm-medium text-fg-heading">
                        {share.recipient.name}
                      </span>
                      <span className="truncate type-caption text-fg-caption">
                        {facilityLabel(share.facility)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 type-body-sm-regular text-fg-body max-sm:w-full max-sm:p-0 max-sm:pl-12">
                  <span className="type-caption text-fg-caption sm:hidden">Shared: </span>
                  {sharedItems(share.items)}
                </td>
                <td className="px-4 py-3 type-body-sm-regular whitespace-nowrap text-fg-body max-sm:p-0 max-sm:pl-12">
                  <span className="type-caption text-fg-caption sm:hidden">
                    {status === "ended" ? "Ended " : "Expires "}
                  </span>
                  {formatDay(new Date(share.stoppedAt ?? share.expiresAt))}
                </td>
                <td className="px-4 py-3 max-sm:p-0">
                  <ShareStatusTag status={status} />
                </td>
                <td className="px-4 py-3 text-right max-sm:ml-auto max-sm:p-0">
                  {status !== "ended" && (
                    <button
                      type="button"
                      onClick={() => onStop(share)}
                      aria-label={`Stop sharing with ${share.recipient.name}`}
                      className="type-body-sm-medium whitespace-nowrap text-primary hover:underline"
                    >
                      Stop sharing
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
