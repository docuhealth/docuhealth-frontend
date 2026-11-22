import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireDashboard } from "@/lib/auth-guards";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { clinicalProfileQuery } from "@/features/clinical/api/queries";
import { ClinicalTopBar } from "@/features/clinical/components/clinical-top-bar";
import { DoctorSidebar } from "@/features/doctor/components/doctor-sidebar";

/** The doctor dashboard: sidebar, top bar and the current page. */
export const Route = createFileRoute("/hospital/doctor")({
  beforeLoad: () => requireDashboard("/hospital/doctor"),
  loader: ({ context }) => context.queryClient.ensureQueryData(clinicalProfileQuery()),
  component: DoctorLayout,
});

function DoctorLayout() {
  const { data: profile } = useSuspenseQuery(clinicalProfileQuery());

  return (
    <SidebarProvider>
      <DoctorSidebar unreadMessages={profile.unreadMessages} />
      <SidebarInset className="min-w-0 bg-background">
        <ClinicalTopBar dashboard="doctor" profile={profile} />
        <div className="flex-1 p-4 sm:p-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
