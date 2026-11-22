import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireDashboard } from "@/lib/auth-guards";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { pharmacyProfileQuery } from "@/features/pharmacy/api/queries";
import { PharmacySidebar } from "@/features/pharmacy/components/pharmacy-sidebar";
import { PharmacyTopBar } from "@/features/pharmacy/components/pharmacy-top-bar";

/** The pharmacy dashboard: sidebar, top bar and the current page. */
export const Route = createFileRoute("/hospital/pharmacy")({
  beforeLoad: () => requireDashboard("/hospital/pharmacy"),
  loader: ({ context }) => context.queryClient.ensureQueryData(pharmacyProfileQuery()),
  component: PharmacyLayout,
});

function PharmacyLayout() {
  const { data: profile } = useSuspenseQuery(pharmacyProfileQuery());

  return (
    <SidebarProvider>
      <PharmacySidebar unreadMessages={profile.unreadMessages} />
      <SidebarInset className="min-w-0 bg-background">
        <PharmacyTopBar profile={profile} />
        <div className="flex-1 p-4 sm:p-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
