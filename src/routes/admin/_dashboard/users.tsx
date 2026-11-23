import { createFileRoute } from "@tanstack/react-router";
import { DhAdminUsers } from "@/features/dh-admin/components/dh-admin-users";

export const Route = createFileRoute("/admin/_dashboard/users")({
  component: UsersPage,
});

function UsersPage() {
  return (
    <>
      <title>Users · DocuHealth admin</title>
      <DhAdminUsers />
    </>
  );
}
