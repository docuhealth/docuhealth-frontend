import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AccountCreatedDialog } from "@/features/auth/components/account-created-dialog";
import { AccountDetailsForm } from "@/features/auth/components/account-details-form";
import { IndividualInfoForm } from "@/features/auth/components/individual-info-form";
import { VerifyCodeForm } from "@/features/auth/components/verify-code-form";
import type { AccountDetailsValues, IndividualInfoValues } from "@/features/auth/lib/schemas";

const TOTAL_STEPS = 3;

/** The individual sign-up flow; keeps each step's answers while the user moves between steps. */
export function IndividualSignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [info, setInfo] = useState<IndividualInfoValues>();
  const [hin, setHin] = useState<string>();

  async function register(_details: AccountDetailsValues) {
    // TODO(api): register with `info` + `_details` and show the HIN from the response once the
    // v2 auth API is defined. Until then this is a placeholder number.
    await Promise.resolve();
    setHin("123456789");
  }

  if (step === 3 && info) {
    return (
      <>
        <AccountDetailsForm step={3} totalSteps={TOTAL_STEPS} onRegister={register} />
        <AccountCreatedDialog
          open={hin !== undefined}
          hin={hin ?? ""}
          onDone={() => void navigate({ to: "/login" })}
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
        onVerified={() => setStep(3)}
      />
    );
  }

  return (
    <IndividualInfoForm
      step={1}
      totalSteps={TOTAL_STEPS}
      defaultValues={info}
      onContinue={(values) => {
        setInfo(values);
        setStep(2);
      }}
    />
  );
}
