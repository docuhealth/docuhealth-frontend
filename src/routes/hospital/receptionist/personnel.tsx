import { createFileRoute } from "@tanstack/react-router";
import { HealthPersonnel } from "@/features/staff/components/health-personnel";

export const Route = createFileRoute("/hospital/receptionist/personnel")({
  component: PersonnelPage,
});

function PersonnelPage() {
  return (
    <>
      <title>Health Personnel · DocuHealth</title>
      <HealthPersonnel />
    </>
  );
}
