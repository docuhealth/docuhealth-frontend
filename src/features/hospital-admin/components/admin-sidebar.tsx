import appointmentIconUrl from "@/assets/svgs/appointment.svg";
import dashboardIconUrl from "@/assets/svgs/dashboard.svg";
import healthIconUrl from "@/assets/svgs/health.svg";
import messagesIconUrl from "@/assets/svgs/messages.svg";
import patientIconUrl from "@/assets/svgs/patient.svg";
import settingsIconUrl from "@/assets/svgs/settings.svg";
import staffIconUrl from "@/assets/svgs/staff.svg";
import { DashboardSidebar, type NavGroup } from "@/components/dashboard/dashboard-sidebar";

/** The hospital admin dashboard's navigation. */
export function AdminSidebar({ unreadMessages }: { unreadMessages: number }) {
  const groups: NavGroup[] = [
    {
      label: "General",
      items: [
        { to: "/hospital/admin", label: "Dashboard", icon: dashboardIconUrl },
        { to: "/hospital/admin/staff", label: "Staff Mgt.", icon: staffIconUrl },
        { to: "/hospital/admin/patients", label: "Patient Mgt.", icon: patientIconUrl },
        { to: "/hospital/admin/appointments", label: "Appointments", icon: appointmentIconUrl },
      ],
    },
    {
      label: "Communication",
      items: [
        {
          to: "/hospital/admin/messages",
          label: "Messages",
          icon: messagesIconUrl,
          badge: unreadMessages,
        },
      ],
    },
    {
      label: "Management",
      items: [
        { to: "/hospital/admin/personnel", label: "Health personnel", icon: healthIconUrl },
        { to: "/hospital/admin/settings", label: "Settings", icon: settingsIconUrl },
      ],
    },
  ];

  return <DashboardSidebar home="/hospital/admin" groups={groups} help="/hospital/admin/help" />;
}
