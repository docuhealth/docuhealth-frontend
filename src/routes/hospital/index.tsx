import { createFileRoute, redirect } from "@tanstack/react-router";
import { redirectIfSignedIn } from "@/lib/auth-guards";

/** hospital.<domain>/ — signed-in staff go to their dashboard, everyone else to the login. */
export const Route = createFileRoute("/hospital/")({
  beforeLoad: () => {
    redirectIfSignedIn();
    throw redirect({ to: "/hospital/login" });
  },
});
