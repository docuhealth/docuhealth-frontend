import { HttpResponse, http } from "msw";
import { env } from "@/env";

const api = (path: string) => `${env.VITE_API_URL}${path}`;

const demoUsers = {
  admin: { id: "u1", name: "Ada Admin", email: "admin@example.com", role: "admin" as const },
  member: { id: "u2", name: "Mo Member", email: "member@example.com", role: "member" as const },
};
const demoPassword = "password123";

const seedContacts = () => [
  {
    id: "c1",
    name: "Grace Hopper",
    email: "grace@example.com",
    phone: "+234 801 000 0001",
    createdAt: "2026-10-01T09:00:00.000Z",
  },
  {
    id: "c2",
    name: "Alan Turing",
    email: "alan@example.com",
    phone: null,
    createdAt: "2026-10-12T14:30:00.000Z",
  },
];

let contacts = seedContacts();

/** Call between tests so state from one doesn't leak into the next. */
export function resetMockData() {
  contacts = seedContacts();
}

export const handlers = [
  http.post(api("/auth/sign-in"), async ({ request }) => {
    const { email, password } = (await request.json()) as { email: string; password: string };
    const user = Object.values(demoUsers).find((u) => u.email === email);
    if (!user || password !== demoPassword) {
      return HttpResponse.json({ message: "Wrong email or password" }, { status: 401 });
    }
    return HttpResponse.json({ accessToken: "mock-access", refreshToken: "mock-refresh", user });
  }),

  http.post(api("/auth/refresh"), () =>
    HttpResponse.json({ accessToken: "mock-access", refreshToken: "mock-refresh" }),
  ),

  http.get(api("/contacts"), ({ request }) => {
    const search = new URL(request.url).searchParams.get("search")?.toLowerCase() ?? "";
    const items = contacts.filter((c) => c.name.toLowerCase().includes(search));
    return HttpResponse.json({ items });
  }),

  http.post(api("/contacts"), async ({ request }) => {
    const body = (await request.json()) as { name: string; email: string; phone: string | null };
    const contact = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...body };
    contacts = [contact, ...contacts];
    return HttpResponse.json(contact, { status: 201 });
  }),
];
