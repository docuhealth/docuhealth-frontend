import { createFileRoute } from "@tanstack/react-router";
import { CarePlansPage } from "@/features/patient/components/care-plans-page";

export const Route = createFileRoute("/patient/health/care-plans/")({
  component: Page,
});

function Page() {
  return <CarePlansPage />;
}
