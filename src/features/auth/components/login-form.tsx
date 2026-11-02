import { zodResolver } from "@hookform/resolvers/zod";
import { Link, type LinkProps } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthFooter, AuthHeader } from "@/features/auth/components/auth-header";
import { PasswordInput } from "@/features/auth/components/password-input";
import { devPrefill } from "@/features/auth/lib/dev-prefill";
import { loginSchema, type LoginValues } from "@/features/auth/lib/schemas";

const copy = {
  individual: {
    title: "Welcome back",
    description: "Log in to your DocuHealth account.",
    forgotPasswordTo: "/forgot-password",
    signUp: { prompt: "Don’t have an account?", linkText: "Create one", to: "/register" },
  },
  hospital: {
    title: "Log in to your facility",
    description: "Admins and staff, log in to your hospital’s DocuHealth dashboard.",
    forgotPasswordTo: "/hospital/forgot-password",
    signUp: {
      prompt: "New to DocuHealth?",
      linkText: "Register your facility",
      to: "/hospital/register",
    },
  },
} satisfies Record<
  string,
  {
    title: string;
    description: string;
    forgotPasswordTo: LinkProps["to"];
    signUp: { prompt: string; linkText: string; to: LinkProps["to"] };
  }
>;

/** Email and password login; `audience` picks the copy and where the links go. */
export function LoginForm({ audience }: { audience: keyof typeof copy }) {
  const { title, description, forgotPasswordTo, signUp } = copy[audience];
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
      <AuthHeader title={title} description={description} />

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
              <Link to={forgotPasswordTo} className="type-caption text-primary hover:underline">
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

      <AuthFooter {...signUp} />
    </div>
  );
}
