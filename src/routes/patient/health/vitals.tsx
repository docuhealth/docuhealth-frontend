import { createFileRoute } from "@tanstack/react-router";
import { VitalSignsPage } from "@/features/patient/components/visit-pages";

export const Route = createFileRoute("/patient/health/vitals")({
  component: Page,
});

function Page() {
  return <VitalSignsPage />;
}
