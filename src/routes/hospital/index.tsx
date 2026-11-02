import { createFileRoute, redirect } from "@tanstack/react-router";

// TODO: send signed-in staff to their dashboard once it exists.
export const Route = createFileRoute("/hospital/")({
  beforeLoad: () => {
    throw redirect({ to: "/hospital/login" });
  },
});
