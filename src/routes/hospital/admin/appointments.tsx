import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";

// TODO(design): build this page once it's designed.
export const Route = createFileRoute("/hospital/admin/appointments")({
  component: AppointmentsPage,
});

function AppointmentsPage() {
  return <SectionPlaceholder title="Appointments" />;
}
