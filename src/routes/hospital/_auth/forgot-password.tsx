import { createFileRoute } from "@tanstack/react-router";
import { PasswordReset } from "@/features/auth/components/password-reset";

export const Route = createFileRoute("/hospital/_auth/forgot-password")({
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
