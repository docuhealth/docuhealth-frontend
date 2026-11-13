import { CaretRightIcon, EnvelopeSimpleIcon, PhoneIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { DateInput } from "@/components/date-input";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  genderLabels,
  individualInfoSchema,
  type IndividualInfoValues,
} from "@/features/auth/lib/schemas";

const TODAY = new Date();

/** Step 1 of the individual sign-up: who the patient is and how to reach them. */
export function IndividualInfoForm({
  step,
  totalSteps,
  defaultValues,
  onContinue,
}: {
  step: number;
  totalSteps: number;
  /** Answers from an earlier visit to this step, e.g. after "Change" on the next one. */
  defaultValues?: IndividualInfoValues;
  onContinue: (values: IndividualInfoValues) => void | Promise<void>;
}) {
  const form = useForm<IndividualInfoValues>({
    resolver: zodResolver(individualInfoSchema),
    defaultValues: defaultValues ??
      devPrefill?.individualInfo ?? {
        firstName: "",
        lastName: "",
        otherName: "",
        dob: "",
        email: "",
        phone: "",
      },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: IndividualInfoValues) {
    await onContinue(values);
  }

  return (
    <div className="flex flex-col gap-10">
      <StepProgress step={step} total={totalSteps} />

      <AuthHeader
        title="Individual Information"
        description="Tell us a little about the patient."
      />

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
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

            <Field>
              <FieldLabel htmlFor="otherName">Other name</FieldLabel>
              <Input
                id="otherName"
                autoComplete="additional-name"
                placeholder="E.g. Chiamaka"
                className="bg-card"
                {...form.register("otherName")}
              />
            </Field>

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
          </div>

          <Controller
            name="dob"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="dob" className="gap-1">
                  Date of birth <RequiredMark />
                </FieldLabel>
                <DateInput
                  ref={field.ref}
                  id="dob"
                  name={field.name}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  max={TODAY}
                  invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email" className="gap-1">
              Email <RequiredMark />
            </FieldLabel>
            <InputGroup className="bg-card">
              <InputGroupInput
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@email.com"
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
              Phone Number <RequiredMark />
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

          <Controller
            name="acceptTerms"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="acceptTerms"
                    name={field.name}
                    checked={field.value ?? false}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    aria-invalid={fieldState.invalid}
                    className="size-4.5 border-fg-caption/50 bg-card"
                  />
                  <FieldLabel htmlFor="acceptTerms" className="font-normal! text-fg-body">
                    <span>
                      By continuing, you agree to our{" "}
                      <a href="/terms" className="text-primary underline underline-offset-2">
                        Terms
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" className="text-primary underline underline-offset-2">
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </FieldLabel>
                </div>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Button type="submit" loading={isSubmitting} className="mt-3 h-12 w-full">
            Continue
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
