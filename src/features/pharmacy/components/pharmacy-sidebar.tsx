import appointmentIconUrl from "@/assets/svgs/appointment.svg";
import dashboardIconUrl from "@/assets/svgs/dashboard.svg";
import healthIconUrl from "@/assets/svgs/health.svg";
import messagesIconUrl from "@/assets/svgs/messages.svg";
import prescriptionIconUrl from "@/assets/svgs/prescription.svg";
import settingsIconUrl from "@/assets/svgs/settings.svg";
import { DashboardSidebar, type NavGroup } from "@/components/dashboard/dashboard-sidebar";

/** The pharmacy dashboard's navigation. */
export function PharmacySidebar({ unreadMessages }: { unreadMessages: number }) {
  const groups: NavGroup[] = [
    {
      label: "General",
      items: [
        { to: "/hospital/pharmacy", label: "Overview", icon: dashboardIconUrl },
        {
          to: "/hospital/pharmacy/prescriptions",
          label: "Prescriptions",
          icon: prescriptionIconUrl,
        },
        { to: "/hospital/pharmacy/appointments", label: "Appointments", icon: appointmentIconUrl },
      ],
    },
    {
      label: "Communication",
      items: [
        {
          to: "/hospital/pharmacy/messages",
          label: "Messages",
          icon: messagesIconUrl,
          badge: unreadMessages,
        },
      ],
    },
    {
      label: "Management",
      items: [
        { to: "/hospital/pharmacy/personnel", label: "Health personnel", icon: healthIconUrl },
        { to: "/hospital/pharmacy/settings", label: "Settings", icon: settingsIconUrl },
      ],
    },
  ];

  return (
    <DashboardSidebar home="/hospital/pharmacy" groups={groups} help="/hospital/pharmacy/help" />
  );
}
