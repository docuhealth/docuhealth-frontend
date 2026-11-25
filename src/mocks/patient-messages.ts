import { HttpResponse, http } from "msw";
import { env } from "@/env";

const api = (path: string) => `${env.VITE_API_URL}/api/pending/patient/messages${path}`;

// TODO(api): demo chats for the patient's Messages page (src/features/patient/api/
// pending-messages.ts), which the API doesn't serve yet. Only the mock dev server asks for these.
// Sending, reading and starting a chat change them here until the page reloads.

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const daysAgo = (days: number, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};
/** Today at `hour`:`minute`, or just now if that's still to come. */
const today = (hour: number, minute: number) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.getTime() > Date.now() ? minutesAgo(1) : date.toISOString();
};

type Conversation = {
  id: string;
  name: string;
  photo: string | null;
  role: string | null;
  facility: string;
  replies: string | null;
  lastMessage: { text: string; at: string } | null;
  unread: number;
};
type Message = {
  id: string;
  mine: boolean;
  text: string;
  at: string;
  read: boolean;
  record: { kind: "lab"; name: string; visitId: string } | null;
};

const conversations: Conversation[] = [
  {
    id: "chat-okafor",
    name: "Dr. Adaeze Okafor",
    photo: null,
    role: "Internal Medicine",
    facility: "ABC Hospital",
    replies: "Usually replies within 1 working day",
    lastMessage: { text: "Please bring your BP log on Tuesday.", at: minutesAgo(120) },
    unread: 1,
  },
  {
    id: "chat-pharmacy",
    name: "Pharmacy",
    photo: null,
    role: "Pharmacy",
    facility: "ABC Hospital",
    replies: "Usually replies the same day",
    lastMessage: { text: "Your Amlodipine is ready for pickup.", at: daysAgo(1, 15) },
    unread: 1,
  },
  {
    id: "chat-laboratory",
    name: "Laboratory",
    photo: null,
    role: "Laboratory",
    facility: "Reddington Lab",
    replies: null,
    lastMessage: { text: "Your sample has been received.", at: daysAgo(44) },
    unread: 0,
  },
  {
    id: "chat-billing",
    name: "Billing team",
    photo: null,
    role: "Billing",
    facility: "LUTH",
    replies: "Usually replies within 2 working days",
    lastMessage: { text: "Receipt for payment #DB-20931 attached.", at: daysAgo(53) },
    unread: 0,
  },
];

const message = (fields: Partial<Message> & Pick<Message, "id" | "text" | "at">): Message => ({
  mine: false,
  read: true,
  record: null,
  ...fields,
});

const messages: Record<string, Message[]> = {
  "chat-okafor": [
    message({
      id: "m1",
      text: "Good morning. Your blood count result is back. It’s slightly low but improving.",
      at: today(9, 10),
    }),
    message({
      id: "m2",
      text: "Please bring your BP log on Tuesday so we can review both together.",
      at: today(9, 13),
    }),
    message({
      id: "m3",
      mine: true,
      text: "Thank you doctor, I will. Should I keep taking Amlodipine?",
      at: today(9, 40),
    }),
    message({
      id: "m4",
      text: "Full Blood Count",
      at: today(9, 43),
      record: { kind: "lab", name: "Full Blood Count", visitId: "7" },
    }),
    message({ id: "m5", mine: true, text: "Perfect, thanks! 👍", at: today(10, 1), read: false }),
    message({ id: "m6", text: "Please bring your BP log on Tuesday.", at: minutesAgo(120) }),
  ],
  "chat-pharmacy": [
    message({
      id: "p1",
      text: "Your Amlodipine is ready for pickup.",
      at: daysAgo(1, 15),
    }),
  ],
  "chat-laboratory": [
    message({ id: "l1", text: "Your sample has been received.", at: daysAgo(44) }),
  ],
  "chat-billing": [
    message({
      id: "b1",
      text: "Receipt for payment #DB-20931 attached.",
      at: daysAgo(53),
    }),
  ],
};
// The newest message is the list's last message.
messages["chat-okafor"]?.sort((a, b) => a.at.localeCompare(b.at));

