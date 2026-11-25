import appointmentIconUrl from "@/assets/svgs/appointment.svg";
import billsIconUrl from "@/assets/svgs/bills.svg";
import healthPatientIconUrl from "@/assets/svgs/health-patient.svg";
import healthIconUrl from "@/assets/svgs/health.svg";
import homeIconUrl from "@/assets/svgs/home.svg";
import messagesIconUrl from "@/assets/svgs/messages.svg";
import proxyIconUrl from "@/assets/svgs/proxy.svg";
import settingsIconUrl from "@/assets/svgs/settings.svg";
import sharingIconUrl from "@/assets/svgs/sharing.svg";
import { DashboardSidebar, type NavGroup } from "@/components/dashboard/dashboard-sidebar";

/** The patient side's navigation. */
export function PatientSidebar() {
  const groups: NavGroup[] = [
    {
      label: "",
      items: [
        { to: "/patient", label: "Home", icon: homeIconUrl },
        { to: "/patient/health", label: "Health", icon: healthPatientIconUrl },
        { to: "/patient/appointments", label: "Appointments", icon: appointmentIconUrl },
        // TODO(api): no unread count for patients' messages yet.
        { to: "/patient/messages", label: "Messages", icon: messagesIconUrl },
        { to: "/patient/bills", label: "Bills & payments", icon: billsIconUrl },
      ],
    },
    {
      label: "Manage",
      items: [
        { to: "/patient/family", label: "Family & proxy", icon: proxyIconUrl },
        { to: "/patient/sharing", label: "Sharing & privacy", icon: sharingIconUrl },
        { to: "/patient/personnel", label: "Health personnel", icon: healthIconUrl },
      ],
    },
  ];
  return (
    <DashboardSidebar
      home="/patient"
      groups={groups}
      help="/patient/help"
      footerItems={[{ to: "/patient/settings", label: "Settings", icon: settingsIconUrl }]}
    />
  );
}
