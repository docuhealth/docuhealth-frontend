import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { session } = Route.useRouteContext();

  return (
    <section className="space-y-2">
      <title>Dashboard · DocuHealth</title>
      <h1 className="text-h1">Welcome, {session.user.name}</h1>
    </section>
  );
}
