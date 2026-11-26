import { buildSessionFromLoginResponse } from "@/features/auth/api/mutations";
import { loginResponseSchema } from "@/features/auth/api/schemas";
import { request } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Who is signed in, from the session cookies (`GET /api/auth/me`): the same `role`, `acting_as`
 * and `next_step` as the login reply, read fresh. A 401 is renewed once by the HTTP client; if
 * that fails too, this throws. It doesn't extend the session.
 */
export async function fetchSession() {
  const payload = await request(loginResponseSchema, { url: "/api/auth/me" });
  return buildSessionFromLoginResponse(payload);
}

/** Before sessions were cookies, the login reply (with tokens) was kept under this key. */
const OLD_SAVED_SESSION = "auth";

/**
 * On start-up: asks the API who is signed in and keeps that in memory, so a reload restores the
 * dashboard (or the gate step) without anything saved in the browser. No session (or no answer)
 * leaves the app signed out, and the route guards send the person to log in.
 */
export async function restoreSession() {
  try {
    localStorage.removeItem(OLD_SAVED_SESSION);
  } catch {
    // Storage blocked: nothing was saved there either.
  }
  try {
    useAuthStore.getState().setSession(await fetchSession());
  } catch {
    useAuthStore.getState().clearSession();
  }
}
