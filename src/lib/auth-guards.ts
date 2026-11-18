import { redirect } from "@tanstack/react-router";
import { env } from "@/env";
import {
  type Dashboard,
  getPostLoginDestination,
  type NextStep,
  useAuthStore,
} from "@/stores/auth-store";

/**
 * On the dev server with the mock API, dashboards open without logging in, so screens can be
 * built and clicked through. Never in a production build, whatever the env vars say.
 */
const openWithoutSession = import.meta.env.DEV && env.VITE_ENABLE_MOCKS;

function loginFor(page: string) {
  return page === "/patient" || page === "/verify-nin" ? "/login" : "/hospital/login";
}

/**
 * `beforeLoad` for a dashboard layout: no session → its login; signed in as someone whose
 * dashboard is elsewhere (another role, or a pending gate step) → there.
 */
export function requireDashboard(dashboard: Dashboard) {
  const { session } = useAuthStore.getState();
  if (!session) {
    if (openWithoutSession) return;
    throw redirect({ to: loginFor(dashboard) });
  }
  const destination = getPostLoginDestination(session);
  if (destination !== dashboard) throw redirect({ to: destination });
}

const gatePages = {
  nin_not_verified: "/verify-nin",
  admin_details_required: "/hospital/first-login",
} as const satisfies Record<NonNullable<NextStep>, string>;

/** `beforeLoad` for a gate page: only for a session that still has that step to do. */
export function requireGate(step: NonNullable<NextStep>) {
  const { session } = useAuthStore.getState();
  if (!session) throw redirect({ to: loginFor(gatePages[step]) });
  if (session.nextStep !== step) throw redirect({ to: getPostLoginDestination(session) });
}

/** `beforeLoad` for login and sign-up pages: anyone already signed in goes where they belong. */
export function redirectIfSignedIn() {
  const { session } = useAuthStore.getState();
  if (session) throw redirect({ to: getPostLoginDestination(session) });
}
