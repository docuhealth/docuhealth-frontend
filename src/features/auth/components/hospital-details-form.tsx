import { CaretRightIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectCheckboxItem,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { RequiredMark } from "@/components/required-mark";
import { StepProgress } from "@/features/auth/components/step-progress";
import { devPrefill } from "@/features/auth/lib/dev-prefill";
import {
  hospitalDetailsSchema,
  organisationTypeLabels,
  ownershipLabels,
  type HospitalDetailsValues,
} from "@/features/auth/lib/schemas";

/** Field agent registering a hospital, step 1: what the facility is. */
export function HospitalDetailsForm({
  step,
  totalSteps,
  defaultValues,
  onContinue,
}: {
  step: number;
  totalSteps: number;
  defaultValues?: HospitalDetailsValues;
  onContinue: (values: HospitalDetailsValues) => void;
}) {
  const form = useForm<HospitalDetailsValues>({
    resolver: zodResolver(hospitalDetailsSchema),
    defaultValues: defaultValues ??
      devPrefill?.hospitalDetails ?? { hospitalName: "", facilityTypes: [], rcNumber: "" },
  });
  const { errors, isSubmitting } = form.formState;

  return (
    <div className="flex flex-col gap-10">
      <StepProgress step={step} total={totalSteps} />

      <AuthHeader
        title="Hospital details"
        description="Tell us about the facility you're registering."
      />

      <form onSubmit={form.handleSubmit(onContinue)} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.hospitalName}>
            <FieldLabel htmlFor="hospitalName" className="gap-1">
              Hospital name <RequiredMark />
            </FieldLabel>
            <Input
              id="hospitalName"
              autoComplete="organization"
              placeholder="E.g. Lagos University Teaching Hospital"
              aria-required
              aria-invalid={!!errors.hospitalName}
              className="bg-card"
              {...form.register("hospitalName")}
            />
            <FieldError errors={[errors.hospitalName]} />
          </Field>

          <Controller
            name="facilityTypes"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="facilityTypes" className="gap-1">
                  Facility type <RequiredMark />
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
                    id="facilityTypes"
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

          <Controller
            name="ownership"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="ownership" className="gap-1">
                  Ownership <RequiredMark />
                </FieldLabel>
                <Select
                  name={field.name}
                  items={ownershipLabels}
                  value={field.value ?? null}
                  onValueChange={field.onChange}
                  required
                >
                  <SelectTrigger
                    id="ownership"
                    aria-invalid={fieldState.invalid}
                    onBlur={field.onBlur}
                    className="w-full bg-card"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ownershipLabels).map(([value, label]) => (
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

          <Field data-invalid={!!errors.rcNumber}>
            <FieldLabel htmlFor="rcNumber" className="gap-1">
              CAC RC number <RequiredMark />
            </FieldLabel>
            <Input
              id="rcNumber"
              autoComplete="off"
              placeholder="Enter RC number"
              aria-required
              aria-invalid={!!errors.rcNumber}
              className="bg-card"
              {...form.register("rcNumber")}
            />
            <FieldError errors={[errors.rcNumber]} />
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
