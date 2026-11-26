import { type LinkProps, useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
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
    description:
      "Enter your registered email or phone number and we’ll send you a code to reset your password.",
    loginTo: "/login",
    allowPhone: true,
  },
  hospital: {
    accountType: "staff" as AccountType,
    description:
      "Enter your facility’s registered email and we’ll send you a code to reset your password.",
    loginTo: "/hospital/login",
    allowPhone: false,
  },
  // The API wants no account type for DocuHealth's own admins.
  dhadmin: {
    accountType: null,
    description: "Enter your admin email and we’ll send you a code to reset your password.",
    loginTo: "/admin/login",
    allowPhone: false,
  },
} satisfies Record<
  string,
  {
    accountType: AccountType | null;
    description: string;
    loginTo: LinkProps["to"];
    allowPhone: boolean;
  }
>;

/**
 * Password reset: email (or a patient's phone), then the code we send to it, then the new
 * password. Keeps what was entered so "Change" can go back to it. `audience` picks the copy and
 * which login to return to. The API answers the same whether or not the account exists.
 */
export function PasswordReset({ audience }: { audience: keyof typeof copy }) {
  const { accountType, description, loginTo, allowPhone } = copy[audience];
  const navigate = useNavigate();
  const [step, setStep] = useState<"identifier" | "code" | "password">("identifier");
  const [identifier, setIdentifier] = useState("");

  const forgotPasswordMutation = useForgotPassword();
  const verifyOtpMutation = useVerifyForgotPasswordOtp();
  const resetPasswordMutation = useResetPassword();

  async function requestReset(values: ForgotPasswordValues) {
    try {
      const entered = values.identifier.trim();
      await forgotPasswordMutation.mutateAsync({
        identifier: entered,
        account_type: accountType ?? undefined,
      });
      setIdentifier(entered);
      setStep("code");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function verifyCode(code: string) {
    try {
      // A right code sets a 5-minute access cookie that the new password is sent with.
      await verifyOtpMutation.mutateAsync({
        identifier,
        otp: code,
        account_type: accountType ?? undefined,
      });
      setStep("password");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function resetPassword(values: ResetPasswordValues) {
    try {
      await resetPasswordMutation.mutateAsync({ new_password: values.password });
      toast.success("Password updated. Log in with your new password.");
      await navigate({ to: loginTo });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        // The code's cookie lasts 5 minutes.
        toast.error("That took longer than 5 minutes. Ask for a new code and try again.");
        setStep("identifier");
        return;
      }
      toast.error(getErrorMessage(error));
    }
  }

  if (step === "password") {
    return <NewPasswordForm title="Create new password" onSubmit={resetPassword} />;
  }

  if (step === "code") {
    return (
      <VerifyCodeForm
        sentTo={identifier}
        channel={identifier.includes("@") ? "email" : "sms"}
        title={allowPhone ? "Enter your code" : "Verify your email"}
        login={{ prompt: "Remember your password?", to: loginTo }}
        onEdit={() => setStep("identifier")}
        onVerified={verifyCode}
        onResend={async () => {
          await forgotPasswordMutation.mutateAsync({
            identifier,
            account_type: accountType ?? undefined,
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
      allowPhone={allowPhone}
      defaultIdentifier={identifier}
      onSubmit={requestReset}
    />
  );
}
