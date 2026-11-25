import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  type Conversation,
  conversationMessagesQuery,
  useMarkRead,
} from "@/features/patient/api/pending-messages";
import { ConversationHeader } from "@/features/patient/components/conversation-header";
import { ConversationThread } from "@/features/patient/components/conversation-thread";
import { MessageComposer } from "@/features/patient/components/message-composer";
import { usePatient } from "@/features/patient/lib/use-patient";

/**
 * The open chat: who it's with, the messages and the composer. `markRead` clears its unread
 * count once the patient has opened it themselves (not when it's only shown first by default).
 */
export function ConversationPanel({
  chat,
  markRead,
  onBack,
}: {
  chat: Conversation;
  markRead: boolean;
  onBack: () => void;
}) {
  const { name } = usePatient();
  const { data, isError } = useQuery(conversationMessagesQuery(chat.id));
  const { mutate: read } = useMarkRead();
  const unread = markRead && chat.unread > 0;
  useEffect(() => {
    if (unread) read(chat.id);
  }, [unread, chat.id, read]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ConversationHeader chat={chat} onBack={onBack} />
      <ConversationThread chat={chat} messages={data ?? (isError ? [] : undefined)} me={name} />
      <MessageComposer key={chat.id} conversationId={chat.id} />
    </div>
  );
}
