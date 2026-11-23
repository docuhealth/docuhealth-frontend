import admissionIconUrl from "@/assets/svgs/admission.svg";
import dashboardIconUrl from "@/assets/svgs/dashboard.svg";
import patientIconUrl from "@/assets/svgs/patient.svg";
import settingsIconUrl from "@/assets/svgs/settings.svg";
import walletIconUrl from "@/assets/svgs/wallet.svg";
import { DashboardSidebar, type NavGroup } from "@/components/dashboard/dashboard-sidebar";

/** DocuHealth's own admin dashboard's navigation. */
export function DhAdminSidebar() {
  const groups: NavGroup[] = [
    {
      label: "General",
      items: [
        { to: "/admin", label: "Overview", icon: dashboardIconUrl },
        { to: "/admin/users", label: "Users", icon: patientIconUrl },
        { to: "/admin/applications", label: "Facility applications", icon: admissionIconUrl },
        { to: "/admin/plans", label: "Subscription plans", icon: walletIconUrl },
      ],
    },
    {
      label: "Management",
      items: [{ to: "/admin/settings", label: "Settings", icon: settingsIconUrl }],
    },
  ];

  return <DashboardSidebar home="/admin" groups={groups} help="/admin/help" />;
}
