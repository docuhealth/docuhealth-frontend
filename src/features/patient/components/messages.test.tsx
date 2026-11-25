import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as PendingMessages from "@/features/patient/api/pending-messages";
import type { Conversation, Message, Personnel } from "@/features/patient/api/pending-messages";
import { MessagesPage } from "@/features/patient/components/messages-page";
import { useAuthStore } from "@/stores/auth-store";
import { renderWithRouter } from "@/test/render";

// Messaging is TODO(api): off the mock dev server the chats are empty and sending fails, so the
// populated screens are tested with chats handed to the pending queries here. Sending and
// starting a chat go through the real hooks, which say messaging isn't available yet.
const pending = vi.hoisted(() => ({
  conversations: [] as unknown[],
  messages: {} as Record<string, unknown[]>,
  personnel: [] as unknown[],
}));

vi.mock("@/features/patient/api/pending-messages", async (importOriginal) => {
  const actual = await importOriginal<typeof PendingMessages>();
  return {
    ...actual,
    conversationsQuery: () => ({
      ...actual.conversationsQuery(),
      queryFn: () => Promise.resolve(pending.conversations as Conversation[]),
    }),
    conversationMessagesQuery: (id: string) => ({
      ...actual.conversationMessagesQuery(id),
      queryFn: () => Promise.resolve((pending.messages[id] ?? []) as Message[]),
    }),
    messagePersonnelQuery: () => ({
      ...actual.messagePersonnelQuery(),
      queryFn: () => Promise.resolve(pending.personnel as Personnel[]),
    }),
  };
});

const okafor: Conversation = {
  id: "chat-okafor",
  name: "Dr. Adaeze Okafor",
  photo: null,
  role: "Internal Medicine",
  facility: "ABC Hospital",
  replies: "Usually replies within 1 working day",
  lastMessage: { text: "Please bring your BP log on Tuesday.", at: new Date().toISOString() },
  unread: 1,
};
const pharmacy: Conversation = {
  ...okafor,
  id: "chat-pharmacy",
  name: "Pharmacy",
  role: "Pharmacy",
  replies: null,
  lastMessage: { text: "Your Amlodipine is ready for pickup.", at: "2026-10-12T10:00:00Z" },
  unread: 1,
};
const billing: Conversation = {
  ...okafor,
  id: "chat-billing",
  name: "Billing team",
  facility: "LUTH",
  lastMessage: { text: "Receipt for payment #DB-20931 attached.", at: "2026-10-03T10:00:00Z" },
  unread: 0,
};

const now = new Date().toISOString();
const thread: Message[] = [
  {
    id: "m1",
    mine: false,
    text: "Your blood count result is back.",
    at: now,
    read: true,
    record: null,
  },
  {
    id: "m2",
    mine: true,
    text: "Should I keep taking Amlodipine?",
    at: now,
    read: true,
    record: null,
  },
  {
    id: "m3",
    mine: false,
    text: "Full Blood Count",
    at: now,
    read: true,
    record: { kind: "lab", name: "Full Blood Count", visitId: "7" },
  },
];

beforeEach(() => {
  pending.conversations = [];
  pending.messages = {};
  pending.personnel = [];
  useAuthStore.getState().setSession({
    accessToken: "token",
    accountType: "patient",
    actingAs: [{ as: "self" }],
    user: {
      id: "me",
      name: "Chinonso Okafor",
      email: "c@example.com",
      role: "patient",
      hin: "1234567890123",
    },
  });
});

describe("Messages, with no chats", () => {
  it("says there are no messages and offers to start a chat", async () => {
    const { user } = renderWithRouter(<MessagesPage chatId={null} onChat={vi.fn()} />);
    expect(await screen.findByText("No messages yet")).toBeInTheDocument();
    expect(
      screen.getByText("Messages from your healthcare providers will appear here."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Start a chat" }));
    expect(await screen.findByRole("dialog", { name: "New message" })).toBeInTheDocument();
  });
});

describe("Messages", () => {
  beforeEach(() => {
    pending.conversations = [okafor, pharmacy, billing];
    pending.messages = { "chat-okafor": thread };
  });

  it("lists the chats with their unread counts, filtered by name and facility", async () => {
    const onChat = vi.fn();
    const { user } = renderWithRouter(<MessagesPage chatId={null} onChat={onChat} />);
    const list = await screen.findByRole("list", { name: "Chats" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(within(list).getAllByText("1 unread")).toHaveLength(2);
    expect(within(list).getByText("12 Oct")).toBeInTheDocument();

    await user.type(screen.getByRole("searchbox", { name: "Search chats by name" }), "pharm");
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    await user.clear(screen.getByRole("searchbox", { name: "Search chats by name" }));

    await user.click(screen.getByRole("button", { name: "LUTH" }));
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    await user.click(within(list).getByRole("button", { name: /Billing team/ }));
    expect(onChat).toHaveBeenCalledWith("chat-billing");
  });

  it("shows the open chat: who it's with, the messages and a shared record", async () => {
    renderWithRouter(<MessagesPage chatId="chat-okafor" onChat={vi.fn()} />);
    const chat = await screen.findByRole("region", { name: "Chat with Dr. Adaeze Okafor" });
    expect(
      within(chat).getByText(
        "Internal Medicine · ABC Hospital · Usually replies within 1 working day",
      ),
    ).toBeInTheDocument();
    expect(await within(chat).findByText("Your blood count result is back.")).toBeInTheDocument();
    expect(within(chat).getByText("Today")).toBeInTheDocument();
    expect(within(chat).getByText(/ · Read$/)).toBeInTheDocument();
    expect(within(chat).getByRole("link", { name: /Full Blood Count/ })).toHaveAttribute(
      "href",
      "/patient/health/visits/7",
    );
  });

  it("goes back to the chats from the open one", async () => {
    const onChat = vi.fn();
    const { user } = renderWithRouter(<MessagesPage chatId="chat-okafor" onChat={onChat} />);
    await user.click(await screen.findByRole("button", { name: "Back to chats" }));
    expect(onChat).toHaveBeenCalledWith(null);
  });

  it("says messaging isn't available yet when sending off the mock server", async () => {
    const { user } = renderWithRouter(<MessagesPage chatId="chat-okafor" onChat={vi.fn()} />);
    await user.type(await screen.findByRole("textbox", { name: "Message" }), "Thank you");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText(/Messaging isn’t available yet/)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Message" })).toHaveValue("Thank you");
  });
});

describe("New message", () => {
  beforeEach(() => {
    pending.conversations = [okafor];
    pending.personnel = [
      { id: "p-okafor", name: "Dr. Adaeze Okafor", type: "doctor", facility: "ABC Hospital" },
    ];
  });

  it("asks for a facility, a kind of personnel and a person", async () => {
    const { user } = renderWithRouter(<MessagesPage chatId={null} onChat={vi.fn()} />);
    await user.click(await screen.findByRole("button", { name: "New chat" }));
    const dialog = await screen.findByRole("dialog", { name: "New message" });
    expect(within(dialog).getByRole("button", { name: "Doctor" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(within(dialog).getByRole("button", { name: "Pharmacist" }));
    expect(within(dialog).getByRole("button", { name: "Pharmacist" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(within(dialog).getByRole("button", { name: "Start Chat" }));
    expect(await within(dialog).findByText("Choose a facility")).toBeInTheDocument();
    expect(within(dialog).getByText("Choose who to chat with")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Reset" }));
    expect(within(dialog).getByRole("button", { name: "Doctor" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
