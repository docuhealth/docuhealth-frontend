import { createFileRoute } from "@tanstack/react-router";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { session } = Route.useRouteContext();

  return (
    <section className="space-y-6">
      <title>Dashboard</title>
      <h1 className="text-h1">Hello, {session.user.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Starter dashboard</CardTitle>
          <CardDescription>
            Replace this page. You’re signed in as {session.user.role}.
          </CardDescription>
        </CardHeader>
      </Card>
    </section>
  );
}
