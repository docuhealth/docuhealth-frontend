import { CaretRightIcon, EnvelopeSimpleIcon, PhoneIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { RequiredMark } from "@/features/auth/components/required-mark";
import { StepProgress } from "@/features/auth/components/step-progress";
import { devPrefill } from "@/features/auth/lib/dev-prefill";
import { hospitalLocationSchema, type HospitalLocationValues } from "@/features/auth/lib/schemas";

/** Field agent registering a hospital, step 2: where it is and how to reach it. */
export function HospitalLocationForm({
  step,
  totalSteps,
  defaultValues,
  onContinue,
}: {
  step: number;
  totalSteps: number;
  defaultValues?: HospitalLocationValues;
  onContinue: (values: HospitalLocationValues) => void;
}) {
  const form = useForm<HospitalLocationValues>({
    resolver: zodResolver(hospitalLocationSchema),
    defaultValues: defaultValues ??
      devPrefill?.hospitalLocation ?? {
        state: "",
        lga: "",
        streetAddress: "",
        phone: "",
        email: "",
      },
  });
  const { errors, isSubmitting } = form.formState;

  return (
    <div className="flex flex-col gap-10">
      <StepProgress step={step} total={totalSteps} />

      <AuthHeader
        title="Hospital Location"
        description="Where is the hospital, and how can we reach them?"
      />

      <form onSubmit={form.handleSubmit(onContinue)} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.state}>
            <FieldLabel htmlFor="state" className="gap-1">
              State <RequiredMark />
            </FieldLabel>
            <Input
              id="state"
              autoComplete="address-level1"
              placeholder="E.g. Lagos"
              aria-required
              aria-invalid={!!errors.state}
              className="bg-card"
              {...form.register("state")}
            />
            <FieldError errors={[errors.state]} />
          </Field>

          <Field data-invalid={!!errors.lga}>
            <FieldLabel htmlFor="lga" className="gap-1">
              LGA <RequiredMark />
            </FieldLabel>
            <Input
              id="lga"
              autoComplete="address-level2"
              placeholder="Enter LGA"
              aria-required
              aria-invalid={!!errors.lga}
              className="bg-card"
              {...form.register("lga")}
            />
            <FieldError errors={[errors.lga]} />
          </Field>

          <Field data-invalid={!!errors.streetAddress}>
            <FieldLabel htmlFor="streetAddress" className="gap-1">
              Street address <RequiredMark />
            </FieldLabel>
            <Input
              id="streetAddress"
              autoComplete="street-address"
              placeholder="Enter address"
              aria-required
              aria-invalid={!!errors.streetAddress}
              className="bg-card"
              {...form.register("streetAddress")}
            />
            <FieldError errors={[errors.streetAddress]} />
          </Field>

          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone" className="gap-1">
              Hospital phone <RequiredMark />
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

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email" className="gap-1">
              Hospital email <RequiredMark />
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

          <Button type="submit" loading={isSubmitting} className="mt-3 h-12 w-full">
            Continue
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
