import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthLayout } from "@/features/auth/components/auth-layout";

/** Pages of the field agent site (agent.<domain>) that use the auth split screen. */
export const Route = createFileRoute("/agent/_auth")({
  // TODO: only let signed-in field agents in once agent auth exists.
  component: AgentAuthLayout,
});

function AgentAuthLayout() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}
