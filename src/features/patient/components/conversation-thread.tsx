import { useEffect, useRef } from "react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import type { Conversation, Message } from "@/features/patient/api/pending-messages";
import { MessageBubble } from "@/features/patient/components/message-bubble";
import { messagesByDay } from "@/features/patient/lib/messages";

/** A chat's messages by day ("Today" on a chip), scrolled to the newest. */
export function ConversationThread({
  chat,
  messages,
  me,
}: {
  chat: Conversation;
  /** `undefined` while loading. */
  messages: Message[] | undefined;
  me: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const count = messages?.length ?? 0;
  useEffect(() => {
    const element = scroller.current;
    if (element && count > 0) element.scrollTop = element.scrollHeight;
  }, [chat.id, count]);

  return (
    <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto bg-background p-4 sm:p-6">
      {!messages ? (
        <ListSkeleton />
      ) : messages.length === 0 ? (
        <p className="py-10 text-center type-body-sm-regular text-fg-caption">
          No messages yet. Say hello to {chat.name}.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {messagesByDay(messages).map((day) => (
            <section key={day.label} aria-label={day.label} className="flex flex-col gap-4">
              <span className="self-center rounded-full bg-line px-3 py-0.5 type-caption-medium text-fg-body">
                {day.label}
              </span>
              <ol className="flex flex-col gap-4">
                {day.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} author={chat} me={me} />
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
