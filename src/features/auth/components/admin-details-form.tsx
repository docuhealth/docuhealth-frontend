import { CaretRightIcon, EnvelopeSimpleIcon, PhoneIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { StepProgress } from "@/features/auth/components/step-progress";
import { devPrefill } from "@/features/auth/lib/dev-prefill";
import {
  adminDetailsSchema,
  type AdminDetailsValues,
  type AdminRole,
  adminRoleLabels,
  allowedRolesByFacilityType,
  genderLabels,
  type OrganisationType,
} from "@/features/auth/lib/schemas";

/** Admin details step of facility verification or field agent hospital registration. */
export function AdminDetailsForm({
  step,
  totalSteps,
  facilityType,
  defaultValues,
  submitLabel = "Continue",
  onRegister,
}: {
  step: number;
  totalSteps: number;
  facilityType?: OrganisationType;
  defaultValues?: AdminDetailsValues;
  submitLabel?: string;
  onRegister: (values: AdminDetailsValues) => Promise<void>;
}) {
  const allowedRoleKeys: AdminRole[] = facilityType
    ? allowedRolesByFacilityType[facilityType]
    : (Object.keys(adminRoleLabels) as AdminRole[]);

  const roleItems = Object.fromEntries(
    allowedRoleKeys.map((role) => [role, adminRoleLabels[role]]),
  ) as Record<AdminRole, string>;

  const defaultRole = allowedRoleKeys.length === 1 ? allowedRoleKeys[0] : undefined;

  const form = useForm<AdminDetailsValues>({
    resolver: zodResolver(adminDetailsSchema),
    defaultValues: defaultValues ??
      devPrefill?.adminDetails ?? {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: defaultRole,
        specialization: "",
      },
  });
  const { errors, isSubmitting } = form.formState;

  return (
    <div className="flex flex-col gap-10">
      <StepProgress step={step} total={totalSteps} />

      <AuthHeader title="Admin Details" description="Who should we send the setup invite to?" />

      <form onSubmit={form.handleSubmit(onRegister)} noValidate>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
          </div>

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email" className="gap-1">
              Email address <RequiredMark />
            </FieldLabel>
            <InputGroup className="bg-card">
              <InputGroupInput
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@facility.com"
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

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Controller
              name="gender"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="gender" className="gap-1">
                    Gender <RequiredMark />
                  </FieldLabel>
                  <Select
                    name={field.name}
                    items={genderLabels}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                    required
                  >
                    <SelectTrigger
                      id="gender"
                      aria-invalid={fieldState.invalid}
                      onBlur={field.onBlur}
                      className="w-full bg-card"
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(genderLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="role" className="gap-1">
                    Role <RequiredMark />
                  </FieldLabel>
                  <Select
                    name={field.name}
                    items={roleItems}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                    required
                  >
                    <SelectTrigger
                      id="role"
                      aria-invalid={fieldState.invalid}
                      onBlur={field.onBlur}
                      className="w-full bg-card"
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleItems).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>

          <Field data-invalid={!!errors.specialization}>
            <FieldLabel htmlFor="specialization">Specialization</FieldLabel>
            <Input
              id="specialization"
              placeholder="E.g. Internal Medicine (optional)"
              className="bg-card"
              {...form.register("specialization")}
            />
            <FieldError errors={[errors.specialization]} />
          </Field>

          <Button type="submit" loading={isSubmitting} className="mt-3 h-12 w-full">
            {submitLabel}
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
