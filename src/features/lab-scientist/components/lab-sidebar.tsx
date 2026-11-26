import appointmentIconUrl from "@/assets/svgs/appointment.svg";
import auditIconUrl from "@/assets/svgs/audit.svg";
import dashboardIconUrl from "@/assets/svgs/dashboard.svg";
import healthIconUrl from "@/assets/svgs/health.svg";
import labResultIconUrl from "@/assets/svgs/lab-result.svg";
import labIconUrl from "@/assets/svgs/lab.svg";
import messagesIconUrl from "@/assets/svgs/messages.svg";
import settingsIconUrl from "@/assets/svgs/settings.svg";
import {
  DashboardSidebar,
  type NavGroup,
  type NavItem,
} from "@/components/dashboard/dashboard-sidebar";
import { useIsFacilityAdmin } from "@/stores/auth-store";

/** The lab scientist dashboard's navigation. */
export function LabSidebar({ unreadMessages }: { unreadMessages: number }) {
  // The lab's admin also sees who downloaded its results.
  const admin = useIsFacilityAdmin();
  const auditLogs: NavItem = {
    to: "/hospital/lab-scientist/audit-logs",
    label: "Audit logs",
    icon: auditIconUrl,
  };
  const groups: NavGroup[] = [
    {
      label: "General",
      items: [
        { to: "/hospital/lab-scientist", label: "Overview", icon: dashboardIconUrl },
        { to: "/hospital/lab-scientist/test-orders", label: "Test orders", icon: labIconUrl },
        // Everyone reads it; the lab's admin also adds and edits its tests.
        {
          to: "/hospital/lab-scientist/test-catalogue",
          label: "Test catalogue",
          icon: labResultIconUrl,
        },
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
        ...(admin ? [auditLogs] : []),
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
