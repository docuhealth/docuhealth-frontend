import { createFileRoute } from "@tanstack/react-router";
import { FacilityListPage } from "@/features/patient/components/facility-list-page";

export const Route = createFileRoute("/patient/health/facilities")({
  component: Page,
});

function Page() {
  return <FacilityListPage />;
}
