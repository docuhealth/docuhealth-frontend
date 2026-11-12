import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { request } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

/** Ends the session, revokes the refresh cookie, drops cached data and goes to the appropriate login. */
export function useLogOut() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return async () => {
    const accountType = useAuthStore.getState().session?.accountType;
    await request(z.unknown(), { method: "POST", url: "/api/auth/logout" }).catch(() => undefined);
    useAuthStore.getState().clearSession();
    await navigate({ to: accountType === "patient" ? "/login" : "/hospital/login" });
    queryClient.clear();
  };
}
