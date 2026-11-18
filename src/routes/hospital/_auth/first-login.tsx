import { createFileRoute } from "@tanstack/react-router";
import { requireGate } from "@/lib/auth-guards";
import { FirstLoginForm } from "@/features/auth/components/first-login-form";

export const Route = createFileRoute("/hospital/_auth/first-login")({
  beforeLoad: () => requireGate("admin_details_required"),
  component: FirstLoginPage,
});

function FirstLoginPage() {
  return (
    <>
      <title>Complete admin profile · DocuHealth</title>
      <FirstLoginForm />
    </>
  );
}
