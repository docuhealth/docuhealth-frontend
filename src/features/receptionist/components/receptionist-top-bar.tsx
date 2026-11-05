import { useMatch } from "@tanstack/react-router";
import { DashboardTopBar } from "@/components/dashboard/dashboard-top-bar";
import type { ReceptionistProfile } from "@/features/receptionist/api/schemas";

/** The receptionist dashboard's top bar; a patient's profile links back home instead. */
export function ReceptionistTopBar({ profile }: { profile: ReceptionistProfile }) {
  const onPatientProfile = useMatch({
    from: "/hospital/receptionist/patients/$patientId",
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
      back={onPatientProfile ? { to: "/hospital/receptionist", label: "Back to home" } : undefined}
      settings="/hospital/receptionist/settings"
    />
  );
}
