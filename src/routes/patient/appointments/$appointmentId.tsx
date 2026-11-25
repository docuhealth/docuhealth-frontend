import { createFileRoute } from "@tanstack/react-router";
import { AppointmentDetails } from "@/features/patient/components/appointment-details";

export const Route = createFileRoute("/patient/appointments/$appointmentId")({
  component: Page,
});

function Page() {
  const { appointmentId } = Route.useParams();
  return <AppointmentDetails appointmentId={appointmentId} />;
}
