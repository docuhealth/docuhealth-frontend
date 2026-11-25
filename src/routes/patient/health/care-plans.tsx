import { createFileRoute } from "@tanstack/react-router";
import { CarePlansPage } from "@/features/patient/components/condition-pages";

export const Route = createFileRoute("/patient/health/care-plans")({
  component: Page,
});

function Page() {
  return <CarePlansPage />;
}
