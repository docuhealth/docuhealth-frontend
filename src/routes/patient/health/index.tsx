import { createFileRoute } from "@tanstack/react-router";
import { PatientHealth } from "@/features/patient/components/patient-health";

export const Route = createFileRoute("/patient/health/")({
  component: Page,
});

function Page() {
  return <PatientHealth />;
}
