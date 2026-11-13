import { CaretRightIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, type LinkProps } from "@tanstack/react-router";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { StepProgress } from "@/features/auth/components/step-progress";
import { devPrefill } from "@/features/auth/lib/dev-prefill";
import { OTP_LENGTH, verifyCodeSchema, type VerifyCodeValues } from "@/features/auth/lib/schemas";
import { getErrorMessage } from "@/lib/api";

/**
 * Confirms the email address with the code we sent to it — a sign-up step, or the middle of a
 * password reset, or admin email verification. The step bar shows only when `step` and `totalSteps` are given.
 */
export function VerifyCodeForm({
  email,
  step,
  totalSteps,
  title = "Verify account",
  login = { prompt: "Already have an account?", to: "/login" },
  onChangeEmail,
  onVerified,
  onResend,
}: {
  email: string;
  step?: number;
  totalSteps?: number;
  title?: string;
  /** Prompt and target of the "Log in" link under the button. Pass `null` to hide. */
  login?: { prompt: string; to: LinkProps["to"] } | null;
  /** Go back to the step where the email was entered. */
  onChangeEmail?: () => void;
  onVerified: (code: string) => void | Promise<void>;
  onResend?: () => void | Promise<void>;
}) {
  const form = useForm<VerifyCodeValues>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: devPrefill?.verifyCode ?? { code: "" },
  });
  const { isSubmitting } = form.formState;
  const [isResending, setIsResending] = useState(false);

  // The code is the only thing to do on this step, so start typing straight away.
  useEffect(() => form.setFocus("code"), [form]);

  async function onSubmit(values: VerifyCodeValues) {
    await onVerified(values.code);
  }

  async function resendCode() {
    if (!onResend) {
      toast.success(`We sent a new code to ${email}.`);
      return;
    }
    try {
      setIsResending(true);
      await onResend();
      toast.success(`We sent a new code to ${email}.`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {step !== undefined && totalSteps !== undefined && (
        <StepProgress step={step} total={totalSteps} />
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8" noValidate>
        <AuthHeader
          title={title}
          description={
            <>
              Enter the {OTP_LENGTH}-digit code we sent to {email}.
              {onChangeEmail && (
                <>
                  {" "}
                  <button
                    type="button"
                    onClick={onChangeEmail}
                    className="text-primary underline underline-offset-2"
                  >
                    Change
                  </button>
                </>
              )}
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
              disabled={isResending}
              onClick={() => void resendCode()}
              className="text-primary underline underline-offset-2 disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend Code"}
            </button>
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button type="submit" loading={isSubmitting} className="h-12 w-full">
            Verify
            <CaretRightIcon data-icon="inline-end" />
          </Button>
          {login && (
            <p className="text-center type-body-sm-regular text-muted-foreground">
              {login.prompt}{" "}
              <Link to={login.to} className="text-primary underline underline-offset-2">
                Log in
              </Link>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
