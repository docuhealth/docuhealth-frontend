import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PatientHeadingProvider } from "@/features/patient/components/page-heading";
import { PatientSidebar } from "@/features/patient/components/patient-sidebar";
import { PatientTopBar } from "@/features/patient/components/patient-top-bar";
import { usePatient } from "@/features/patient/lib/use-patient";
import { requireDashboard } from "@/lib/auth-guards";

/** The patient's dashboard (main site): sidebar, top bar and the current page. */
export const Route = createFileRoute("/patient")({
  beforeLoad: () => requireDashboard("/patient"),
  component: PatientLayout,
});

function PatientLayout() {
  const { name } = usePatient();
  return (
    <SidebarProvider>
      <PatientSidebar />
      <SidebarInset className="min-w-0 bg-background">
        <PatientHeadingProvider
          render={(heading) => <PatientTopBar heading={heading} name={name} />}
        >
          <div className="flex-1 p-4 sm:p-6">
            <Outlet />
          </div>
        </PatientHeadingProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
