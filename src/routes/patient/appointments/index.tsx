import { createFileRoute } from "@tanstack/react-router";
import { AppointmentsPage } from "@/features/patient/components/appointments-page";

export const Route = createFileRoute("/patient/appointments/")({
  component: Page,
});

function Page() {
  return <AppointmentsPage />;
}
