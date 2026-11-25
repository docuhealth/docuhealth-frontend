import { createFileRoute } from "@tanstack/react-router";
import { AllergiesPage } from "@/features/patient/components/allergies-page";

export const Route = createFileRoute("/patient/health/allergies")({
  component: Page,
});

function Page() {
  return <AllergiesPage />;
}
