import appointmentIconUrl from "@/assets/svgs/appointment.svg";
import dashboardIconUrl from "@/assets/svgs/dashboard.svg";
import healthIconUrl from "@/assets/svgs/health.svg";
import labIconUrl from "@/assets/svgs/lab.svg";
import messagesIconUrl from "@/assets/svgs/messages.svg";
import settingsIconUrl from "@/assets/svgs/settings.svg";
import { DashboardSidebar, type NavGroup } from "@/components/dashboard/dashboard-sidebar";

/** The lab scientist dashboard's navigation. */
export function LabSidebar({ unreadMessages }: { unreadMessages: number }) {
  const groups: NavGroup[] = [
    {
      label: "General",
      items: [
        { to: "/hospital/lab-scientist", label: "Overview", icon: dashboardIconUrl },
        { to: "/hospital/lab-scientist/test-orders", label: "Test orders", icon: labIconUrl },
        {
          to: "/hospital/lab-scientist/appointments",
          label: "Appointments",
          icon: appointmentIconUrl,
        },
      ],
    },
    {
      label: "Communication",
      items: [
        {
          to: "/hospital/lab-scientist/messages",
          label: "Messages",
          icon: messagesIconUrl,
          badge: unreadMessages,
        },
      ],
    },
    {
      label: "Management",
      items: [
        {
          to: "/hospital/lab-scientist/personnel",
          label: "Health personnel",
          icon: healthIconUrl,
        },
        { to: "/hospital/lab-scientist/settings", label: "Settings", icon: settingsIconUrl },
      ],
    },
  ];

  return (
    <DashboardSidebar
      home="/hospital/lab-scientist"
      groups={groups}
      help="/hospital/lab-scientist/help"
    />
  );
}
