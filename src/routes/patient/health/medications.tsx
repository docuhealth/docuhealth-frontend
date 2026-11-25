import { createFileRoute } from "@tanstack/react-router";
import { MedicationsPage } from "@/features/patient/components/medications-page";

export const Route = createFileRoute("/patient/health/medications")({
  component: Page,
});

function Page() {
  return <MedicationsPage />;
}
