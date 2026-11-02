import { EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthFooter, AuthHeader, AuthNotice } from "@/features/auth/components/auth-header";
import { devPrefill } from "@/features/auth/lib/dev-prefill";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/features/auth/lib/schemas";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: devPrefill?.forgotPassword ?? { email: "" },
  });
  const { errors, isSubmitting } = form.formState;

  function onSubmit(_values: ForgotPasswordValues) {
    // TODO(api): call the forgot-password endpoint once the v2 auth API is defined.
    setSent(true);
  }

  if (sent) {
    return (
      <AuthNotice icon={<EnvelopeSimpleIcon />} title="Check your email">
        <p className="type-body-sm-regular text-muted-foreground">
          If that email is registered, we’ve sent a password reset link. Check your inbox and follow
          the instructions.
        </p>
        <p className="mt-3 type-caption text-muted-foreground">
          Remember it now?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </AuthNotice>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <AuthHeader
        title="Reset your password"
        description="Enter your email and we’ll send you a reset link."
      />

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
            Send reset link
          </Button>
        </FieldGroup>
      </form>

      <AuthFooter prompt="Remember your password?" linkText="Log in" to="/login" />
    </div>
  );
}
