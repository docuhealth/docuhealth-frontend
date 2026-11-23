import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DhAdminSidebar } from "@/features/dh-admin/components/dh-admin-sidebar";
import { DhAdminTopBar } from "@/features/dh-admin/components/dh-admin-top-bar";
import { requireDashboard } from "@/lib/auth-guards";

/** DocuHealth's own admin dashboard (admin.<domain>): sidebar, top bar and the current page. */
export const Route = createFileRoute("/admin/_dashboard")({
  beforeLoad: () => requireDashboard("/admin"),
  component: DhAdminLayout,
});

function DhAdminLayout() {
  return (
    <SidebarProvider>
      <DhAdminSidebar />
      <SidebarInset className="min-w-0 bg-background">
        <DhAdminTopBar />
        <div className="flex-1 p-4 sm:p-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
