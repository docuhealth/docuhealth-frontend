import { zodResolver } from "@hookform/resolvers/zod";
import { Link, type LinkProps, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { buildSessionFromLoginResponse, useLogin } from "@/features/auth/api/mutations";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { PasswordInput } from "@/features/auth/components/password-input";
import { devPrefill } from "@/features/auth/lib/dev-prefill";
import {
  type LoginValues,
  patientLoginSchema,
  staffLoginSchema,
} from "@/features/auth/lib/schemas";
import { getErrorMessage } from "@/lib/api";
import { type AccountType, getPostLoginDestination, useAuthStore } from "@/stores/auth-store";

const copy = {
  individual: {
    title: "Welcome back",
    accountType: "patient" as AccountType,
    schema: patientLoginSchema,
    identifierLabel: "Email, phone number, or HIN",
    identifierPlaceholder: "you@example.com, +234..., or HIN",
    forgotPasswordTo: "/forgot-password",
    signUp: { prompt: "New to DocuHealth?", linkText: "Create an account", to: "/register" },
  },
  hospital: {
    title: "Log in to your facility",
    accountType: "staff" as AccountType,
    schema: staffLoginSchema,
    identifierLabel: "Email address or phone number",
    identifierPlaceholder: "you@facility.com or +234...",
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
    accountType: AccountType;
    schema: typeof patientLoginSchema;
    identifierLabel: string;
    identifierPlaceholder: string;
    forgotPasswordTo: LinkProps["to"];
    signUp: { prompt: string; linkText: string; to: LinkProps["to"] };
  }
>;

/** Identifier and password login; `audience` picks the copy, validation rules, and destination. */
export function LoginForm({ audience }: { audience: keyof typeof copy }) {
  const {
    title,
    accountType,
    schema,
    identifierLabel,
    identifierPlaceholder,
    forgotPasswordTo,
    signUp,
  } = copy[audience];
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: devPrefill?.login ?? { identifier: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: LoginValues) {
    try {
      const response = await loginMutation.mutateAsync({
        identifier: values.identifier.trim(),
        password: values.password,
        account_type: accountType,
      });
      const session = buildSessionFromLoginResponse(response, {
        accountType,
        identifier: values.identifier.trim(),
      });
      useAuthStore.getState().setSession(session);
      const destination = getPostLoginDestination(session);
      await navigate({ to: destination });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <AuthHeader
        title={title}
        description={
          <>
            {signUp.prompt}{" "}
            <Link to={signUp.to} className="text-primary hover:underline">
              {signUp.linkText}
            </Link>
          </>
        }
      />

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.identifier}>
            <FieldLabel htmlFor="identifier">{identifierLabel}</FieldLabel>
            <Input
              id="identifier"
              type="text"
              autoComplete="username"
              placeholder={identifierPlaceholder}
              aria-invalid={!!errors.identifier}
              className="bg-card"
              {...form.register("identifier")}
            />
            <FieldError errors={[errors.identifier]} />
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              className="bg-card"
              {...form.register("password")}
            />
            <FieldError errors={[errors.password]} />
            <Link
              to={forgotPasswordTo}
              className="w-fit! self-end type-caption text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </Field>

          <Button
            type="submit"
            loading={isSubmitting || loginMutation.isPending}
            className="h-12 w-full"
          >
            Log in
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
