import { createFileRoute } from "@tanstack/react-router";
import { requireRole } from "@/features/auth/lib/guards";

export const Route = createFileRoute("/_app/admin")({
  // Members who type /admin are bounced to the dashboard before anything renders.
  beforeLoad: () => requireRole(["admin"]),
  component: () => (
    <section className="space-y-2">
      <title>Admin</title>
      <h1 className="text-h1">Admin</h1>
      <p className="text-muted-foreground">Only admins can see this page.</p>
    </section>
  ),
});
