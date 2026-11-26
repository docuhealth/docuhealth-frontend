import { UserCircleCheckIcon } from "@phosphor-icons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCompletePatientSignup,
  useStartPatientSignup,
  useVerifyPatientSignupCode,
} from "@/features/auth/api/mutations";
import { Button } from "@/components/ui/button";
import { AccountCreatedDialog } from "@/features/auth/components/account-created-dialog";
import { AccountDetailsForm } from "@/features/auth/components/account-details-form";
import { AuthNotice } from "@/features/auth/components/auth-header";
import { IndividualInfoForm } from "@/features/auth/components/individual-info-form";
import { VerifyCodeForm } from "@/features/auth/components/verify-code-form";
import type { AccountDetailsValues, IndividualInfoValues } from "@/features/auth/lib/schemas";
import { errorCode, getErrorMessage } from "@/lib/api";

const TOTAL_STEPS = 3;

/**
 * The individual sign-up flow; keeps each step's answers while the user moves between steps.
 * The API answers step 1 the same whether or not the contact has an account; only the right code
 * tells (409 `account_exists`), and then the person is sent to log in or reset their password,
 * or, for an email, to finish an old (v1) sign-up they never completed.
 */
export function IndividualSignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | "exists">(1);
  const [info, setInfo] = useState<IndividualInfoValues>();
  const [sentTo, setSentTo] = useState("");
  const [signupToken, setSignupToken] = useState<string>();
  const [hin, setHin] = useState<string>();

  const startSignupMutation = useStartPatientSignup();
  const verifyCodeMutation = useVerifyPatientSignupCode();
  const completeSignupMutation = useCompletePatientSignup();

  /** Both contacts are sent; `verify_by` names the one that gets the code and becomes the login. */
  const contactOf = ({ contact }: IndividualInfoValues) => ({
    phone: contact.phone.trim(),
    email: contact.email.trim(),
    verify_by: contact.method,
  });
  const typedContact = ({ contact }: IndividualInfoValues) =>
    (contact.method === "phone" ? contact.phone : contact.email).trim();

  async function sendSignupCode(values: IndividualInfoValues) {
    const { destination } = await startSignupMutation.mutateAsync({
      firstname: values.firstName.trim(),
      lastname: values.lastName.trim(),
      middlename: values.otherName.trim() || undefined,
      gender: values.gender,
      dob: values.dob,
      ...contactOf(values),
    });
    setSentTo(destination ?? typedContact(values));
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
      const response = await verifyCodeMutation.mutateAsync({ ...contactOf(info), code });
      setSignupToken(response.signup_token);
      setStep(3);
    } catch (error) {
      if (errorCode(error) === "account_exists") setStep("exists");
      else toast.error(getErrorMessage(error));
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
      // The API signs them in, but they log in themselves next (a fresh start on the login page).
      setHin(String(response.hin ?? response.user?.hin ?? ""));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  if (step === "exists" && info) {
    // The old sign-up was email-only, so only an email can have one left unfinished.
    const byEmail = info.contact.method === "email";
    return (
      <div className="flex flex-col gap-8">
        <AuthNotice icon={<UserCircleCheckIcon />} title="You already have an account">
          <p className="type-body-sm-regular text-muted-foreground">
            {sentTo} already belongs to a DocuHealth account. Log in, or reset your password if
            you’ve forgotten it.
            {byEmail && " If you started signing up before and didn’t finish, finish that sign-up."}
          </p>
        </AuthNotice>
        <div className="flex flex-col gap-3">
          <Button asChild className="h-12 w-full">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild variant="outline" className="h-12 w-full bg-card">
            <Link to="/forgot-password">Reset password</Link>
          </Button>
          {byEmail && (
            <Button asChild variant="ghost" className="h-12 w-full">
              <Link to="/verify-account" search={{ email: info.contact.email.trim() }}>
                Finish an earlier sign-up
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (step === 3 && info) {
    return (
      <>
        <AccountDetailsForm step={3} totalSteps={TOTAL_STEPS} onRegister={register} />
        <AccountCreatedDialog
          open={hin !== undefined}
          hin={hin ?? ""}
          loginWith={info.contact.method === "phone" ? "phone number" : "email"}
          onDone={() => void navigate({ to: "/login" })}
        />
      </>
    );
  }

  if (step === 2 && info) {
    return (
      <VerifyCodeForm
        sentTo={sentTo}
        channel={info.contact.method === "phone" ? "sms" : "email"}
        step={2}
        totalSteps={TOTAL_STEPS}
        onEdit={() => setStep(1)}
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
