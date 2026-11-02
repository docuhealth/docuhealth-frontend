import { CaretRightIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { StepProgress } from "@/features/auth/components/step-progress";
import { devPrefill } from "@/features/auth/lib/dev-prefill";
import { OTP_LENGTH, verifyCodeSchema, type VerifyCodeValues } from "@/features/auth/lib/schemas";

/** Sign-up step that confirms the email address with the code we sent to it. */
export function VerifyCodeForm({
  email,
  step,
  totalSteps,
  onChangeEmail,
  onVerified,
}: {
  email: string;
  step: number;
  totalSteps: number;
  /** Go back to the step where the email was entered. */
  onChangeEmail: () => void;
  onVerified: () => void;
}) {
  const form = useForm<VerifyCodeValues>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: devPrefill?.verifyCode ?? { code: "" },
  });
  const { isSubmitting } = form.formState;

  // The code is the only thing to do on this step, so start typing straight away.
  useEffect(() => form.setFocus("code"), [form]);

  function onSubmit(_values: VerifyCodeValues) {
    // TODO(api): check the code once the v2 auth API is defined.
    onVerified();
  }

  function resendCode() {
    // TODO(api): ask the backend for a new code once the v2 auth API is defined.
    toast.success(`We sent a new code to ${email}.`);
  }

  return (
    <div className="flex flex-col gap-10">
      <StepProgress step={step} total={totalSteps} />

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8" noValidate>
        <AuthHeader
          title="Verify account"
          description={
            <>
              Enter the {OTP_LENGTH}-digit code we sent to {email}.{" "}
              <button
                type="button"
                onClick={onChangeEmail}
                className="text-primary underline underline-offset-2"
              >
                Change
              </button>
            </>
          }
        />

        <div className="flex flex-col gap-6">
          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <InputOTP
                  ref={field.ref}
                  maxLength={OTP_LENGTH}
                  pattern={REGEXP_ONLY_DIGITS}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-label="Verification code"
                  aria-invalid={fieldState.invalid}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  containerClassName="w-full"
                >
                  <InputOTPGroup className="w-full gap-3">
                    {Array.from({ length: OTP_LENGTH }, (_, index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        placeholder="-"
                        aria-invalid={fieldState.invalid}
                        className="h-18 flex-1 rounded-md border bg-card type-accent-h2 text-fg-heading first:rounded-l-md last:rounded-r-md"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <p className="text-center type-body-sm-regular text-muted-foreground">
            Didn’t receive the email?{" "}
            <button
              type="button"
              onClick={resendCode}
              className="text-primary underline underline-offset-2"
            >
              Resend Code
            </button>
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button type="submit" loading={isSubmitting} className="h-12 w-full">
            Verify
            <CaretRightIcon data-icon="inline-end" />
          </Button>
          <p className="text-center type-body-sm-regular text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary underline underline-offset-2">
              Log in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
