import { CaretRightIcon, IdentificationCardIcon, LockIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { NinHint } from "@/components/nin-hint";
import { RequiredMark } from "@/components/required-mark";
import { StepProgress } from "@/features/auth/components/step-progress";
import { devPrefill } from "@/features/auth/lib/dev-prefill";
import {
  accountDetailsSchema,
  type AccountDetailsInput,
  type AccountDetailsValues,
} from "@/features/auth/lib/schemas";

/** Last step of the individual sign-up: NIN and the password for the new account. */
export function AccountDetailsForm({
  step,
  totalSteps,
  onRegister,
}: {
  step: number;
  totalSteps: number;
  onRegister: (values: AccountDetailsValues) => Promise<void>;
}) {
  const form = useForm<AccountDetailsInput, unknown, AccountDetailsValues>({
    resolver: zodResolver(accountDetailsSchema),
    defaultValues: devPrefill?.accountDetails ?? { nin: "", password: "", confirmPassword: "" },
  });
  const { errors, isSubmitting } = form.formState;

  return (
    <div className="flex flex-col gap-10">
      <StepProgress step={step} total={totalSteps} />

      <AuthHeader
        title="Contact & account details"
        description="Add the patient's contact info and create account."
      />

      <form onSubmit={form.handleSubmit(onRegister)} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.nin}>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="nin" className="gap-1">
                NIN <RequiredMark />
              </FieldLabel>
              <NinHint />
            </div>
            <InputGroup className="bg-card">
              <InputGroupInput
                id="nin"
                inputMode="numeric"
                autoComplete="off"
                placeholder="000-000-0000"
                aria-required
                aria-invalid={!!errors.nin}
                {...form.register("nin")}
              />
              <InputGroupAddon>
                <IdentificationCardIcon />
              </InputGroupAddon>
            </InputGroup>
            <FieldError errors={[errors.nin]} />
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password" className="gap-1">
              Password <RequiredMark />
            </FieldLabel>
            <InputGroup className="bg-card">
              <InputGroupInput
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter password"
                aria-required
                aria-invalid={!!errors.password}
                {...form.register("password")}
              />
              <InputGroupAddon>
                <LockIcon />
              </InputGroupAddon>
            </InputGroup>
            <FieldError errors={[errors.password]} />
          </Field>

          <Field data-invalid={!!errors.confirmPassword}>
            <FieldLabel htmlFor="confirmPassword" className="gap-1">
              Confirm Password <RequiredMark />
            </FieldLabel>
            <InputGroup className="bg-card">
              <InputGroupInput
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Enter password"
                aria-required
                aria-invalid={!!errors.confirmPassword}
                {...form.register("confirmPassword")}
              />
              <InputGroupAddon>
                <LockIcon />
              </InputGroupAddon>
            </InputGroup>
            <FieldError errors={[errors.confirmPassword]} />
          </Field>

          <Button type="submit" loading={isSubmitting} className="mt-3 h-12 w-full">
            Register
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
