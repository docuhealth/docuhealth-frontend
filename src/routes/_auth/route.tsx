import { createFileRoute, Outlet } from "@tanstack/react-router";
import { redirectIfSignedIn } from "@/features/auth/lib/guards";

export const Route = createFileRoute("/_auth")({
  beforeLoad: redirectIfSignedIn,
  component: () => (
    <main className="grid min-h-svh place-items-center bg-muted p-4">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </main>
  ),
});
