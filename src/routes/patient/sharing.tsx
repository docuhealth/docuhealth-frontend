import { createFileRoute } from "@tanstack/react-router";
import { PatientComingSoon } from "@/features/patient/components/condition-pages";

export const Route = createFileRoute("/patient/sharing")({
  component: Page,
});

function Page() {
  return <PatientComingSoon title="Sharing & privacy" />;
}
