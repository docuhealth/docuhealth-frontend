import {
  CalendarDotsIcon,
  CaretRightIcon,
  ChatsIcon,
  ClockIcon,
  FileTextIcon,
  type Icon,
  ReceiptIcon,
  ShareNetworkIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { POWERS, type Power, type ProxyGrant } from "@/features/patient/api/family";
import { ProxyReviewDialog } from "@/features/patient/components/proxy-review-dialog";
import { Tag } from "@/features/patient/components/tag";
import { accessLine, powerInfo, requestExpiry } from "@/features/patient/lib/family";

const icons: Record<Power, Icon> = {
  view: FileTextIcon,
  book: CalendarDotsIcon,
  message: ChatsIcon,
  pay: ReceiptIcon,
  manage: UserIcon,
  share: ShareNetworkIcon,
};

/**
 * The home page's proxy request: who wants the patient as their proxy, what they'd be able to
 * do and until when, and "Review request" to accept or decline.
 */
export function ProxyRequestPanel({ grant }: { grant: ProxyGrant }) {
  const [reviewing, setReviewing] = useState(false);
  const [now] = useState(() => new Date());
  const title = `${grant.grantedBy.name} wants to add you as a proxy`;

  return (
    <div role="tabpanel" aria-label={title} className="flex flex-col rounded-xl border bg-card">
      <div className="mx-5 flex items-start gap-3 border-b py-5">
        <span className="grid size-12 shrink-0 place-content-center rounded-lg bg-warning-100 text-warning-700">
          <UserIcon className="size-6" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="type-title-sm text-fg-heading">{title}</p>
          <p className="type-caption text-fg-caption">
            {[grant.relationship, requestExpiry(grant, now)].filter(Boolean).join(" · ")}
          </p>
        </div>
        <Tag tone="brand">Request</Tag>
      </div>
      <div className="mx-5 flex flex-col gap-3 border-b py-4">
        <p className="type-body-sm-regular text-fg-body">If you accept, you’ll be able to:</p>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {POWERS.filter((power) => grant.powers.includes(power)).map((power) => {
            const PowerIcon = icons[power];
            return (
              <li
                key={power}
                className="flex items-center gap-2 rounded-md bg-surface px-3 py-2 type-caption-medium text-fg-heading"
              >
                <PowerIcon className="size-4 shrink-0 text-fg-body" aria-hidden />
                {powerInfo[power].name}
              </li>
            );
          })}
        </ul>
        <p className="flex items-center gap-1.5 type-caption text-fg-caption">
          <ClockIcon className="size-3.5" aria-hidden />
          {accessLine(grant, now)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setReviewing(true)}
        className="flex items-center gap-1 self-start px-5 py-4 type-body-sm-medium text-fg-body hover:text-primary"
      >
        Review request
        <CaretRightIcon className="size-3.5" aria-hidden />
      </button>
      {reviewing && <ProxyReviewDialog grant={grant} onClose={() => setReviewing(false)} />}
    </div>
  );
}
