import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useSendOldSignupCode, useVerifyOldSignupCode } from "@/features/auth/api/mutations";
import { OldSignupEmailForm } from "@/features/auth/components/old-signup-email-form";
import { VerifyCodeForm } from "@/features/auth/components/verify-code-form";
import { getErrorMessage } from "@/lib/api";
import { absoluteUrl } from "@/lib/sections";

/**
 * For someone who started the old (v1) sign-up, never finished, and already has records: the
 * new sign-up says their email has an account. They enter that email, get a code (or use the one
 * the old sign-up sent), and enter it; the account is then verified and they log in. The API
 * doesn't sign them in here. New users never need this.
 */
export function FinishOldSignup({ defaultEmail }: { defaultEmail?: string }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [codeJustSent, setCodeJustSent] = useState(true);

  const sendCodeMutation = useSendOldSignupCode();
  const verifyCodeMutation = useVerifyOldSignupCode();

  async function sendCode(to: string) {
    await sendCodeMutation.mutateAsync({ email: to, verify_url: absoluteUrl("/verify-account") });
  }

  async function verifyCode(code: string) {
    try {
      await verifyCodeMutation.mutateAsync({ email, otp: code });
      toast.success("Your account is verified. Log in to carry on.");
      await navigate({ to: "/login" });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  if (step === "code") {
    return (
      <VerifyCodeForm
        sentTo={email}
        title="Finish your sign-up"
        codeJustSent={codeJustSent}
        onEdit={() => setStep("email")}
        onVerified={verifyCode}
        onResend={() => sendCode(email)}
      />
    );
  }

  return (
    <OldSignupEmailForm
      defaultEmail={email}
      onSendCode={async (to) => {
        await sendCode(to);
        setEmail(to);
        setCodeJustSent(true);
        setStep("code");
      }}
      onHaveCode={(to) => {
        setEmail(to);
        setCodeJustSent(false);
        setStep("code");
      }}
    />
  );
}
