import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { env } from "@/env";
import { receptionistProfileQuery } from "@/features/receptionist/api/queries";
import { ReceptionistSidebar } from "@/features/receptionist/components/receptionist-sidebar";
import { ReceptionistTopBar } from "@/features/receptionist/components/receptionist-top-bar";
import { useAuthStore } from "@/stores/auth-store";

/** The receptionist dashboard: sidebar, top bar and the current page. */
export const Route = createFileRoute("/hospital/receptionist")({
  beforeLoad: () => {
    const { session } = useAuthStore.getState();
    if (session?.nextStep === "admin_details_required") {
      throw redirect({ to: "/hospital/first-login" });
    }
    if (!session && !env.VITE_ENABLE_MOCKS) {
      throw redirect({ to: "/hospital/login" });
    }
  },
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
