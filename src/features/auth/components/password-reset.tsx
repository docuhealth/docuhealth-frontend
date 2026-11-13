import { type LinkProps, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  useForgotPassword,
  useResetPassword,
  useVerifyForgotPasswordOtp,
} from "@/features/auth/api/mutations";
import { NewPasswordForm } from "@/features/auth/components/new-password-form";
import { RequestResetForm } from "@/features/auth/components/request-reset-form";
import { VerifyCodeForm } from "@/features/auth/components/verify-code-form";
import type { ForgotPasswordValues, ResetPasswordValues } from "@/features/auth/lib/schemas";
import { getErrorMessage } from "@/lib/api";
import type { AccountType } from "@/stores/auth-store";

const copy = {
  individual: {
    accountType: "patient" as AccountType,
    description: "Enter your registered email and we’ll send you a code to reset your password.",
    loginTo: "/login",
  },
  hospital: {
    accountType: "staff" as AccountType,
    description:
      "Enter your facility’s registered email and we’ll send you a code to reset your password.",
    loginTo: "/hospital/login",
  },
} satisfies Record<
  string,
  { accountType: AccountType; description: string; loginTo: LinkProps["to"] }
>;

/**
 * Password reset: email, then the code we send to it, then the new password. Keeps the email
 * so "Change" can go back to it. `audience` picks the copy and which login to return to.
 */
export function PasswordReset({ audience }: { audience: keyof typeof copy }) {
  const { accountType, description, loginTo } = copy[audience];
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);

  const forgotPasswordMutation = useForgotPassword();
  const verifyOtpMutation = useVerifyForgotPasswordOtp();
  const resetPasswordMutation = useResetPassword();

  async function requestReset(values: ForgotPasswordValues) {
    try {
      const normalizedEmail = values.email.trim();
      await forgotPasswordMutation.mutateAsync({
        email: normalizedEmail,
        account_type: accountType,
      });
      setEmail(normalizedEmail);
      setStep("code");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function verifyCode(code: string) {
    try {
      const response = await verifyOtpMutation.mutateAsync({
        email,
        otp: code,
        account_type: accountType,
      });
      setResetToken(response.resetToken);
      setStep("password");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function resetPassword(values: ResetPasswordValues) {
    try {
      await resetPasswordMutation.mutateAsync({
        new_password: values.password,
        resetToken,
      });
      toast.success("Password updated. Log in with your new password.");
      await navigate({ to: loginTo });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  if (step === "password") {
    return <NewPasswordForm title="Create new password" onSubmit={resetPassword} />;
  }

  if (step === "code") {
    return (
      <VerifyCodeForm
        email={email}
        title="Verify your email"
        login={{ prompt: "Remember your password?", to: loginTo }}
        onChangeEmail={() => setStep("email")}
        onVerified={verifyCode}
        onResend={async () => {
          await forgotPasswordMutation.mutateAsync({
            email,
            account_type: accountType,
          });
        }}
      />
    );
  }

  return (
    <RequestResetForm
      description={description}
      submitLabel="Send code"
      loginTo={loginTo}
      defaultEmail={email}
      onSubmit={requestReset}
    />
  );
}
