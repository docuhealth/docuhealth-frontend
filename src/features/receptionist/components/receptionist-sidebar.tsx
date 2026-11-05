import appointmentIconUrl from "@/assets/svgs/appointment.svg";
import dashboardIconUrl from "@/assets/svgs/dashboard.svg";
import healthIconUrl from "@/assets/svgs/health.svg";
import messagesIconUrl from "@/assets/svgs/messages.svg";
import patientIconUrl from "@/assets/svgs/patient.svg";
import settingsIconUrl from "@/assets/svgs/settings.svg";
import staffIconUrl from "@/assets/svgs/staff.svg";
import { DashboardSidebar, type NavGroup } from "@/components/dashboard/dashboard-sidebar";

/** The receptionist dashboard's navigation. */
export function ReceptionistSidebar({ unreadMessages }: { unreadMessages: number }) {
  // The design gives receptionists the admin's sections too; trim this once that's settled.
  const groups: NavGroup[] = [
    {
      label: "General",
      items: [
        { to: "/hospital/receptionist", label: "Dashboard", icon: dashboardIconUrl },
        { to: "/hospital/receptionist/staff", label: "Staff Mgt.", icon: staffIconUrl },
        { to: "/hospital/receptionist/patients", label: "Patient Mgt.", icon: patientIconUrl },
        {
          to: "/hospital/receptionist/appointments",
          label: "Appointments",
          icon: appointmentIconUrl,
        },
      ],
    },
    {
      label: "Communication",
      items: [
        {
          to: "/hospital/receptionist/messages",
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
          to: "/hospital/receptionist/personnel",
          label: "Health personnel",
          icon: healthIconUrl,
        },
        { to: "/hospital/receptionist/settings", label: "Settings", icon: settingsIconUrl },
      ],
    },
  ];

  return (
    <DashboardSidebar
      home="/hospital/receptionist"
      groups={groups}
      help="/hospital/receptionist/help"
    />
  );
}
