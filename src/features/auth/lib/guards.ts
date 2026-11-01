import { redirect } from "@tanstack/react-router";
import { type Role, useAuthStore } from "@/stores/auth-store";

/** Use in a route's `beforeLoad`: sends signed-out users to sign-in, then back here. */
export function requireAuth(location: { href: string }) {
  const session = useAuthStore.getState().session;
  if (!session) {
    throw redirect({ to: "/sign-in", search: { redirect: location.href } });
  }
  return session;
}

/** Use in a route's `beforeLoad` after `requireAuth` (e.g. in a child route). */
export function requireRole(allowed: readonly Role[]) {
  const role = useAuthStore.getState().session?.user.role;
  if (!role || !allowed.includes(role)) {
    throw redirect({ to: "/dashboard" });
  }
}

export function redirectIfSignedIn() {
  if (useAuthStore.getState().session) {
    throw redirect({ to: "/dashboard" });
  }
}
