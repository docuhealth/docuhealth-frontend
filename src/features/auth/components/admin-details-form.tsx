import { CaretRightIcon, EnvelopeSimpleIcon, PhoneIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { RequiredMark } from "@/components/required-mark";
import { StepProgress } from "@/features/auth/components/step-progress";
import { devPrefill } from "@/features/auth/lib/dev-prefill";
import { adminDetailsSchema, type AdminDetailsValues } from "@/features/auth/lib/schemas";

/** Last step of facility verification: the admin who gets the setup invite. */
export function AdminDetailsForm({
  step,
  totalSteps,
  onRegister,
}: {
  step: number;
  totalSteps: number;
  onRegister: (values: AdminDetailsValues) => Promise<void>;
}) {
  const form = useForm<AdminDetailsValues>({
    resolver: zodResolver(adminDetailsSchema),
    defaultValues: devPrefill?.adminDetails ?? {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });
  const { errors, isSubmitting } = form.formState;

  return (
    <div className="flex flex-col gap-10">
      <StepProgress step={step} total={totalSteps} />

      <AuthHeader title="Admin Details" description="Who should we send the setup invite to?" />

      <form onSubmit={form.handleSubmit(onRegister)} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.firstName}>
            <FieldLabel htmlFor="firstName" className="gap-1">
              First name <RequiredMark />
            </FieldLabel>
            <Input
              id="firstName"
              autoComplete="given-name"
              placeholder="E.g. John"
              aria-required
              aria-invalid={!!errors.firstName}
              className="bg-card"
              {...form.register("firstName")}
            />
            <FieldError errors={[errors.firstName]} />
          </Field>

          <Field data-invalid={!!errors.lastName}>
            <FieldLabel htmlFor="lastName" className="gap-1">
              Last name <RequiredMark />
            </FieldLabel>
            <Input
              id="lastName"
              autoComplete="family-name"
              placeholder="E.g. Doe"
              aria-required
              aria-invalid={!!errors.lastName}
              className="bg-card"
              {...form.register("lastName")}
            />
            <FieldError errors={[errors.lastName]} />
          </Field>

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email" className="gap-1">
              Email address <RequiredMark />
            </FieldLabel>
            <InputGroup className="bg-card">
              <InputGroupInput
                id="email"
                type="email"
                autoComplete="email"
                placeholder="hospital@email.com"
                aria-required
                aria-invalid={!!errors.email}
                {...form.register("email")}
              />
              <InputGroupAddon>
                <EnvelopeSimpleIcon />
              </InputGroupAddon>
            </InputGroup>
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone" className="gap-1">
              Phone number <RequiredMark />
            </FieldLabel>
            <InputGroup className="bg-card">
              <InputGroupInput
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+234-000-000-0000"
                aria-required
                aria-invalid={!!errors.phone}
                {...form.register("phone")}
              />
              <InputGroupAddon>
                <PhoneIcon />
              </InputGroupAddon>
            </InputGroup>
            <FieldError errors={[errors.phone]} />
          </Field>

          <Button type="submit" loading={isSubmitting} className="mt-3 h-12 w-full">
            Register hospital
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
