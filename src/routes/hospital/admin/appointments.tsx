import { createFileRoute } from "@tanstack/react-router";
import { StaffAppointments } from "@/features/staff/components/staff-appointments";

export const Route = createFileRoute("/hospital/admin/appointments")({
  component: AppointmentsPage,
});

function AppointmentsPage() {
  return (
    <>
      <title>Appointments · DocuHealth</title>
      <StaffAppointments scope="hospital" />
    </>
  );
}
