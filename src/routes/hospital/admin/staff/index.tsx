import { createFileRoute } from "@tanstack/react-router";
import { staffListQuery } from "@/features/hospital-admin/api/queries";
import { StaffManagement } from "@/features/hospital-admin/components/staff-management";

export const Route = createFileRoute("/hospital/admin/staff/")({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(staffListQuery("", 1)),
  component: StaffPage,
});

function StaffPage() {
  return (
    <>
      <title>Staff Management · DocuHealth</title>
      <StaffManagement />
    </>
  );
}
