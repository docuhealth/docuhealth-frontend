import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { useLogOut } from "@/hooks/use-log-out";
import { requireDashboard } from "@/lib/auth-guards";
import { useAuthStore } from "@/stores/auth-store";

/** Where a staff member whose role has no dashboard yet lands, instead of someone else's. */
export const Route = createFileRoute("/hospital/no-dashboard")({
  beforeLoad: () => requireDashboard("/hospital/no-dashboard"),
  component: NoDashboardPage,
});

function NoDashboardPage() {
  const logOut = useLogOut();
  // No facility in the session: the staff member's membership has ended.
  const noFacility = useAuthStore((state) => !state.session?.actingAs?.length);
  return (
    <AuthLayout>
      <title>{noFacility ? "No facility · DocuHealth" : "No dashboard yet · DocuHealth"}</title>
      <div className="flex flex-col gap-4">
        <h1 className="type-h3">
          {noFacility ? "You’re not on a facility’s team" : "Your dashboard isn’t ready yet"}
        </h1>
        <p className="type-body text-fg-body">
          {noFacility
            ? "Your account isn’t part of a hospital or facility any more, so there’s no dashboard to show. If that’s a mistake, ask your facility’s admin to add you again."
            : "DocuHealth doesn’t have a dashboard for your role yet. Your hospital’s admin can change your role, or you can check back soon."}
        </p>
        <Button className="h-12 w-full sm:w-fit sm:px-6" onClick={() => void logOut()}>
          Log out
        </Button>
      </div>
    </AuthLayout>
  );
}
