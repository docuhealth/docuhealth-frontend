import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/features/patient/components/coming-soon-page";

export const Route = createFileRoute("/patient/appointments")({
  component: Page,
});

function Page() {
  return <ComingSoonPage title="Appointments" />;
}
