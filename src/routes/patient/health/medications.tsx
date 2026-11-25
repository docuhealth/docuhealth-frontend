import { createFileRoute } from "@tanstack/react-router";
import { MedicationsPage } from "@/features/patient/components/visit-pages";

export const Route = createFileRoute("/patient/health/medications")({
  component: Page,
});

function Page() {
  return <MedicationsPage />;
}
