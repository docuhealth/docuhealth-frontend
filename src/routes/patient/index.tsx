import { createFileRoute } from "@tanstack/react-router";
import { PatientHome } from "@/features/patient/components/patient-home";

export const Route = createFileRoute("/patient/")({
  component: Page,
});

function Page() {
  return <PatientHome />;
}
