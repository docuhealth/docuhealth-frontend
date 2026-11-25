import labResultIconUrl from "@/assets/svgs/lab-result.svg";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import type { Message } from "@/features/patient/api/pending-messages";
import { RelatedRow } from "@/features/patient/components/related-row";
import { messageMeta } from "@/features/patient/lib/messages";
import { cn } from "@/lib/utils";

/**
 * One message: theirs on the left in white with their avatar, the patient's on the right on a
 * tint with their own, and the time (and "Read") under it. A shared record shows as a card that
 * opens it.
 */
export function MessageBubble({
  message,
  author,
  me,
}: {
  message: Message;
  /** Who the chat is with. */
  author: { name: string; photo: string | null };
  /** The patient's name, for their avatar. */
  me: string;
}) {
  const mine = message.mine;
  return (
    <li className={cn("flex flex-col gap-1", mine ? "items-end" : "items-start")}>
      <div
        className={cn("flex max-w-[85%] items-end gap-2 sm:max-w-md", mine && "flex-row-reverse")}
      >
        <span className="shrink-0">
          <PersonAvatar name={mine ? me : author.name} src={mine ? null : author.photo} size="sm" />
        </span>
        {message.record ? (
          <ul className="min-w-56 overflow-hidden rounded-xl border bg-card">
            <RelatedRow
              icon={<img src={labResultIconUrl} alt="" />}
              tone="info"
              title={message.record.name}
              detail="Shared from your record"
              to="/patient/health/visits/$visitId"
              params={{ visitId: message.record.visitId }}
            />
          </ul>
        ) : (
          <p
            className={cn(
              "rounded-xl px-3 py-2 type-body-sm-regular whitespace-pre-wrap text-fg-heading",
              mine ? "bg-brand-50" : "border bg-card",
            )}
          >
            {message.text}
          </p>
        )}
      </div>
      <span className={cn("type-caption text-fg-caption", mine ? "pr-8" : "pl-8")}>
        {messageMeta(message)}
      </span>
    </li>
  );
}
