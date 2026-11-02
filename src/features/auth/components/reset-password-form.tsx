import { XCircleIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { AuthHeader, AuthNotice } from "@/features/auth/components/auth-header";
import { PasswordInput } from "@/features/auth/components/password-input";
import { devPrefill } from "@/features/auth/lib/dev-prefill";
import { resetPasswordSchema, type ResetPasswordValues } from "@/features/auth/lib/schemas";

/** `token` comes from the reset link in the email; without one the link is unusable. */
export function ResetPasswordForm({ token }: { token: string | undefined }) {
  const navigate = useNavigate();
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: devPrefill?.resetPassword ?? { password: "", confirmPassword: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(_values: ResetPasswordValues) {
    // TODO(api): send the new password with `token` once the v2 auth API is defined.
    toast.success("Password updated. Log in with your new password.");
    await navigate({ to: "/login" });
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-6">
        <AuthNotice icon={<XCircleIcon />} tone="error" title="Link expired">
          <p className="type-body-sm-regular text-muted-foreground">
            This reset link is invalid or has expired. Request a new one.
          </p>
        </AuthNotice>
        <Button asChild className="h-12 w-full">
          <Link to="/forgot-password">Request a new link</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <AuthHeader
        title="Set a new password"
        description="Choose a strong password you haven’t used before."
      />

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">New password</FieldLabel>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              aria-invalid={!!errors.password}
              className="bg-card"
              {...form.register("password")}
            />
            <FieldError errors={[errors.password]} />
          </Field>

          <Field data-invalid={!!errors.confirmPassword}>
            <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="Repeat your password"
              aria-invalid={!!errors.confirmPassword}
              className="bg-card"
              {...form.register("confirmPassword")}
            />
            <FieldError errors={[errors.confirmPassword]} />
          </Field>

          <Button type="submit" loading={isSubmitting} className="h-12 w-full">
            Set new password
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
