import { createFileRoute } from "@tanstack/react-router";
import { staffProfileQuery } from "@/features/staff/api/queries";
import { StaffSettings } from "@/features/staff/components/staff-settings";

export const Route = createFileRoute("/hospital/lab-scientist/settings")({
  loader: ({ context }) => context.queryClient.ensureQueryData(staffProfileQuery()),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <title>Settings · DocuHealth</title>
      <StaffSettings />
    </>
  );
}
