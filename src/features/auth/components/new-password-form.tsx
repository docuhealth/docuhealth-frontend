import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { PasswordInput } from "@/features/auth/components/password-input";
import { devPrefill } from "@/features/auth/lib/dev-prefill";
import { resetPasswordSchema, type ResetPasswordValues } from "@/features/auth/lib/schemas";

/** New password + confirmation, the last step of every password reset. */
export function NewPasswordForm({
  title,
  onSubmit,
}: {
  title: string;
  onSubmit: (values: ResetPasswordValues) => Promise<void>;
}) {
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: devPrefill?.resetPassword ?? { password: "", confirmPassword: "" },
  });
  const { errors, isSubmitting } = form.formState;

  return (
    <div className="flex flex-col gap-8">
      <AuthHeader title={title} description="Choose a strong password you haven’t used before." />

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
