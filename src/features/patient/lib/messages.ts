import type {
  Conversation,
  Message,
  Personnel,
  PersonnelType,
} from "@/features/patient/api/pending-messages";
import { formatDayMonth, formatTime } from "@/lib/format";

// Working out the Messages page's views from the patient's chats.

/** Unread messages across every chat, for the heading and the sidebar. */
export function unreadCount(conversations: Conversation[]) {
  return conversations.reduce((sum, chat) => sum + chat.unread, 0);
}

/** The facilities the patient has chats at, in the order they first appear. */
export function chatFacilities(conversations: Conversation[]) {
  return [...new Set(conversations.map((chat) => chat.facility))];
}

/** Chats whose name holds `search` (any case), at `facility` (or anywhere when `null`). */
export function filterConversations(
  conversations: Conversation[],
  { search, facility }: { search: string; facility: string | null },
) {
  const needle = search.trim().toLowerCase();
  return conversations.filter(
    (chat) =>
      (!facility || chat.facility === facility) &&
      (!needle || chat.name.toLowerCase().includes(needle)),
  );
}

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
const DAY = 86_400_000;

/** How many calendar days `date` is before `now` (0 today, 1 yesterday). */
function daysBefore(date: Date, now: Date) {
  return Math.round((startOfDay(now) - startOfDay(date)) / DAY);
}

/** When a chat's last message came, for its row: "now", "25m", "2hr", "Yesterday", "12 Oct". */
export function chatTime(at: string, now = new Date()) {
  const date = new Date(at);
  const minutes = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60_000));
  const days = daysBefore(date, now);
  if (days === 0 && minutes < 1) return "now";
  if (days === 0 && minutes < 60) return `${minutes}m`;
  if (days === 0) return `${Math.floor(minutes / 60)}hr`;
  if (days === 1) return "Yesterday";
  return formatDayMonth(date);
}

/** A day's label in a chat: "Today", "Yesterday", "12 Oct". */
function dayLabel(at: string, now = new Date()) {
  const date = new Date(at);
  const days = daysBefore(date, now);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return formatDayMonth(date);
}

/** A chat's messages, oldest first, grouped by the day they were sent. */
export function messagesByDay(messages: Message[], now = new Date()) {
  const groups: { label: string; messages: Message[] }[] = [];
  for (const message of [...messages].sort((a, b) => a.at.localeCompare(b.at))) {
    const label = dayLabel(message.at, now);
    const last = groups.at(-1);
    if (last?.label === label) last.messages.push(message);
    else groups.push({ label, messages: [message] });
  }
  return groups;
}

/** The line under a message: "9:40 AM", and "· Read" once the other side has read the patient's. */
export function messageMeta(message: Message) {
  const time = formatTime(new Date(message.at));
  return message.mine && message.read ? `${time} · Read` : time;
}

/** The conversation header's line: "Internal Medicine · ABC Hospital · Usually replies …". */
export function conversationLine(chat: Conversation) {
  return [chat.role, chat.facility, chat.replies].filter(Boolean).join(" · ");
}

export const personnelTypeLabels: Record<PersonnelType, string> = {
  doctor: "Doctor",
  nurse: "Nurse",
  lab: "Lab personnel",
  radiologist: "Radiologist",
  pharmacist: "Pharmacist",
  receptionist: "Receptionist",
  billing: "Billing",
  support: "Hospital support",
};

/** Who the patient can message at `facility` in the chosen kind of role. */
export function personnelFor(
  personnel: Personnel[],
  facility: string | null,
  type: PersonnelType | null,
) {
  return personnel.filter((person) => person.facility === facility && person.type === type);
}
