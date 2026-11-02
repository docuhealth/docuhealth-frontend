import { createFileRoute } from "@tanstack/react-router";
import { HospitalPasswordReset } from "@/features/auth/components/hospital-password-reset";

export const Route = createFileRoute("/hospital/_auth/forgot-password")({
  component: HospitalForgotPasswordPage,
});

function HospitalForgotPasswordPage() {
  return (
    <>
      <title>Forgot password · DocuHealth</title>
      <HospitalPasswordReset />
    </>
  );
}
