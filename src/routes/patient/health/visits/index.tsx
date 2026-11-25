import { createFileRoute } from "@tanstack/react-router";
import { VisitsPage } from "@/features/patient/components/visit-pages";

export const Route = createFileRoute("/patient/health/visits/")({
  component: Page,
});

function Page() {
  return <VisitsPage />;
}
