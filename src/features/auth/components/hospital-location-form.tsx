import { CaretRightIcon, EnvelopeSimpleIcon, PhoneIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import { hospitalLocationSchema, type HospitalLocationValues } from "@/features/auth/lib/schemas";
import { DEFAULT_COUNTRY, getLgasForState, NIGERIA_STATES } from "@/lib/locations";

const countryItems = { [DEFAULT_COUNTRY]: DEFAULT_COUNTRY };
const stateItems = Object.fromEntries(NIGERIA_STATES.map((s) => [s, s]));

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
        country: DEFAULT_COUNTRY,
        state: "",
        lga: "",
        streetAddress: "",
        phone: "",
        email: "",
      },
  });
  const { errors, isSubmitting } = form.formState;

  const selectedState = useWatch({ control: form.control, name: "state" });
  const lgaList = getLgasForState(selectedState);
  const lgaItems = Object.fromEntries(lgaList.map((lga) => [lga, lga]));

  return (
    <div className="flex flex-col gap-10">
      <StepProgress step={step} total={totalSteps} />

      <AuthHeader
        title="Hospital Location"
        description="Where is the hospital, and how can we reach them?"
      />

      <form onSubmit={form.handleSubmit(onContinue)} noValidate>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Controller
              name="country"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="country" className="gap-1">
                    Country <RequiredMark />
                  </FieldLabel>
                  <Select
                    name={field.name}
                    items={countryItems}
                    value={field.value ?? DEFAULT_COUNTRY}
                    onValueChange={field.onChange}
                    required
                  >
                    <SelectTrigger
                      id="country"
                      aria-invalid={fieldState.invalid}
                      onBlur={field.onBlur}
                      className="w-full bg-card"
                    >
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DEFAULT_COUNTRY}>{DEFAULT_COUNTRY}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="state"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="state" className="gap-1">
                    State <RequiredMark />
                  </FieldLabel>
                  <Select
                    name={field.name}
                    items={stateItems}
                    value={field.value || null}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("lga", "");
                    }}
                    required
                  >
                    <SelectTrigger
                      id="state"
                      aria-invalid={fieldState.invalid}
                      onBlur={field.onBlur}
                      className="w-full bg-card"
                    >
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {NIGERIA_STATES.map((stateName) => (
                        <SelectItem key={stateName} value={stateName}>
                          {stateName}
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
            name="lga"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="lga" className="gap-1">
                  LGA <RequiredMark />
                </FieldLabel>
                <Select
                  name={field.name}
                  items={lgaItems}
                  value={field.value || null}
                  onValueChange={field.onChange}
                  disabled={!selectedState}
                  required
                >
                  <SelectTrigger
                    id="lga"
                    aria-invalid={fieldState.invalid}
                    onBlur={field.onBlur}
                    className="w-full bg-card"
                  >
                    <SelectValue
                      placeholder={selectedState ? "Select LGA" : "Select a state first"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {lgaList.map((lgaName) => (
                      <SelectItem key={lgaName} value={lgaName}>
                        {lgaName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

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
