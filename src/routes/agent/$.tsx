import { createFileRoute, redirect } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/sections";

/**
 * The field agent site (agent.<domain>): any old link, e.g. /register-hospital. Registering a facility in person is
 * for DocuHealth's admins for now (the API refuses anyone else), so it's in the admin section.
 */
export const Route = createFileRoute("/agent/$")({
  beforeLoad: () => {
    throw redirect({ href: absoluteUrl("/admin/register-facility"), reloadDocument: true });
  },
});
