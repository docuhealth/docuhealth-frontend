import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  buildSessionFromLoginResponse,
  useCompletePatientSignup,
  useStartPatientSignup,
  useVerifyPatientSignupCode,
} from "@/features/auth/api/mutations";
import { AccountCreatedDialog } from "@/features/auth/components/account-created-dialog";
import { AccountDetailsForm } from "@/features/auth/components/account-details-form";
import { IndividualInfoForm } from "@/features/auth/components/individual-info-form";
import { VerifyCodeForm } from "@/features/auth/components/verify-code-form";
import type { AccountDetailsValues, IndividualInfoValues } from "@/features/auth/lib/schemas";
import { getErrorMessage } from "@/lib/api";
import { getPostLoginDestination, useAuthStore } from "@/stores/auth-store";

const TOTAL_STEPS = 3;

/** The individual sign-up flow; keeps each step's answers while the user moves between steps. */
export function IndividualSignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [info, setInfo] = useState<IndividualInfoValues>();
  const [signupToken, setSignupToken] = useState<string>();
  const [hin, setHin] = useState<string>();

  const startSignupMutation = useStartPatientSignup();
  const verifyCodeMutation = useVerifyPatientSignupCode();
  const completeSignupMutation = useCompletePatientSignup();

  async function sendSignupCode(values: IndividualInfoValues) {
    await startSignupMutation.mutateAsync({
      firstname: values.firstName.trim(),
      lastname: values.lastName.trim(),
      middlename: values.otherName.trim() || undefined,
      gender: values.gender,
      dob: values.dob,
      email: values.email.trim(),
      phone: values.phone.trim(),
      verify_by: "email",
      login_url: `${window.location.origin}/login`,
    });
  }

  async function handleStartSignup(values: IndividualInfoValues) {
    try {
      await sendSignupCode(values);
      setInfo(values);
      setStep(2);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleVerifyCode(code: string) {
    if (!info) return;
    try {
      const response = await verifyCodeMutation.mutateAsync({
        email: info.email.trim(),
        verify_by: "email",
        code,
      });
      setSignupToken(response.signup_token);
      setStep(3);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function register(details: AccountDetailsValues) {
    if (!info || !signupToken) return;
    try {
      const response = await completeSignupMutation.mutateAsync({
        signup_token: signupToken,
        nin: details.nin,
        password: details.password,
      });
      const session = buildSessionFromLoginResponse(response, {
        accountType: "patient",
        identifier: info.email.trim(),
        fallbackName: `${info.firstName.trim()} ${info.lastName.trim()}`,
      });
      useAuthStore.getState().setSession(session);
      setHin(session.user.hin ?? String(response.hin ?? ""));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  if (step === 3 && info) {
    return (
      <>
        <AccountDetailsForm step={3} totalSteps={TOTAL_STEPS} onRegister={register} />
        <AccountCreatedDialog
          open={hin !== undefined}
          hin={hin ?? ""}
          onDone={() => {
            const destination = getPostLoginDestination(useAuthStore.getState().session);
            void navigate({ to: destination });
          }}
        />
      </>
    );
  }

  if (step === 2 && info) {
    return (
      <VerifyCodeForm
        email={info.email}
        step={2}
        totalSteps={TOTAL_STEPS}
        onChangeEmail={() => setStep(1)}
        onVerified={handleVerifyCode}
        onResend={async () => {
          await sendSignupCode(info);
        }}
      />
    );
  }

  return (
    <IndividualInfoForm
      step={1}
      totalSteps={TOTAL_STEPS}
      defaultValues={info}
      onContinue={handleStartSignup}
    />
  );
}
