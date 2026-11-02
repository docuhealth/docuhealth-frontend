import { CaretRightIcon, EnvelopeSimpleIcon, PhoneIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { SuccessDialog } from "@/components/success-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectCheckboxItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { RequiredMark } from "@/features/auth/components/required-mark";
import { devPrefill } from "@/features/auth/lib/dev-prefill";
import {
  organisationTypeLabels,
  providerInfoSchema,
  type ProviderInfoValues,
} from "@/features/auth/lib/schemas";

/** Provider sign-up: the facility's details, submitted for approval in one step. */
export function ProviderInfoForm() {
  const form = useForm<ProviderInfoValues>({
    resolver: zodResolver(providerInfoSchema),
    defaultValues: devPrefill?.providerInfo ?? {
      organisationTypes: [],
      organisationName: "",
      email: "",
      phone: "",
      message: "",
    },
  });
  const { errors, isSubmitting } = form.formState;
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(_values: ProviderInfoValues) {
    // TODO(api): submit the facility once the v2 auth API is defined.
    await Promise.resolve();
    setSubmitted(true);
  }

  // There's nothing to do here until the facility is approved, so leaving the dialog leaves the page.
  const leave = () => void navigate({ to: "/" });

  return (
    <div className="flex flex-col gap-10">
      <AuthHeader
        title="Register your facility"
        description="Submit your organization’s details for approval."
      />

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Controller
            name="organisationTypes"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="organisationTypes" className="gap-1">
                  Organisation Type <RequiredMark />
                </FieldLabel>
                <Select
                  multiple
                  name={field.name}
                  items={organisationTypeLabels}
                  value={field.value}
                  onValueChange={field.onChange}
                  required
                >
                  <SelectTrigger
                    id="organisationTypes"
                    aria-invalid={fieldState.invalid}
                    onBlur={field.onBlur}
                    className="w-full bg-card"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent header="Select one or more">
                    {Object.entries(organisationTypeLabels).map(([value, label]) => (
                      <SelectCheckboxItem key={value} value={value}>
                        {label}
                      </SelectCheckboxItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Field data-invalid={!!errors.organisationName}>
            <FieldLabel htmlFor="organisationName" className="gap-1">
              Organization name <RequiredMark />
            </FieldLabel>
            <Input
              id="organisationName"
              autoComplete="organization"
              placeholder="E.g. Lagos University Teaching Hospital"
              aria-required
              aria-invalid={!!errors.organisationName}
              className="bg-card"
              {...form.register("organisationName")}
            />
            <FieldError errors={[errors.organisationName]} />
          </Field>

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email" className="gap-1">
              Official Email <RequiredMark />
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

          <Field>
            <FieldLabel htmlFor="message">Message</FieldLabel>
            <Textarea
              id="message"
              placeholder="Tell us how we can collaborate"
              className="bg-card"
              {...form.register("message")}
            />
          </Field>

          <Button type="submit" loading={isSubmitting} className="mt-3 h-12 w-full">
            Continue
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        </FieldGroup>
      </form>

      <SuccessDialog
        open={submitted}
        onOpenChange={(open) => !open && leave()}
        title="Application submitted!"
        description="Your registration is under review. We’ll notify you by email once your healthcare facility has been approved."
        primaryAction={{ label: "Done", onClick: leave }}
      />
    </div>
  );
}
