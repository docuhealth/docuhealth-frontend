import { redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";

/** Use in a route's `beforeLoad`: sends signed-out users to sign-in, then back here. */
export function requireAuth(location: { href: string }) {
  const session = useAuthStore.getState().session;
  if (!session) {
    throw redirect({ to: "/sign-in", search: { redirect: location.href } });
  }
  return session;
}

export function redirectIfSignedIn() {
  if (useAuthStore.getState().session) {
    throw redirect({ to: "/dashboard" });
  }
}
