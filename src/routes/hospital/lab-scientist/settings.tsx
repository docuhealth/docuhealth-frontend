import { createFileRoute } from "@tanstack/react-router";
import { LabDetailsCard } from "@/features/lab-scientist/components/lab-details-card";
import { staffProfileQuery } from "@/features/staff/api/queries";
import { StaffSettings } from "@/features/staff/components/staff-settings";
import { useIsFacilityAdmin } from "@/stores/auth-store";

export const Route = createFileRoute("/hospital/lab-scientist/settings")({
  loader: ({ context }) => context.queryClient.ensureQueryData(staffProfileQuery()),
  component: SettingsPage,
});

/** Every staff member's settings; the lab's admin also corrects the lab's own details. */
function SettingsPage() {
  const admin = useIsFacilityAdmin();
  return (
    <>
      <title>Settings · DocuHealth</title>
      <div className="flex flex-col gap-6">
        <StaffSettings />
        {admin && <LabDetailsCard />}
      </div>
    </>
  );
}
