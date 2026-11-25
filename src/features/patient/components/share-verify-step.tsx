import { CaretRightIcon, ClockCounterClockwiseIcon } from "@phosphor-icons/react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect, useRef, useState } from "react";
import {
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { SHARE_CODE_LENGTH } from "@/features/patient/lib/sharing";
import { formatWait, useResendCooldown } from "@/hooks/use-resend-cooldown";
import { getErrorMessage } from "@/lib/api";

/**
 * Sharing, step 2 of 2: the one-time code sent by SMS, with "Send again" counting down as on
 * sign-up (verify-code-form.tsx). `error` is why the last code was refused.
 */
export function ShareVerifyStep({
  sentTo,
  pending,
  error,
  onBack,
  onVerify,
  onResend,
}: {
  sentTo: string;
  pending: boolean;
  error: string | null;
  onBack: () => void;
  onVerify: (code: string) => void;
  /** Resolves once a new code is on its way; rejects with what went wrong. */
  onResend: () => Promise<unknown>;
}) {
  const [code, setCode] = useState("");
  const [incomplete, setIncomplete] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const cooldown = useResendCooldown();
  const { started } = cooldown;
  const input = useRef<HTMLInputElement>(null);
  // The code is the only thing to do on this step, so start typing straight away.
  useEffect(() => input.current?.focus(), []);
  // A code was sent just before this step opened, so the next one waits.
  useEffect(() => started(), [started]);

  const waiting = cooldown.secondsLeft > 0;
  const message = incomplete ? `Enter the ${SHARE_CODE_LENGTH}-digit code` : error;

  async function resend() {
    setResending(true);
    setResendError(null);
    try {
      await onResend();
      cooldown.started();
    } catch (failure) {
      if (!cooldown.refused(failure)) setResendError(getErrorMessage(failure));
    } finally {
      setResending(false);
    }
  }

  return (
    <>
      <FormDialogHeader
        title="Verify account"
        description={`Enter the code sent by SMS to ${sentTo}`}
        progress={{ step: 2, total: 2 }}
      />
      <form
        noValidate
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          if (code.length < SHARE_CODE_LENGTH) {
            setIncomplete(true);
            return;
          }
          onVerify(code);
        }}
      >
        <FormDialogBody>
          <Field data-invalid={!!message}>
            <InputOTP
              ref={input}
              maxLength={SHARE_CODE_LENGTH}
              pattern={REGEXP_ONLY_DIGITS}
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label="Verification code"
              aria-invalid={!!message}
              value={code}
              onChange={(next) => {
                setCode(next);
                setIncomplete(false);
              }}
              containerClassName="w-full"
            >
              <InputOTPGroup className="w-full gap-2 sm:gap-3">
                {Array.from({ length: SHARE_CODE_LENGTH }, (_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    placeholder="-"
                    aria-invalid={!!message}
                    className="aspect-square h-auto max-h-18 flex-1 rounded-lg border bg-card type-accent-h2 text-fg-heading first:rounded-lg last:rounded-lg"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {message && <FieldError>{message}</FieldError>}
          </Field>
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              disabled={resending || waiting}
              onClick={() => void resend()}
              className="inline-flex items-center gap-1.5 type-body-sm-regular text-fg-caption transition-colors enabled:text-primary enabled:hover:underline disabled:cursor-default"
            >
              <ClockCounterClockwiseIcon className="size-4" aria-hidden />
              {resending
                ? "Sending…"
                : waiting
                  ? `Send again in ${formatWait(cooldown.secondsLeft)}`
                  : "Send again"}
            </button>
            {resendError && <p className="type-caption text-destructive">{resendError}</p>}
          </div>
        </FormDialogBody>
        <FormDialogFooter onBack={onBack}>
          <Button type="submit" loading={pending} className="h-11 px-5 type-heading-sm">
            Verify
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        </FormDialogFooter>
      </form>
    </>
  );
}
