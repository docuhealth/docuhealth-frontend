import { useMatch } from "@tanstack/react-router";
import { DashboardTopBar } from "@/components/dashboard/dashboard-top-bar";
import type { PharmacyProfile } from "@/features/pharmacy/api/schemas";

/** The pharmacy dashboard's top bar; a prescription links back to the list instead. */
export function PharmacyTopBar({ profile }: { profile: PharmacyProfile }) {
  const onPrescription = useMatch({
    from: "/hospital/pharmacy/prescriptions/$prescriptionId",
    shouldThrow: false,
  });
  const { user } = profile;
  return (
    <DashboardTopBar
      hospitalName={profile.hospital.name}
      user={{
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        avatarUrl: user.avatarUrl,
      }}
      unreadNotifications={profile.unreadNotifications}
      back={
        onPrescription
          ? { to: "/hospital/pharmacy/prescriptions", label: "Back to Prescriptions" }
          : undefined
      }
      settings="/hospital/pharmacy/settings"
    />
  );
}
