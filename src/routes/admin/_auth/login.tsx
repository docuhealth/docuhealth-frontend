import { createFileRoute } from "@tanstack/react-router";
import { redirectIfSignedIn } from "@/lib/auth-guards";
import { LoginForm } from "@/features/auth/components/login-form";

export const Route = createFileRoute("/admin/_auth/login")({
  beforeLoad: redirectIfSignedIn,
  component: AdminLoginPage,
});

function AdminLoginPage() {
  return (
    <>
      <title>Admin log in · DocuHealth</title>
      <LoginForm audience="dhadmin" />
    </>
  );
}
