import { useMatch } from "@tanstack/react-router";
import { DashboardTopBar } from "@/components/dashboard/dashboard-top-bar";
import type { HospitalProfile } from "@/features/hospital-admin/api/schemas";

/** The admin dashboard's top bar; a profile page links back to its list instead of the name. */
export function AdminTopBar({ profile }: { profile: HospitalProfile }) {
  const onStaffProfile = useMatch({
    from: "/hospital/admin/staff/$staffId",
    shouldThrow: false,
  });
  const onPatientProfile = useMatch({
    from: "/hospital/admin/patients/$patientId",
    shouldThrow: false,
  });
  const { admin } = profile;

  return (
    <DashboardTopBar
      hospitalName={profile.name}
      user={{
        name: `${admin.firstName} ${admin.lastName}`,
        email: admin.email,
        avatarUrl: admin.avatarUrl,
      }}
      unreadNotifications={profile.unreadNotifications}
      back={
        onStaffProfile
          ? { to: "/hospital/admin/staff", label: "Back to Staff Mgt." }
          : onPatientProfile
            ? { to: "/hospital/admin/patients", label: "Back to Patient Mgt." }
            : undefined
      }
      settings="/hospital/admin/settings"
    />
  );
}
