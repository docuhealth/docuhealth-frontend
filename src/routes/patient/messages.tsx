import { createFileRoute } from "@tanstack/react-router";
import { PatientComingSoon } from "@/features/patient/components/condition-pages";

export const Route = createFileRoute("/patient/messages")({
  component: Page,
});

function Page() {
  return <PatientComingSoon title="Messages" />;
}
