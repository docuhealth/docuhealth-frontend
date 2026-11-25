import { createFileRoute } from "@tanstack/react-router";
import { ImmunizationPage } from "@/features/patient/components/immunization-page";

export const Route = createFileRoute("/patient/health/immunizations/")({
  component: Page,
});

function Page() {
  return <ImmunizationPage />;
}
