import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { radiologistProfileQuery } from "@/features/radiologist/api/queries";
import { RadiologistSidebar } from "@/features/radiologist/components/radiologist-sidebar";
import { RadiologistTopBar } from "@/features/radiologist/components/radiologist-top-bar";

/** The radiologist dashboard: sidebar, top bar and the current page. */
export const Route = createFileRoute("/hospital/radiologist")({
  // TODO(api): only let signed-in radiologists in (redirect to /hospital/login) once the
  // hospital login is connected to the API.
  loader: ({ context }) => context.queryClient.ensureQueryData(radiologistProfileQuery()),
  component: RadiologistLayout,
});

function RadiologistLayout() {
  const { data: profile } = useSuspenseQuery(radiologistProfileQuery());

  return (
    <SidebarProvider>
      <RadiologistSidebar unreadMessages={profile.unreadMessages} />
      <SidebarInset className="min-w-0 bg-background">
        <RadiologistTopBar profile={profile} />
        <div className="flex-1 p-4 sm:p-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
