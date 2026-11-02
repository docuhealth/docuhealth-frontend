import { createFileRoute, redirect } from "@tanstack/react-router";

// TODO: send to the hospital login once it's designed.
export const Route = createFileRoute("/hospital/")({
  beforeLoad: () => {
    throw redirect({ to: "/hospital/register" });
  },
});