const personnel = [
  { id: "p-okafor", name: "Dr. Adaeze Okafor", type: "doctor", facility: "ABC Hospital" },
  { id: "p-adeyemi", name: "Dr. Isaac Adeyemi", type: "doctor", facility: "ABC Hospital" },
  { id: "p-eze", name: "Nurse Ifeoma Eze", type: "nurse", facility: "ABC Hospital" },
  { id: "p-abc-pharmacy", name: "Pharmacy", type: "pharmacist", facility: "ABC Hospital" },
  { id: "p-abc-billing", name: "Billing team", type: "billing", facility: "ABC Hospital" },
  { id: "p-abc-front", name: "Front desk", type: "receptionist", facility: "ABC Hospital" },
  { id: "p-bello", name: "Dr. Tunde Bello", type: "doctor", facility: "LUTH" },
  { id: "p-luth-billing", name: "Billing team", type: "billing", facility: "LUTH" },
  { id: "p-luth-radiology", name: "Radiology unit", type: "radiologist", facility: "LUTH" },
  { id: "p-red-lab", name: "Laboratory", type: "lab", facility: "Reddington Lab" },
  { id: "p-red-support", name: "Patient support", type: "support", facility: "Reddington Lab" },
] as const;

const roles: Record<string, string> = {
  doctor: "Doctor",
  nurse: "Nursing",
  lab: "Laboratory",
  radiologist: "Radiology",
  pharmacist: "Pharmacy",
  receptionist: "Front desk",
  billing: "Billing",
  support: "Hospital support",
};

const notFound = () => HttpResponse.json({ detail: "Not found." }, { status: 404 });

export const patientMessageHandlers = [
  http.get(api("/conversations"), () =>
    HttpResponse.json(
      [...conversations].sort((a, b) =>
        (b.lastMessage?.at ?? "").localeCompare(a.lastMessage?.at ?? ""),
      ),
    ),
  ),
  http.get(api("/personnel"), () => HttpResponse.json(personnel)),
  http.post(api("/conversations"), async ({ request }) => {
    const { personnelId } = (await request.json()) as { personnelId: string };
    const person = personnel.find(({ id }) => id === personnelId);
    if (!person) return notFound();
    const id = `chat-${person.id}`;
    let chat = conversations.find(
      (entry) =>
        entry.id === id || (entry.name === person.name && entry.facility === person.facility),
    );
    if (!chat) {
      chat = {
        id,
        name: person.name,
        photo: null,
        role: roles[person.type] ?? null,
        facility: person.facility,
        replies: null,
        lastMessage: null,
        unread: 0,
      };
      conversations.push(chat);
      messages[id] = [];
    }
    return HttpResponse.json(chat);
  }),
  http.get(api("/conversations/:id"), ({ params }) => {
    const list = messages[String(params.id)];
    return list ? HttpResponse.json(list) : notFound();
  }),
  http.post(api("/conversations/:id/read"), ({ params }) => {
    const chat = conversations.find(({ id }) => id === params.id);
    if (!chat) return notFound();
    chat.unread = 0;
    return HttpResponse.json({});
  }),
  http.post(api("/conversations/:id"), async ({ params, request }) => {
    const chat = conversations.find(({ id }) => id === params.id);
    const list = messages[String(params.id)];
    if (!chat || !list) return notFound();
    const { text } = (await request.json()) as { text: string };
    const sent: Message = {
      id: `sent-${Date.now()}`,
      mine: true,
      text,
      at: new Date().toISOString(),
      read: false,
      record: null,
    };
    list.push(sent);
    chat.lastMessage = { text, at: sent.at };
    return HttpResponse.json(sent);
  }),
];
