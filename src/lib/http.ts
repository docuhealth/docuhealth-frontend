import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { apiBaseUrl } from "@/env";
import { type NextStep, useAuthStore } from "@/stores/auth-store";

// Sessions live in two httpOnly cookies the API sets (access: 5 minutes, refresh: 24 hours), so
// the app never sees a token (docs/backend-handoff-2026-11-26-cookie-auth.md). Every call sends
// the cookies; every call that changes data also says it came from this app, because a page on
// another site can't add a custom header.

/** Methods that change data: these must carry `X-Requested-With`. */
const writeMethods = new Set(["post", "put", "patch", "delete"]);
const fromThisApp = { "X-Requested-With": "XMLHttpRequest" } as const;

export const http = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  // Only on writes: on a GET it would just add a preflight.
  if (writeMethods.has((config.method ?? "get").toLowerCase())) {
    config.headers.set(fromThisApp);
  }
  return config;
});

/** The session can't be renewed: the refresh cookie is missing, expired or cancelled. */
class SessionEndedError extends Error {
  constructor() {
    super("Your session has ended. Please log in again.");
    this.name = "SessionEndedError";
  }
}

async function postRefresh() {
  try {
    // No body: the refresh cookie is the credential. Success sets new cookies.
    await axios.post(`${apiBaseUrl}/api/auth/refresh`, undefined, {
      withCredentials: true,
      headers: fromThisApp,
    });
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    // 400: no refresh cookie; 401: expired or cancelled. Either way the session is over.
    if (status === 400 || status === 401) throw new SessionEndedError();
    throw error;
  }
}

/**
 * Renews the access cookie. Each refresh cancels the refresh token before it, so two at once fail:
 * calls in this tab share one refresh, and tabs take turns through a Web Lock where the browser
 * has them (a tab that waited refreshes with the cookie the first one left).
 */
function refreshSession(): Promise<void> {
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
  return locks ? locks.request("docuhealth-session-refresh", postRefresh) : postRefresh();
}

let refreshing: Promise<void> | null = null;

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

interface GateErrorPayload {
  code?: string;
  error?: { code?: string };
}

http.interceptors.response.use(undefined, async (error: AxiosError<GateErrorPayload>) => {
  const status = error.response?.status;
  if (status === 403) {
    const code = error.response?.data?.code ?? error.response?.data?.error?.code;
    if (code === "nin_not_verified" || code === "admin_details_required") {
      useAuthStore.getState().setNextStep(code satisfies NextStep);
    }
  }

  const config = error.config as RetriableConfig | undefined;
  // A 401 from signing in, refreshing or out means the credentials themselves are wrong; any other
  // (the staff profile under /api/auth/ included) means the access cookie expired, so renew it.
  // A password reset's 401 means its 5-minute cookie ran out: there's nothing to renew.
  const isCredentialCall = /\/auth\/(login|refresh|logout|reset-password)\b/.test(
    config?.url ?? "",
  );

  if (status !== 401 || !config || config._retried || isCredentialCall) {
    throw error;
  }

  try {
    refreshing ??= refreshSession().finally(() => {
      refreshing = null;
    });
    await refreshing;
  } catch (refreshError) {
    if (refreshError instanceof SessionEndedError) useAuthStore.getState().clearSession();
    throw error;
  }
  // Once only: a second 401 is final.
  config._retried = true;
  return http(config);
});
