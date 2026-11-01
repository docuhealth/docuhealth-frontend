import { HttpResponse, http } from "msw";
import { env } from "@/env";

const api = (path: string) => `${env.VITE_API_URL}${path}`;

const demoUsers = {
  admin: { id: "u1", name: "Ada Admin", email: "admin@example.com", role: "admin" as const },
  member: { id: "u2", name: "Mo Member", email: "member@example.com", role: "member" as const },
};
const demoPassword = "password123";

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
];
