import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { env } from "@/env";
import { hospitalProfileQuery } from "@/features/hospital-admin/api/queries";
import { AdminSidebar } from "@/features/hospital-admin/components/admin-sidebar";
import { AdminTopBar } from "@/features/hospital-admin/components/admin-top-bar";
import { useAuthStore } from "@/stores/auth-store";

/** The hospital admin dashboard: sidebar, top bar and the current page. */
export const Route = createFileRoute("/hospital/admin")({
  beforeLoad: () => {
    const { session } = useAuthStore.getState();
    if (session?.nextStep === "admin_details_required") {
      throw redirect({ to: "/hospital/first-login" });
    }
    if (!session && !env.VITE_ENABLE_MOCKS) {
      throw redirect({ to: "/hospital/login" });
    }
  },
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
