import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthFooter, AuthHeader } from "@/features/auth/components/auth-header";
import { oldSignupEmailSchema, type OldSignupEmailValues } from "@/features/auth/lib/schemas";
import { formatWait, useResendCooldown } from "@/hooks/use-resend-cooldown";
import { getErrorMessage } from "@/lib/api";

/**
 * The first step of finishing an old sign-up: the email it was started with. "Send code" asks
 * for a code (`onSendCode` throws when the API refuses; a 429 waits as it asks); "I already have
 * a code" skips to the code, for someone the old sign-up already emailed.
 */
export function OldSignupEmailForm({
  defaultEmail,
  onSendCode,
  onHaveCode,
}: {
  defaultEmail?: string;
  onSendCode: (email: string) => Promise<void>;
  onHaveCode: (email: string) => void;
}) {
  const form = useForm<OldSignupEmailValues>({
    resolver: zodResolver(oldSignupEmailSchema),
    defaultValues: { email: defaultEmail ?? "" },
  });
  const { errors, isSubmitting } = form.formState;
  const cooldown = useResendCooldown();
  const waiting = cooldown.secondsLeft > 0;

  async function sendCode({ email }: OldSignupEmailValues) {
    try {
      await onSendCode(email);
    } catch (error) {
      if (!cooldown.refused(error)) toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <AuthHeader
        title="Finish your sign-up"
        description="Started signing up before and didn’t finish? Enter the email you used and we’ll send you a code to finish it."
      />

      <form onSubmit={form.handleSubmit(sendCode)} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email address</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              className="bg-card"
              {...form.register("email")}
            />
            <FieldError errors={[errors.email]} />
            {waiting && (
              <FieldDescription>
                We sent you a code a moment ago. Use it, or ask for another when the wait is over.
              </FieldDescription>
            )}
          </Field>

          <div className="flex flex-col gap-3">
            <Button type="submit" loading={isSubmitting} disabled={waiting} className="h-12 w-full">
              {waiting ? `Send again in ${formatWait(cooldown.secondsLeft)}` : "Send code"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="h-12 w-full bg-card"
              onClick={() => void form.handleSubmit(({ email }) => onHaveCode(email))()}
            >
              I already have a code
            </Button>
          </div>
        </FieldGroup>
      </form>

      <AuthFooter prompt="Already finished?" linkText="Log in" to="/login" />
    </div>
  );
}
