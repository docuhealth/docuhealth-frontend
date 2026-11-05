import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { receptionistProfileQuery } from "@/features/receptionist/api/queries";
import { ReceptionistSidebar } from "@/features/receptionist/components/receptionist-sidebar";
import { ReceptionistTopBar } from "@/features/receptionist/components/receptionist-top-bar";

/** The receptionist dashboard: sidebar, top bar and the current page. */
export const Route = createFileRoute("/hospital/receptionist")({
  // TODO(api): only let signed-in receptionists in (redirect to /hospital/login) once the
  // hospital login is connected to the API.
  loader: ({ context }) => context.queryClient.ensureQueryData(receptionistProfileQuery()),
  component: ReceptionistLayout,
});

function ReceptionistLayout() {
  const { data: profile } = useSuspenseQuery(receptionistProfileQuery());

  return (
    <SidebarProvider>
      <ReceptionistSidebar unreadMessages={profile.unreadMessages} />
      <SidebarInset className="min-w-0 bg-background">
        <ReceptionistTopBar profile={profile} />
        <div className="flex-1 p-4 sm:p-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
