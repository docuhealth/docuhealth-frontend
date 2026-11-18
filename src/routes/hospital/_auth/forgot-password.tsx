import { createFileRoute } from "@tanstack/react-router";
import { redirectIfSignedIn } from "@/lib/auth-guards";
import { PasswordReset } from "@/features/auth/components/password-reset";

export const Route = createFileRoute("/hospital/_auth/forgot-password")({
  beforeLoad: redirectIfSignedIn,
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <>
      <title>Forgot password · DocuHealth</title>
      <PasswordReset audience="hospital" />
    </>
  );
}
