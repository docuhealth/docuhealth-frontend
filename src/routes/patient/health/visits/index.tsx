import { createFileRoute } from "@tanstack/react-router";
import { VisitsPage } from "@/features/patient/components/visits-page";

export const Route = createFileRoute("/patient/health/visits/")({
  component: Page,
});

function Page() {
  return <VisitsPage />;
}
