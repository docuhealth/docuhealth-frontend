import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { hospitalProfileQuery } from "@/features/hospital-admin/api/queries";
import { AdminSidebar } from "@/features/hospital-admin/components/admin-sidebar";
import { AdminTopBar } from "@/features/hospital-admin/components/admin-top-bar";

/** The hospital admin dashboard: sidebar, top bar and the current page. */
export const Route = createFileRoute("/hospital/admin")({
  // TODO(api): only let signed-in hospital admins in (redirect to /hospital/login) once the
  // hospital login is connected to the API.
  loader: ({ context }) => context.queryClient.ensureQueryData(hospitalProfileQuery()),
  component: HospitalAdminLayout,
});

function HospitalAdminLayout() {
  const { data: profile } = useSuspenseQuery(hospitalProfileQuery());

  return (
    <SidebarProvider>
      <AdminSidebar unreadMessages={profile.unreadMessages} />
      <SidebarInset className="min-w-0 bg-background">
        <AdminTopBar profile={profile} />
        <div className="flex-1 p-4 sm:p-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
