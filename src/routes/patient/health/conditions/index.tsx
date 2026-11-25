import { createFileRoute } from "@tanstack/react-router";
import { ConditionsPage } from "@/features/patient/components/condition-pages";

export const Route = createFileRoute("/patient/health/conditions/")({
  component: Page,
});

function Page() {
  return <ConditionsPage />;
}
