import { zodResolver } from "@hookform/resolvers/zod";
import type { LinkProps } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthFooter, AuthHeader } from "@/features/auth/components/auth-header";
import { devPrefill } from "@/features/auth/lib/dev-prefill";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
  patientForgotPasswordSchema,
} from "@/features/auth/lib/schemas";

/** The email (or, with `allowPhone`, email or phone) field that starts a password reset. */
export function RequestResetForm({
  description,
  submitLabel,
  loginTo,
  allowPhone = false,
  defaultIdentifier,
  onSubmit,
}: {
  description: string;
  submitLabel: string;
  loginTo: LinkProps["to"];
  /** Patients can reset by phone; staff and DocuHealth admins can't. */
  allowPhone?: boolean;
  /** What was entered on an earlier visit to this step. */
  defaultIdentifier?: string;
  onSubmit: (values: ForgotPasswordValues) => void | Promise<void>;
}) {
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(allowPhone ? patientForgotPasswordSchema : forgotPasswordSchema),
    defaultValues: defaultIdentifier
      ? { identifier: defaultIdentifier }
      : (devPrefill?.forgotPassword ?? { identifier: "" }),
  });
  const { errors, isSubmitting } = form.formState;

  return (
    <div className="flex flex-col gap-8">
      <AuthHeader title="Reset your password" description={description} />

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.identifier}>
            <FieldLabel htmlFor="identifier">
              {allowPhone ? "Email address or phone number" : "Email address"}
            </FieldLabel>
            <Input
              id="identifier"
              type={allowPhone ? "text" : "email"}
              autoComplete={allowPhone ? "username" : "email"}
              placeholder={allowPhone ? "you@example.com or 0803 123 4567" : "you@example.com"}
              aria-invalid={!!errors.identifier}
              className="bg-card"
              {...form.register("identifier")}
            />
            <FieldError errors={[errors.identifier]} />
          </Field>

          <Button type="submit" loading={isSubmitting} className="h-12 w-full">
            {submitLabel}
          </Button>
        </FieldGroup>
      </form>

      <AuthFooter prompt="Remember your password?" linkText="Log in" to={loginTo} />
    </div>
  );
}
