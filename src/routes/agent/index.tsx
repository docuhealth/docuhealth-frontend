import { createFileRoute, redirect } from "@tanstack/react-router";

// TODO: send to the agent dashboard once it exists.
export const Route = createFileRoute("/agent/")({
  beforeLoad: () => {
    throw redirect({ to: "/agent/register-hospital" });
  },
});
