import { CaretLeftIcon } from "@phosphor-icons/react";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { Button } from "@/components/ui/button";
import type { Conversation } from "@/features/patient/api/pending-messages";
import { conversationLine } from "@/features/patient/lib/messages";
import { notYet } from "@/features/patient/lib/not-yet";

/** Who the chat is with, where, how soon they reply; on phones a way back to the chats. */
export function ConversationHeader({ chat, onBack }: { chat: Conversation; onBack: () => void }) {
  return (
    <header className="flex items-center gap-3 border-b px-4 py-3 sm:px-5">
      <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 lg:hidden">
        <CaretLeftIcon className="size-5" />
        <span className="sr-only">Back to chats</span>
      </Button>
      <PersonAvatar name={chat.name} src={chat.photo} />
      <div className="flex min-w-0 flex-1 flex-col">
        <h2 className="truncate type-body-sm-medium text-fg-heading">{chat.name}</h2>
        <p className="truncate type-caption text-fg-caption">{conversationLine(chat)}</p>
      </div>
      {/* TODO(api): no profile page for a patient's care team yet. */}
      <Button
        variant="outline"
        className="hidden h-10 px-4 sm:inline-flex"
        onClick={notYet("Profiles")}
      >
        View profile
      </Button>
    </header>
  );
}
