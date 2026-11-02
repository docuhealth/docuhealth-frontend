import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { RequestResetForm } from "@/features/auth/components/forgot-password-form";
import { NewPasswordForm } from "@/features/auth/components/reset-password-form";
import { VerifyCodeForm } from "@/features/auth/components/verify-code-form";
import type { ResetPasswordValues } from "@/features/auth/lib/schemas";

/**
 * Hospital password reset: email, then the code we send to it, then the new password. Keeps
 * the email so "Change" can go back to it.
 */
export function HospitalPasswordReset() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [email, setEmail] = useState("");

  async function resetPassword(_values: ResetPasswordValues) {
    // TODO(api): send `email`, the verified code and the new password once the v2 auth API is
    // defined (keep the code from the verify step for this).
    toast.success("Password updated. Log in with your new password.");
    await navigate({ to: "/hospital/login" });
  }

  if (step === "password") {
    return <NewPasswordForm title="Create new password" onSubmit={resetPassword} />;
  }

  if (step === "code") {
    return (
      <VerifyCodeForm
        email={email}
        title="Verify your email"
        login={{ prompt: "Remember your password?", to: "/hospital/login" }}
        onChangeEmail={() => setStep("email")}
        onVerified={() => setStep("password")}
      />
    );
  }

  return (
    <RequestResetForm
      description="Enter your facility’s registered email and we’ll send you a code to reset your password."
      submitLabel="Send code"
      loginTo="/hospital/login"
      defaultEmail={email}
      onSubmit={(values) => {
        // TODO(api): call the forgot-password endpoint once the v2 auth API is defined.
        setEmail(values.email);
        setStep("code");
      }}
    />
  );
}
