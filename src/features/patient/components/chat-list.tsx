import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { SearchField } from "@/components/dashboard/search-field";
import { Button } from "@/components/ui/button";
import type { Conversation } from "@/features/patient/api/pending-messages";
import { ChatRow } from "@/features/patient/components/chat-row";
import { FacilityFilter } from "@/features/patient/components/facility-filter";
import { SectionLabel } from "@/features/patient/components/patient-ui";
import { chatFacilities, filterConversations } from "@/features/patient/lib/messages";

/** The Messages page's left panel: "Chats", a name search, facility chips and the chats. */
export function ChatList({
  conversations,
  selectedId,
  onSelect,
  onNewChat,
}: {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}) {
  const [search, setSearch] = useState("");
  const [facility, setFacility] = useState<string | null>(null);
  const facilities = chatFacilities(conversations);
  const shown = filterConversations(conversations, { search, facility });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="type-title-sm text-fg-heading">Chats</h2>
        <Button className="h-10 px-4" onClick={onNewChat}>
          <PlusIcon />
          New chat
        </Button>
      </div>
      <SearchField
        size="lg"
        label="Search chats by name"
        placeholder="Search name…"
        value={search}
        onChange={setSearch}
      />
      {facilities.length > 1 && (
        <FacilityFilter facilities={facilities} value={facility} onChange={setFacility} />
      )}
      <SectionLabel>Direct messages</SectionLabel>
      {shown.length === 0 ? (
        <p className="px-3 type-body-sm-regular text-fg-caption">No chats match.</p>
      ) : (
        <ul aria-label="Chats" className="-mx-1 flex min-h-0 flex-col gap-1 overflow-y-auto px-1">
          {shown.map((chat) => (
            <ChatRow
              key={chat.id}
              chat={chat}
              selected={chat.id === selectedId}
              onSelect={() => onSelect(chat.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
