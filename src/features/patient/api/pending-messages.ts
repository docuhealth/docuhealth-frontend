import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { env } from "@/env";
import { request } from "@/lib/api";
import { NotAvailableYetError } from "@/lib/not-available";

// TODO(api): the API has no messaging for patients yet (no chat endpoints in
// docs/api/openapi.json). Conversations, their messages, unread counts, sending, and who a
// patient may start a chat with all come from the mock dev server (src/mocks/patient-messages.ts)
// so the screens can be worked on; elsewhere the lists are empty and sending fails with
// "Messaging isn't available yet". When the endpoints land, point these at them.

const PENDING = "/api/pending/patient/messages";

const mocked = () => import.meta.env.DEV && env.VITE_ENABLE_MOCKS;

/** The mock server's demo data in dev; `empty` everywhere else. */
function pendingRequest<T extends z.ZodType>(schema: T, path: string, empty: z.output<T>) {
  if (!mocked()) return Promise.resolve(empty);
  return request(schema, { url: `${PENDING}${path}` });
}

/** A change on the mock server in dev; a "not available yet" error everywhere else. */
function pendingChange<T extends z.ZodType>(schema: T, path: string, data?: unknown) {
  if (!mocked()) return Promise.reject(new NotAvailableYetError("Messaging"));
  return request(schema, { method: "POST", url: `${PENDING}${path}`, data });
}

const messageKeys = {
  all: ["patient", "pending", "messages"] as const,
  conversations: () => [...messageKeys.all, "conversations"] as const,
  conversation: (id: string) => [...messageKeys.all, "conversation", id] as const,
  personnel: () => [...messageKeys.all, "personnel"] as const,
};

export const personnelTypes = [
  "doctor",
  "nurse",
  "lab",
  "radiologist",
  "pharmacist",
  "receptionist",
  "billing",
  "support",
] as const;
export type PersonnelType = (typeof personnelTypes)[number];

/** A chat with one person or team at a facility. */
export const conversationSchema = z.object({
  id: z.string(),
  /** A person ("Dr. Adaeze Okafor") or a team ("Pharmacy"). */
  name: z.string(),
  photo: z.string().nullable(),
  /** Their department or role, e.g. "Internal Medicine". */
  role: z.string().nullable(),
  facility: z.string(),
  /** e.g. "Usually replies within 1 working day". */
  replies: z.string().nullable(),
  lastMessage: z.object({ text: z.string(), at: z.string() }).nullable(),
  unread: z.number(),
});
export type Conversation = z.output<typeof conversationSchema>;

/** A record shared into a chat, e.g. a lab result from a visit. */
const sharedRecordSchema = z.object({
  kind: z.enum(["lab"]),
  name: z.string(),
  visitId: z.string(),
});

export const messageSchema = z.object({
  id: z.string(),
  /** Whether the patient sent it. */
  mine: z.boolean(),
  text: z.string(),
  at: z.string(),
  /** For the patient's own messages: whether the other side has read it. */
  read: z.boolean(),
  record: sharedRecordSchema.nullable(),
});
export type Message = z.output<typeof messageSchema>;

/** Someone at a facility the patient may start a chat with. */
export const personnelSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(personnelTypes),
  facility: z.string(),
});
export type Personnel = z.output<typeof personnelSchema>;

export const conversationsQuery = () =>
  queryOptions({
    queryKey: messageKeys.conversations(),
    queryFn: () => pendingRequest(z.array(conversationSchema), "/conversations", []),
  });

export const conversationMessagesQuery = (id: string) =>
  queryOptions({
    queryKey: messageKeys.conversation(id),
    queryFn: () =>
      pendingRequest(z.array(messageSchema), `/conversations/${encodeURIComponent(id)}`, []),
  });

export const messagePersonnelQuery = () =>
  queryOptions({
    queryKey: messageKeys.personnel(),
    queryFn: () => pendingRequest(z.array(personnelSchema), "/personnel", []),
  });

/** Sends `text` into a chat; refreshes the chat and the list (its last message). */
export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) =>
      pendingChange(messageSchema, `/conversations/${encodeURIComponent(conversationId)}`, {
        text,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: messageKeys.all }),
  });
}

/** Marks a chat read, so its unread count (and the sidebar's) clears. */
export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      pendingChange(z.unknown(), `/conversations/${encodeURIComponent(conversationId)}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: messageKeys.conversations() }),
  });
}

/** Opens a chat with someone (or finds the one already open); resolves to the chat. */
export function useStartChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (personnelId: string) =>
      pendingChange(conversationSchema, "/conversations", { personnelId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: messageKeys.conversations() }),
  });
}
