import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthLayout } from "@/features/auth/components/auth-layout";

/** Auth pages of DocuHealth's own admin section (admin.<domain>). */
export const Route = createFileRoute("/admin/_auth")({
  component: AdminAuthLayout,
});

function AdminAuthLayout() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}
