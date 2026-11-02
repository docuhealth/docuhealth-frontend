import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthFooter, AuthHeader } from "@/features/auth/components/auth-header";
import { PasswordInput } from "@/features/auth/components/password-input";
import { devPrefill } from "@/features/auth/lib/dev-prefill";
import { loginSchema, type LoginValues } from "@/features/auth/lib/schemas";

export function LoginForm() {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: devPrefill?.login ?? { email: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  function onSubmit(_values: LoginValues) {
    // TODO(api): call the login endpoint once the v2 auth API is defined.
    toast.info("Logging in isn’t connected to the API yet.");
  }

  return (
    <div className="flex flex-col gap-8">
      <AuthHeader title="Welcome back" description="Log in to your DocuHealth account." />

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

          <Field data-invalid={!!errors.password}>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Link to="/forgot-password" className="type-caption text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              className="bg-card"
              {...form.register("password")}
            />
            <FieldError errors={[errors.password]} />
          </Field>

          <Button type="submit" loading={isSubmitting} className="h-12 w-full">
            Log in
          </Button>
        </FieldGroup>
      </form>

      <AuthFooter prompt="Don’t have an account?" linkText="Create one" to="/register" />
    </div>
  );
}
