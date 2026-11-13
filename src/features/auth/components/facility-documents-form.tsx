import { CaretRightIcon, CheckIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { FileDropzone } from "@/components/file-dropzone";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
  facilityDocumentsSchema,
  type FacilityDocumentsValues,
  MAX_DOCUMENTS,
} from "@/features/auth/lib/schemas";
import { DEFAULT_COUNTRY, getLgasForState, NIGERIA_STATES } from "@/lib/locations";

const documentKinds = [
  { title: "CAC certificate", description: "Certificate of incorporation" },
  { title: "Facility licence", description: "From State Ministry of Health" },
  { title: "MDCN practising licence", description: "For medical director, current year" },
  { title: "Other supporting document", description: "e.g. NHIA accreditation" },
];

const checks = [
  "Documents are fully visible",
  "Name matches facility records",
  "Licences are valid and active",
  "Text is clear and readable",
];

const countryItems = { [DEFAULT_COUNTRY]: DEFAULT_COUNTRY };
const stateItems = Object.fromEntries(NIGERIA_STATES.map((s) => [s, s]));

/** Final step of facility verification: the facility provides its address and uploads its licensing documents. */
export function FacilityDocumentsForm({
  step,
  totalSteps,
  defaultValues,
  onContinue,
}: {
  step: number;
  totalSteps: number;
  defaultValues?: FacilityDocumentsValues;
  onContinue: (values: FacilityDocumentsValues) => void | Promise<void>;
}) {
  const form = useForm<FacilityDocumentsValues>({
    resolver: zodResolver(facilityDocumentsSchema),
    defaultValues: defaultValues ??
      devPrefill?.facilityDocuments ?? {
        country: DEFAULT_COUNTRY,
        state: "",
        city: "",
        street: "",
        files: [],
      },
  });
  const { errors, isSubmitting } = form.formState;

  const selectedState = useWatch({ control: form.control, name: "state" });
  const lgaList = getLgasForState(selectedState);
  const cityItems = Object.fromEntries(lgaList.map((lga) => [lga, lga]));

  async function onSubmit(values: FacilityDocumentsValues) {
    await onContinue(values);
  }

  return (
    <div className="flex flex-col gap-10">
      <StepProgress step={step} total={totalSteps} />

      <AuthHeader
        title="Address & documents"
        description="Provide your facility’s physical address and upload at least one licensing document to complete verification."
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8" noValidate>
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
                      form.setValue("city", "");
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

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Controller
              name="city"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="city" className="gap-1">
                    City / LGA <RequiredMark />
                  </FieldLabel>
                  <Select
                    name={field.name}
                    items={cityItems}
                    value={field.value || null}
                    onValueChange={field.onChange}
                    disabled={!selectedState}
                    required
                  >
                    <SelectTrigger
                      id="city"
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

            <Field data-invalid={!!errors.street}>
              <FieldLabel htmlFor="street" className="gap-1">
                Street address <RequiredMark />
              </FieldLabel>
              <Input
                id="street"
                autoComplete="street-address"
                placeholder="E.g. 12 Allen Avenue, Ikeja"
                aria-required
                aria-invalid={!!errors.street}
                className="bg-card"
                {...form.register("street")}
              />
              <FieldError errors={[errors.street]} />
            </Field>
          </div>
        </FieldGroup>

        <section className="flex flex-col gap-3">
          <h2 className="type-accent-h4 text-fg-heading">We usually ask for</h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {documentKinds.map((kind) => (
              <li key={kind.title} className="rounded-md border bg-card px-3 py-2.5">
                <p className="type-body-sm text-fg-heading">{kind.title}</p>
                <p className="mt-0.5 type-caption-tight text-muted-foreground">
                  {kind.description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="type-accent-h4 text-fg-heading">Please check that</h2>
          <ul className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2">
            {checks.map((check) => (
              <li key={check} className="flex items-center gap-2 type-body-sm-tight text-fg-body">
                <CheckIcon className="size-4 shrink-0 text-success-500" />
                {check}
              </li>
            ))}
          </ul>
        </section>

        <Controller
          name="files"
          control={form.control}
          render={({ field, fieldState }) => {
            // Per-file problems (wrong type, too big) come back indexed; list-level ones (none,
            // too many) on the array itself.
            const filesError = form.formState.errors.files;
            const itemErrors = Array.isArray(filesError)
              ? (filesError as ({ message?: string } | undefined)[]).map((e) => e?.message)
              : undefined;
            const listError =
              filesError?.root ?? (Array.isArray(filesError) ? undefined : filesError);

            return (
              <div className="flex flex-col gap-2">
                <FileDropzone
                  id="documents"
                  files={field.value}
                  onFilesChange={(files) => {
                    field.onChange(files);
                    if (form.formState.isSubmitted) void form.trigger("files");
                  }}
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  hint={`PDF, JPG or PNG · Max 5 MB each · Up to ${MAX_DOCUMENTS} files`}
                  invalid={fieldState.invalid}
                  fileErrors={itemErrors}
                />
                <FieldError errors={[listError]} />
              </div>
            );
          }}
        />

        <Button type="submit" loading={isSubmitting} className="h-12 w-full">
          Submit application
          <CaretRightIcon data-icon="inline-end" />
        </Button>
      </form>
    </div>
  );
}
