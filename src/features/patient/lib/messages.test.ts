import { describe, expect, it } from "vitest";
import type { Conversation, Message, Personnel } from "@/features/patient/api/pending-messages";
import {
  chatFacilities,
  chatTime,
  conversationLine,
  filterConversations,
  messageMeta,
  messagesByDay,
  personnelFor,
  unreadCount,
} from "@/features/patient/lib/messages";

const chat = (fields: Partial<Conversation>): Conversation => ({
  id: "chat",
  name: "Dr. Adaeze Okafor",
  photo: null,
  role: "Internal Medicine",
  facility: "ABC Hospital",
  replies: "Usually replies within 1 working day",
  lastMessage: null,
  unread: 0,
  ...fields,
});

const message = (fields: Partial<Message>): Message => ({
  id: "m",
  mine: false,
  text: "Hello",
  at: "2026-11-25T09:00:00",
  read: false,
  record: null,
  ...fields,
});

const now = new Date("2026-11-25T12:00:00");

describe("chats", () => {
  const chats = [
    chat({ id: "1", unread: 1 }),
    chat({ id: "2", name: "Pharmacy", unread: 1 }),
    chat({ id: "3", name: "Billing team", facility: "LUTH" }),
  ];

  it("adds up unread messages", () => {
    expect(unreadCount(chats)).toBe(2);
    expect(unreadCount([])).toBe(0);
  });

  it("lists each facility once", () => {
    expect(chatFacilities(chats)).toEqual(["ABC Hospital", "LUTH"]);
  });

  it("filters by name and facility", () => {
    expect(
      filterConversations(chats, { search: "  pharm", facility: null }).map((c) => c.id),
    ).toEqual(["2"]);
    expect(filterConversations(chats, { search: "", facility: "LUTH" }).map((c) => c.id)).toEqual([
      "3",
    ]);
    expect(filterConversations(chats, { search: "", facility: null })).toHaveLength(3);
  });

  it("joins the header line, skipping what's missing", () => {
    expect(conversationLine(chats[0]!)).toBe(
      "Internal Medicine · ABC Hospital · Usually replies within 1 working day",
    );
    expect(conversationLine(chat({ role: null, replies: null }))).toBe("ABC Hospital");
  });
});

describe("times", () => {
  it("says how long ago a chat's last message came", () => {
    expect(chatTime("2026-11-25T11:59:40", now)).toBe("now");
    expect(chatTime("2026-11-25T11:35:00", now)).toBe("25m");
    expect(chatTime("2026-11-25T10:00:00", now)).toBe("2hr");
    expect(chatTime("2026-11-24T22:00:00", now)).toBe("Yesterday");
    expect(chatTime("2026-10-12T10:00:00", now)).toBe("12 Oct");
  });

  it("groups messages by day, oldest first", () => {
    const groups = messagesByDay(
      [
        message({ id: "b", at: "2026-11-25T09:13:00" }),
        message({ id: "a", at: "2026-11-24T09:10:00" }),
        message({ id: "c", at: "2026-11-25T09:40:00" }),
      ],
      now,
    );
    expect(groups.map((group) => [group.label, group.messages.map((m) => m.id)])).toEqual([
      ["Yesterday", ["a"]],
      ["Today", ["b", "c"]],
    ]);
  });

  it("marks the patient's read messages", () => {
    const at = "2026-11-25T09:40:00";
    expect(messageMeta(message({ at, mine: true, read: true }))).toMatch(/^9:40\sAM · Read$/);
    expect(messageMeta(message({ at, mine: true, read: false }))).toMatch(/^9:40\sAM$/);
    expect(messageMeta(message({ at, read: true }))).toMatch(/^9:40\sAM$/);
  });
});

describe("personnelFor", () => {
  const people: Personnel[] = [
    { id: "1", name: "Dr. Adaeze Okafor", type: "doctor", facility: "ABC Hospital" },
    { id: "2", name: "Nurse Ifeoma Eze", type: "nurse", facility: "ABC Hospital" },
    { id: "3", name: "Dr. Tunde Bello", type: "doctor", facility: "LUTH" },
  ];

  it("picks people at the facility in that role", () => {
    expect(personnelFor(people, "ABC Hospital", "doctor").map((p) => p.id)).toEqual(["1"]);
    expect(personnelFor(people, null, "doctor")).toEqual([]);
  });
});
