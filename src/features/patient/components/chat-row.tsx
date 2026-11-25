import { PersonAvatar } from "@/components/dashboard/person-avatar";
import type { Conversation } from "@/features/patient/api/pending-messages";
import { chatTime } from "@/features/patient/lib/messages";
import { cn } from "@/lib/utils";

/** A chat in the list: avatar, name, last message, when, and how many are unread. */
export function ChatRow({
  chat,
  selected,
  onSelect,
}: {
  chat: Conversation;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected || undefined}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors",
          selected ? "bg-surface" : "hover:bg-surface",
        )}
      >
        <PersonAvatar name={chat.name} src={chat.photo} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center justify-between gap-2">
            <span className="truncate type-body-sm-medium text-fg-heading">{chat.name}</span>
            {chat.lastMessage && (
              <span className="shrink-0 type-caption text-fg-caption">
                {chatTime(chat.lastMessage.at)}
              </span>
            )}
          </span>
          <span className="flex items-center justify-between gap-2">
            <span className="truncate type-caption text-fg-body">
              {chat.lastMessage?.text ?? "No messages yet"}
            </span>
            {chat.unread > 0 && (
              <>
                <span
                  aria-hidden
                  className="grid size-4 shrink-0 place-content-center rounded-full bg-error-500 type-caption text-white"
                >
                  {chat.unread}
                </span>
                <span className="sr-only">{chat.unread} unread</span>
              </>
            )}
          </span>
        </span>
      </button>
    </li>
  );
}
