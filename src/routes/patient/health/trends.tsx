import { createFileRoute } from "@tanstack/react-router";
import { HealthTrendsPage } from "@/features/patient/components/health-trends-page";

export const Route = createFileRoute("/patient/health/trends")({
  component: Page,
});

function Page() {
  return <HealthTrendsPage />;
}
