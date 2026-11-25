import { createFileRoute } from "@tanstack/react-router";
import { TrendsPage } from "@/features/patient/components/trends-page";

export const Route = createFileRoute("/patient/health/vitals/trends")({
  component: Page,
});

function Page() {
  return <TrendsPage />;
}
