import { createFileRoute } from "@tanstack/react-router";
import { FirstLoginForm } from "@/features/auth/components/first-login-form";

export const Route = createFileRoute("/hospital/_auth/first-login")({
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
