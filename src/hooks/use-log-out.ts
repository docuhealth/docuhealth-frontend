import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";

/** Ends the session, drops cached data and goes to the hospital login. */
export function useLogOut() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return async () => {
    useAuthStore.getState().clearSession();
    await navigate({ to: "/hospital/login" });
    queryClient.clear();
  };
}
