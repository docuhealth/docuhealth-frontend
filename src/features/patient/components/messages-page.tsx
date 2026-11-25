import { ChatCircleDotsIcon, PlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { Button } from "@/components/ui/button";
import { conversationsQuery } from "@/features/patient/api/pending-messages";
import { ChatList } from "@/features/patient/components/chat-list";
import { ConversationPanel } from "@/features/patient/components/conversation-panel";
import { NewMessageDialog } from "@/features/patient/components/new-message-dialog";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { unreadCount } from "@/features/patient/lib/messages";
import { plural } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The patient's chats with their care teams: the chats on the left, the open one (`chatId`, or
 * the newest) on the right. On phones it's one or the other, with a way back to the chats.
 * TODO(api): it all comes from `pending-messages.ts`.
 */
export function MessagesPage({
  chatId,
  onChat,
}: {
  chatId: string | null;
  onChat: (chatId: string | null) => void;
}) {
  const { data, isError } = useQuery(conversationsQuery());
  const [newChat, setNewChat] = useState(false);
  const loading = !data && !isError;
  const conversations = data ?? [];
  const unread = unreadCount(conversations);
  const chosen = conversations.find((chat) => chat.id === chatId) ?? null;
  // On wide screens a chat is always open: the chosen one, or the newest.
  const shown = chosen ?? conversations[0] ?? null;

  const subtitle = loading
    ? null
    : conversations.length === 0
      ? "No messages yet"
      : unread > 0
        ? `${unread} unread`
        : plural(conversations.length, "chat");

  return (
    <>
      <PageHeading title="Messages" subtitle={subtitle} />
      {loading ? (
        <ListSkeleton />
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center pb-16">
          <PatientEmpty
            icon={<ChatCircleDotsIcon />}
            title="No messages yet"
            description="Messages from your healthcare providers will appear here."
          />
          <Button className="-mt-10 h-10 px-5" onClick={() => setNewChat(true)}>
            <PlusIcon />
            Start a chat
          </Button>
        </div>
      ) : (
        <div className="flex h-[calc(100svh-7rem)] min-h-120 overflow-hidden rounded-xl border bg-card sm:h-[calc(100svh-8rem)]">
          <section
            aria-label="Chats"
            className={cn(
              "w-full flex-col border-r lg:flex lg:w-80 lg:shrink-0 xl:w-96",
              chosen ? "hidden" : "flex",
            )}
          >
            <ChatList
              conversations={conversations}
              selectedId={shown?.id ?? null}
              onSelect={onChat}
              onNewChat={() => setNewChat(true)}
            />
          </section>
          {shown && (
            <section
              aria-label={`Chat with ${shown.name}`}
              className={cn("min-w-0 flex-1 flex-col lg:flex", chosen ? "flex" : "hidden")}
            >
              <ConversationPanel chat={shown} markRead={!!chosen} onBack={() => onChat(null)} />
            </section>
          )}
        </div>
      )}
      <NewMessageDialog open={newChat} onOpenChange={setNewChat} onStarted={onChat} />
    </>
  );
}
