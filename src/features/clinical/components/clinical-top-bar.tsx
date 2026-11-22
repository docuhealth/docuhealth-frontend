import { useMatch } from "@tanstack/react-router";
import { DashboardTopBar } from "@/components/dashboard/dashboard-top-bar";
import type { ClinicalDashboard, ClinicalProfile } from "@/features/clinical/api/schemas";

/** The doctor's or nurse's top bar; a patient page links back to the list instead. */
export function ClinicalTopBar({
  dashboard,
  profile,
}: {
  dashboard: ClinicalDashboard;
  profile: ClinicalProfile;
}) {
  const onDoctorPatient = useMatch({
    from: "/hospital/doctor/patients/$visitId",
    shouldThrow: false,
  });
  const onNursePatient = useMatch({
    from: "/hospital/nurse/patients/$visitId",
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
        onDoctorPatient
          ? { to: "/hospital/doctor/patients", label: "Back to Patient Mgt." }
          : onNursePatient
            ? { to: "/hospital/nurse/patients", label: "Back to Patient Mgt." }
            : undefined
      }
      settings={dashboard === "doctor" ? "/hospital/doctor/settings" : "/hospital/nurse/settings"}
    />
  );
}
