import admissionIconUrl from "@/assets/svgs/admission.svg";
import appointmentIconUrl from "@/assets/svgs/appointment.svg";
import dashboardIconUrl from "@/assets/svgs/dashboard.svg";
import healthIconUrl from "@/assets/svgs/health.svg";
import messagesIconUrl from "@/assets/svgs/messages.svg";
import patientIconUrl from "@/assets/svgs/patient.svg";
import settingsIconUrl from "@/assets/svgs/settings.svg";
import staffIconUrl from "@/assets/svgs/staff.svg";
import taskIconUrl from "@/assets/svgs/audit.svg";
import { DashboardSidebar, type NavGroup } from "@/components/dashboard/dashboard-sidebar";

/** The nurse dashboard's navigation. */
export function NurseSidebar({ unreadMessages }: { unreadMessages: number }) {
  const groups: NavGroup[] = [
    {
      label: "General",
      items: [
        { to: "/hospital/nurse", label: "Overview", icon: dashboardIconUrl },
        { to: "/hospital/nurse/encounters", label: "Nursing Encounter", icon: staffIconUrl },
        { to: "/hospital/nurse/handovers", label: "Handover notes", icon: admissionIconUrl },
        { to: "/hospital/nurse/tasks", label: "Tasks", icon: taskIconUrl },
        { to: "/hospital/nurse/patients", label: "Patient Mgt.", icon: patientIconUrl },
        { to: "/hospital/nurse/appointments", label: "Appointments", icon: appointmentIconUrl },
      ],
    },
    {
      label: "Communication",
      items: [
        {
          to: "/hospital/nurse/messages",
          label: "Messages",
          icon: messagesIconUrl,
          badge: unreadMessages,
        },
      ],
    },
    {
      label: "Management",
      items: [
        { to: "/hospital/nurse/personnel", label: "Health personnel", icon: healthIconUrl },
        { to: "/hospital/nurse/settings", label: "Settings", icon: settingsIconUrl },
      ],
    },
  ];

  return <DashboardSidebar home="/hospital/nurse" groups={groups} help="/hospital/nurse/help" />;
}
