import appointmentIconUrl from "@/assets/svgs/appointment.svg";
import dashboardIconUrl from "@/assets/svgs/dashboard.svg";
import healthIconUrl from "@/assets/svgs/health.svg";
import messagesIconUrl from "@/assets/svgs/messages.svg";
import patientIconUrl from "@/assets/svgs/patient.svg";
import settingsIconUrl from "@/assets/svgs/settings.svg";
import staffIconUrl from "@/assets/svgs/staff.svg";
import { DashboardSidebar, type NavGroup } from "@/components/dashboard/dashboard-sidebar";

/** The doctor dashboard's navigation. */
export function DoctorSidebar({ unreadMessages }: { unreadMessages: number }) {
  const groups: NavGroup[] = [
    {
      label: "General",
      items: [
        { to: "/hospital/doctor", label: "Overview", icon: dashboardIconUrl },
        { to: "/hospital/doctor/encounters", label: "Doctor Encounter", icon: staffIconUrl },
        { to: "/hospital/doctor/patients", label: "Patient Mgt.", icon: patientIconUrl },
        { to: "/hospital/doctor/appointments", label: "Appointments", icon: appointmentIconUrl },
      ],
    },
    {
      label: "Communication",
      items: [
        {
          to: "/hospital/doctor/messages",
          label: "Messages",
          icon: messagesIconUrl,
          badge: unreadMessages,
        },
      ],
    },
    {
      label: "Management",
      items: [
        { to: "/hospital/doctor/personnel", label: "Health personnel", icon: healthIconUrl },
        { to: "/hospital/doctor/settings", label: "Settings", icon: settingsIconUrl },
      ],
    },
  ];

  return <DashboardSidebar home="/hospital/doctor" groups={groups} help="/hospital/doctor/help" />;
}
