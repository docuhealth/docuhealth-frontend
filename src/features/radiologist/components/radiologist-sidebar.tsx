import appointmentIconUrl from "@/assets/svgs/appointment.svg";
import dashboardIconUrl from "@/assets/svgs/dashboard.svg";
import healthIconUrl from "@/assets/svgs/health.svg";
import messagesIconUrl from "@/assets/svgs/messages.svg";
import scanIconUrl from "@/assets/svgs/scan.svg";
import settingsIconUrl from "@/assets/svgs/settings.svg";
import { DashboardSidebar, type NavGroup } from "@/components/dashboard/dashboard-sidebar";

/** The radiologist dashboard's navigation. */
export function RadiologistSidebar({ unreadMessages }: { unreadMessages: number }) {
  const groups: NavGroup[] = [
    {
      label: "General",
      items: [
        { to: "/hospital/radiologist", label: "Overview", icon: dashboardIconUrl },
        { to: "/hospital/radiologist/scan-orders", label: "Scan orders", icon: scanIconUrl },
        {
          to: "/hospital/radiologist/appointments",
          label: "Appointments",
          icon: appointmentIconUrl,
        },
      ],
    },
    {
      label: "Communication",
      items: [
        {
          to: "/hospital/radiologist/messages",
          label: "Messages",
          icon: messagesIconUrl,
          badge: unreadMessages,
        },
      ],
    },
    {
      label: "Management",
      items: [
        { to: "/hospital/radiologist/personnel", label: "Health personnel", icon: healthIconUrl },
        { to: "/hospital/radiologist/settings", label: "Settings", icon: settingsIconUrl },
      ],
    },
  ];

  return (
    <DashboardSidebar
      home="/hospital/radiologist"
      groups={groups}
      help="/hospital/radiologist/help"
    />
  );
}
