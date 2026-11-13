import { CaretRightIcon, EnvelopeSimpleIcon, PhoneIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { RequiredMark } from "@/components/required-mark";
import { SuccessDialog } from "@/components/success-dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { useCreateFacilityApplication } from "@/features/auth/api/mutations";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { devPrefill } from "@/features/auth/lib/dev-prefill";
import {
  organisationTypeLabels,
  providerInfoSchema,
  type ProviderInfoValues,
} from "@/features/auth/lib/schemas";
import { getErrorMessage } from "@/lib/api";

/** Provider sign-up: the facility's details, submitted for approval in one step. */
export function ProviderInfoForm() {
  const form = useForm<ProviderInfoValues>({
    resolver: zodResolver(providerInfoSchema),
    defaultValues: devPrefill?.providerInfo ?? {
      organisationName: "",
      email: "",
      phone: "",
      message: "",
    },
  });
  const { errors, isSubmitting } = form.formState;
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const createApplicationMutation = useCreateFacilityApplication();

  async function onSubmit(values: ProviderInfoValues) {
    try {
      await createApplicationMutation.mutateAsync({
        facility_type: values.facilityType,
        name: values.organisationName.trim(),
        official_email: values.email.trim(),
        phone: values.phone.trim(),
        message: values.message.trim() || undefined,
        redirect_url: `${window.location.origin}/hospital/verify`,
      });
      setSubmitted(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  // There's nothing to do here until the facility verifies its email, so leaving the dialog leaves the page.
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
            name="facilityType"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="facilityType" className="gap-1">
                  Organisation Type <RequiredMark />
                </FieldLabel>
                <Select
                  name={field.name}
                  items={organisationTypeLabels}
                  value={field.value ?? null}
                  onValueChange={field.onChange}
                  required
                >
                  <SelectTrigger
                    id="facilityType"
                    aria-invalid={fieldState.invalid}
                    onBlur={field.onBlur}
                    className="w-full bg-card"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(organisationTypeLabels).map(([value, label]) => (
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

          <Button
            type="submit"
            loading={isSubmitting || createApplicationMutation.isPending}
            className="mt-3 h-12 w-full"
          >
            Continue
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        </FieldGroup>
      </form>

      <SuccessDialog
        open={submitted}
        onOpenChange={(open) => !open && leave()}
        title="Application submitted!"
        description="We’ve sent a verification link to your official email address. Open that link to assign your administrator and upload your facility documents."
        primaryAction={{ label: "Done", onClick: leave }}
      />
    </div>
  );
}
