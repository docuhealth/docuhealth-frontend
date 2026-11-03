import { zodResolver } from "@hookform/resolvers/zod";
import type { LinkProps } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthFooter, AuthHeader } from "@/features/auth/components/auth-header";
import { devPrefill } from "@/features/auth/lib/dev-prefill";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/features/auth/lib/schemas";

/** The email field that starts a password reset. */
export function RequestResetForm({
  description,
  submitLabel,
  loginTo,
  defaultEmail,
  onSubmit,
}: {
  description: string;
  submitLabel: string;
  loginTo: LinkProps["to"];
  /** Email entered on an earlier visit to this step. */
  defaultEmail?: string;
  onSubmit: (values: ForgotPasswordValues) => void | Promise<void>;
}) {
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: defaultEmail
      ? { email: defaultEmail }
      : (devPrefill?.forgotPassword ?? { email: "" }),
  });
  const { errors, isSubmitting } = form.formState;

  return (
    <div className="flex flex-col gap-8">
      <AuthHeader title="Reset your password" description={description} />

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
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
