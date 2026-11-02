import { CaretRightIcon, CheckIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FileDropzone } from "@/components/file-dropzone";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { StepProgress } from "@/features/auth/components/step-progress";
import { devPrefill } from "@/features/auth/lib/dev-prefill";
import {
  MAX_DOCUMENTS,
  facilityDocumentsSchema,
  type FacilityDocumentsValues,
} from "@/features/auth/lib/schemas";

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

/** First step of facility verification: the facility uploads its licensing documents. */
export function FacilityDocumentsForm({
  step,
  totalSteps,
  defaultValues,
  onContinue,
}: {
  step: number;
  totalSteps: number;
  defaultValues?: FacilityDocumentsValues;
  onContinue: (values: FacilityDocumentsValues) => void;
}) {
  const form = useForm<FacilityDocumentsValues>({
    resolver: zodResolver(facilityDocumentsSchema),
    defaultValues: defaultValues ?? devPrefill?.facilityDocuments ?? { files: [] },
  });
  const { isSubmitting } = form.formState;

  return (
    <div className="flex flex-col gap-10">
      <StepProgress step={step} total={totalSteps} />

      <AuthHeader
        title="Upload documents"
        description="Upload at least one licensing document to verify your facility."
      />

      <section className="flex flex-col gap-3">
        <h2 className="type-accent-h4 text-fg-heading">We usually ask for</h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {documentKinds.map((kind) => (
            <li key={kind.title} className="rounded-md border bg-card px-3 py-2.5">
              <p className="type-body-sm text-fg-heading">{kind.title}</p>
              <p className="mt-0.5 type-caption-tight text-muted-foreground">{kind.description}</p>
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

      <form onSubmit={form.handleSubmit(onContinue)} className="flex flex-col gap-8" noValidate>
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
          Submit
          <CaretRightIcon data-icon="inline-end" />
        </Button>
      </form>
    </div>
  );
}
