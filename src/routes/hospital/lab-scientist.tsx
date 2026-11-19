import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireDashboard } from "@/lib/auth-guards";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { labProfileQuery } from "@/features/lab-scientist/api/queries";
import { LabSidebar } from "@/features/lab-scientist/components/lab-sidebar";
import { LabTopBar } from "@/features/lab-scientist/components/lab-top-bar";

/** The lab scientist dashboard: sidebar, top bar and the current page. */
export const Route = createFileRoute("/hospital/lab-scientist")({
  beforeLoad: () => requireDashboard("/hospital/lab-scientist"),
  loader: ({ context }) => context.queryClient.ensureQueryData(labProfileQuery()),
  component: LabLayout,
});

function LabLayout() {
  const { data: profile } = useSuspenseQuery(labProfileQuery());

  return (
    <SidebarProvider>
      <LabSidebar unreadMessages={profile.unreadMessages} />
      <SidebarInset className="min-w-0 bg-background">
        <LabTopBar profile={profile} />
        <div className="flex-1 p-4 sm:p-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
