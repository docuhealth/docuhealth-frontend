import { createFileRoute } from "@tanstack/react-router";
import { WardManagement } from "@/features/hospital-admin/components/ward-management";

export const Route = createFileRoute("/hospital/admin/wards")({
  component: WardsPage,
});

function WardsPage() {
  return (
    <>
      <title>Ward Management · DocuHealth</title>
      <WardManagement />
    </>
  );
}
