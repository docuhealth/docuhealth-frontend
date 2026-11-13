import { useMatch } from "@tanstack/react-router";
import { DashboardTopBar } from "@/components/dashboard/dashboard-top-bar";
import type { RadiologistProfile } from "@/features/radiologist/api/schemas";
import { displayName } from "@/features/radiologist/lib/names";

/** The radiologist dashboard's top bar; a scan order links back to the list instead. */
export function RadiologistTopBar({ profile }: { profile: RadiologistProfile }) {
  const onScanOrder = useMatch({
    from: "/hospital/radiologist/scan-orders/$orderId",
    shouldThrow: false,
  });
  const { user } = profile;
  return (
    <DashboardTopBar
      hospitalName={profile.hospital.name}
      user={{ name: displayName(user), email: user.email, avatarUrl: user.avatarUrl }}
      unreadNotifications={profile.unreadNotifications}
      back={
        onScanOrder
          ? { to: "/hospital/radiologist/scan-orders", label: "Back to Scan orders" }
          : undefined
      }
      settings="/hospital/radiologist/settings"
    />
  );
}
