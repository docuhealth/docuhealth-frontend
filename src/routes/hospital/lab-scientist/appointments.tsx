import { createFileRoute } from "@tanstack/react-router";
import { StaffAppointments } from "@/features/staff/components/staff-appointments";

export const Route = createFileRoute("/hospital/lab-scientist/appointments")({
  component: AppointmentsPage,
});

function AppointmentsPage() {
  return (
    <>
      <title>Appointments · DocuHealth</title>
      <StaffAppointments scope="mine" />
    </>
  );
}
