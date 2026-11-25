import { CaretRightIcon, ClockCounterClockwiseIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LinkProps } from "@tanstack/react-router";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AuthHeader, LoginPrompt } from "@/features/auth/components/auth-header";
import { StepProgress } from "@/features/auth/components/step-progress";
import { devPrefill } from "@/features/auth/lib/dev-prefill";
import { OTP_LENGTH, verifyCodeSchema, type VerifyCodeValues } from "@/features/auth/lib/schemas";
import { formatWait, useResendCooldown } from "@/hooks/use-resend-cooldown";
import { getErrorMessage } from "@/lib/api";

const channelLabels = { sms: "SMS", email: "email" } as const;

/**
 * Confirms a phone number or an email with the code we sent to it: a sign-up step, the middle of
 * a password reset, or admin email verification. The step bar shows only when `step` and
 * `totalSteps` are given. A code was just sent, so "Send again" counts down first (and again
 * after each resend, or when the API says it's too soon); "Edit number" goes back to change it.
 */
export function VerifyCodeForm({
  sentTo,
  channel = "email",
  step,
  totalSteps,
  title = "Verify account",
  login = { prompt: "Already have an account?", to: "/login" },
  onEdit,
  onVerified,
  onResend,
}: {
  /** Where the code went, as the API reports it (`a***@example.com`, `+234••••••1234`). */
  sentTo: string;
  /** How it went: by text message or by email. */
  channel?: keyof typeof channelLabels;
  step?: number;
  totalSteps?: number;
  title?: string;
  /** Prompt and target of the "Log in" link under the button. Pass `null` to hide. */
  login?: { prompt: string; to: LinkProps["to"] } | null;
  /** Go back to the step where the number or email was entered. */
  onEdit?: () => void;
  onVerified: (code: string) => void | Promise<void>;
  onResend?: () => void | Promise<void>;
}) {
  const form = useForm<VerifyCodeValues>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: devPrefill?.verifyCode ?? { code: "" },
  });
  const { isSubmitting } = form.formState;
  const [isResending, setIsResending] = useState(false);
  const cooldown = useResendCooldown();
  const { started } = cooldown;
  const canResend = !!onResend;

  // The code is the only thing to do on this step, so start typing straight away.
  useEffect(() => form.setFocus("code"), [form]);
  // A code was sent just before this step opened, so the next one waits.
  useEffect(() => {
    if (canResend) started();
  }, [canResend, started]);

  async function onSubmit(values: VerifyCodeValues) {
    await onVerified(values.code);
  }

  async function resendCode() {
    if (!onResend) return;
    try {
      setIsResending(true);
      await onResend();
      cooldown.started();
      toast.success(`We sent a new code to ${sentTo}.`);
    } catch (error) {
      if (!cooldown.refused(error)) toast.error(getErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  }

  const waiting = cooldown.secondsLeft > 0;

  return (
    <div className="flex flex-col gap-10">
      {step !== undefined && totalSteps !== undefined && (
        <StepProgress step={step} total={totalSteps} />
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8" noValidate>
        <AuthHeader
          title={title}
          description={`Enter the ${OTP_LENGTH}-digit code sent by ${channelLabels[channel]} to ${sentTo}`}
        />

        <div className="flex flex-col gap-5">
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
                        className="aspect-square h-auto max-h-18 flex-1 rounded-lg border bg-card type-accent-h2 text-fg-heading first:rounded-lg last:rounded-lg"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 type-body-sm-regular text-fg-caption">
            {onResend && (
              <button
                type="button"
                disabled={isResending || waiting}
                onClick={() => void resendCode()}
                className="inline-flex items-center gap-1.5 transition-colors enabled:text-primary enabled:hover:underline disabled:cursor-default"
              >
                <ClockCounterClockwiseIcon className="size-4" aria-hidden />
                {isResending
                  ? "Sending…"
                  : waiting
                    ? `Send again in ${formatWait(cooldown.secondsLeft)}`
                    : "Send again"}
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-fg-heading"
              >
                <PencilSimpleIcon className="size-4" aria-hidden />
                {channel === "sms" ? "Edit number" : "Edit email"}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Button type="submit" loading={isSubmitting} className="h-12 w-full">
            {isSubmitting ? "Verify" : "Continue"}
            {!isSubmitting && <CaretRightIcon data-icon="inline-end" />}
          </Button>
          {login && <LoginPrompt prompt={login.prompt} to={login.to} />}
        </div>
      </form>
    </div>
  );
}
