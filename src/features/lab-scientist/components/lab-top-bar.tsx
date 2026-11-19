import { useMatch } from "@tanstack/react-router";
import { DashboardTopBar } from "@/components/dashboard/dashboard-top-bar";
import type { LabProfile } from "@/features/lab-scientist/api/schemas";
import { displayName } from "@/features/lab-scientist/lib/names";

/** The lab scientist dashboard's top bar; a test order links back to the list instead. */
export function LabTopBar({ profile }: { profile: LabProfile }) {
  const onTestOrder = useMatch({
    from: "/hospital/lab-scientist/test-orders/$orderId",
    shouldThrow: false,
  });
  const { user } = profile;
  return (
    <DashboardTopBar
      hospitalName={profile.hospital.name}
      user={{ name: displayName(user), email: user.email, avatarUrl: user.avatarUrl }}
      unreadNotifications={profile.unreadNotifications}
      back={
        onTestOrder
          ? { to: "/hospital/lab-scientist/test-orders", label: "Back to Test orders" }
          : undefined
      }
      settings="/hospital/lab-scientist/settings"
    />
  );
}
