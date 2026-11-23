import { DashboardTopBar } from "@/components/dashboard/dashboard-top-bar";
import { useAuthStore } from "@/stores/auth-store";

/** The admin's top bar. TODO(api): there's no admin profile, so the name is what they signed in with. */
export function DhAdminTopBar() {
  const user = useAuthStore((state) => state.session?.user);
  return (
    <DashboardTopBar
      hospitalName="DocuHealth admin"
      user={{
        name: user?.name ?? "DocuHealth admin",
        email: user?.email ?? "",
        avatarUrl: null,
      }}
      unreadNotifications={0}
      settings="/admin/settings"
    />
  );
}
