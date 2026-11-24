import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { useLogOut } from "@/hooks/use-log-out";
import { requireDashboard } from "@/lib/auth-guards";

/** Where a staff member whose role has no dashboard yet lands, instead of someone else's. */
export const Route = createFileRoute("/hospital/no-dashboard")({
  beforeLoad: () => requireDashboard("/hospital/no-dashboard"),
  component: NoDashboardPage,
});

function NoDashboardPage() {
  const logOut = useLogOut();
  return (
    <AuthLayout>
      <title>No dashboard yet · DocuHealth</title>
      <div className="flex flex-col gap-4">
        <h1 className="type-h3">Your dashboard isn’t ready yet</h1>
        <p className="type-body text-fg-body">
          DocuHealth doesn’t have a dashboard for your role yet. Your hospital’s admin can change
          your role, or you can check back soon.
        </p>
        <Button className="h-12 w-full sm:w-fit sm:px-6" onClick={() => void logOut()}>
          Log out
        </Button>
      </div>
    </AuthLayout>
  );
}
