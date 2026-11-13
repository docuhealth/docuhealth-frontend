import { CaretRightIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { DateInput } from "@/components/date-input";
import { FileDropzone } from "@/components/file-dropzone";
import { RequiredMark } from "@/components/required-mark";
import { SuccessDialog } from "@/components/success-dialog";
import { TimeInput } from "@/components/time-input";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUploadScanResult } from "@/features/radiologist/api/mutations";
import { reporterSpecialtyLabels } from "@/features/radiologist/api/schemas";
import { InformationCircleIcon } from "@/features/radiologist/components/icons";
import { devPrefill } from "@/features/radiologist/lib/dev-prefill";
import {
  type UploadResultInput,
  type UploadResultValues,
  uploadResultSchema,
  uploadResultSteps,
} from "@/features/radiologist/lib/schemas";
import { getErrorMessage } from "@/lib/api";

/**
 * "Upload test result": the report in three steps (who's reporting, the report, files and a
 * comment), then "Confirm Upload", since the result goes straight to the doctor and patient,
 * then "Result uploaded!". Cancelling the confirmation goes back to the form as it was left.
 */
export function UploadResultFlow({
  orderId,
  open,
  onOpenChange,
}: {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const upload = useUploadScanResult(orderId);
  // The finished form, kept while it's being confirmed so Cancel can return to it.
  const [draft, setDraft] = useState<UploadResultValues | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={(next) => {
          // Closing the form (not handing it over to be confirmed) throws the draft away.
          if (!next) setDraft(null);
          onOpenChange(next);
        }}
      >
        {/* Mounts with the dialog: a fresh form at step 1, or the draft at its last step. */}
        <UploadResultForm
          draft={draft}
          onDone={(values) => {
            setDraft(values);
            onOpenChange(false);
            setConfirming(true);
          }}
        />
      </FormDialog>

      {confirming && draft && (
        <ConfirmDialog
          tone="brand"
          icon={<InformationCircleIcon />}
          title="Confirm Upload"
          confirmLabel="Confirm Upload"
          pending={upload.isPending}
          onClose={() => {
            if (upload.isPending) return;
            setConfirming(false);
            onOpenChange(true);
          }}
          onConfirm={() =>
            upload.mutate(draft, {
              onSuccess: () => {
                setConfirming(false);
                setDraft(null);
                setUploaded(true);
              },
              onError: (error) => toast.error(getErrorMessage(error)),
            })
          }
        >
          <DialogDescription className="type-body-regular text-fg-body">
            By proceeding you confirm that you have carried out the requested scan and you are
            certain of the reports. Once uploaded, the result will be shared with both the doctor
            and the patient.
          </DialogDescription>
        </ConfirmDialog>
      )}

      <SuccessDialog
        open={uploaded}
        onOpenChange={setUploaded}
        title="Result uploaded!"
        description="You have successfully uploaded a completed scan result. The requesting doctor can now review it."
        primaryAction={{ label: "Done", onClick: () => setUploaded(false) }}
      />
    </>
  );
}

const stepText = [
  { title: "Report information", description: "Confirm who is reporting this result." },
  { title: "Scan report", description: "Write the clinical report for this scan." },
  {
    title: "Attachments & comment",
    description: "Both are optional. Add supporting files or a note.",
  },
] as const;

const emptyForm: UploadResultInput = {
  reporterName: "",
  specialty: "",
  date: "",
  time: "",
  clinicalIndication: "",
  findings: "",
  impression: "",
  recommendations: "",
  attachments: [],
  comment: "",
};

function UploadResultForm({
  draft,
  onDone,
}: {
  draft: UploadResultValues | null;
  onDone: (values: UploadResultValues) => void;
}) {
  const [step, setStep] = useState(draft ? 2 : 0);
  const last = uploadResultSteps.length - 1;
  const form = useForm<UploadResultInput, unknown, UploadResultValues>({
    resolver: zodResolver(uploadResultSchema),
    defaultValues: draft ?? devPrefill?.uploadResult ?? emptyForm,
  });
  const { errors } = form.formState;
  const [today] = useState(() => new Date());

  async function next() {
    if (await form.trigger([...uploadResultSteps[step]!])) setStep(step + 1);
  }

  return (
    <form
      // Enter moves on a step (checking it) until the last, which submits.
      onSubmit={
        step < last
          ? (event) => {
              event.preventDefault();
              void next();
            }
          : form.handleSubmit(onDone)
      }
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <FormDialogHeader
        title={stepText[step]!.title}
        description={stepText[step]!.description}
        progress={{ step: step + 1, total: uploadResultSteps.length }}
      />

      {step === 0 && (
        <FormDialogBody>
          <Field data-invalid={!!errors.reporterName}>
            <FieldLabel htmlFor="reporterName" className="gap-1">
              Name of reporter <RequiredMark />
            </FieldLabel>
            <Input
              id="reporterName"
              autoComplete="off"
              placeholder="Enter name"
              aria-required
              aria-invalid={!!errors.reporterName}
              className="bg-card"
              {...form.register("reporterName")}
            />
            <FieldError errors={[errors.reporterName]} />
          </Field>

          <Controller
            name="specialty"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="reporterSpecialty" className="gap-1">
                  Specialty <RequiredMark />
                </FieldLabel>
                <Select
                  name={field.name}
                  items={reporterSpecialtyLabels}
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value ?? "")}
                >
                  <SelectTrigger
                    id="reporterSpecialty"
                    aria-required
                    aria-invalid={fieldState.invalid}
                    onBlur={field.onBlur}
                    className="w-full bg-card"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(reporterSpecialtyLabels).map(([value, label]) => (
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

          <div className="grid gap-6 sm:grid-cols-2">
            <Controller
              name="date"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="reportDate" className="gap-1">
                    Date of reporting <RequiredMark />
                  </FieldLabel>
                  <DateInput
                    ref={field.ref}
                    id="reportDate"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    max={today}
                    invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name="time"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="reportTime" className="gap-1">
                    Time of reporting <RequiredMark />
                  </FieldLabel>
                  <TimeInput
                    ref={field.ref}
                    id="reportTime"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>
        </FormDialogBody>
      )}

      {step === 1 && (
        <FormDialogBody>
          <ReportField
            name="clinicalIndication"
            label="Clinical indication"
            placeholder="Reason for the scan and relevant history"
            form={form}
          />
          <ReportField
            name="findings"
            label="Findings"
            placeholder="Describe what the scan shows; one finding per line"
            form={form}
          />
          <ReportField
            name="impression"
            label="Impression"
            placeholder="Summarise the key conclusions"
            form={form}
          />
          <ReportField
            name="recommendations"
            label="Recommendation"
            placeholder="Suggested next steps"
            form={form}
          />
        </FormDialogBody>
      )}

      {step === 2 && (
        <FormDialogBody>
          <Controller
            name="attachments"
            control={form.control}
            render={({ field, fieldState }) => {
              const perFile = Array.isArray(fieldState.error)
                ? (fieldState.error as ({ message?: string } | undefined)[]).map(
                    (error) => error?.message,
                  )
                : undefined;
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="resultAttachments">
                    Attachments <span className="font-normal text-fg-caption">(optional)</span>
                  </FieldLabel>
                  <FileDropzone
                    id="resultAttachments"
                    layout="thumbnails"
                    files={field.value}
                    onFilesChange={field.onChange}
                    accept="image/*,.pdf,.dcm"
                    hint="Images, PDF or DICOM, up to 50 MB each"
                    invalid={fieldState.invalid}
                    fileErrors={perFile}
                  />
                  <FieldError errors={[fieldState.error?.root ?? fieldState.error]} />
                </Field>
              );
            }}
          />

          <Field data-invalid={!!errors.comment}>
            <FieldLabel htmlFor="resultComment">
              Extra comment <span className="font-normal text-fg-caption">(optional)</span>
            </FieldLabel>
            <Textarea
              id="resultComment"
              placeholder="Enter any other comment"
              aria-invalid={!!errors.comment}
              className="min-h-24 bg-card"
              {...form.register("comment")}
            />
            <FieldError errors={[errors.comment]} />
          </Field>
        </FormDialogBody>
      )}

      <FormDialogFooter onBack={step > 0 ? () => setStep(step - 1) : undefined}>
        {step < last ? (
          <Button
            key="continue"
            type="button"
            onClick={() => void next()}
            className="h-11 px-5 type-heading-sm"
          >
            Continue
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        ) : (
          <Button key="submit" type="submit" className="h-11 px-5 type-heading-sm">
            Upload Report
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        )}
      </FormDialogFooter>
    </form>
  );
}

function ReportField({
  name,
  label,
  placeholder,
  form,
}: {
  name: "clinicalIndication" | "findings" | "impression" | "recommendations";
  label: string;
  placeholder: string;
  form: ReturnType<typeof useForm<UploadResultInput, unknown, UploadResultValues>>;
}) {
  const error = form.formState.errors[name];
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={`report-${name}`} className="gap-1">
        {label} <RequiredMark />
      </FieldLabel>
      <Textarea
        id={`report-${name}`}
        placeholder={placeholder}
        aria-required
        aria-invalid={!!error}
        className="min-h-20 bg-card"
        {...form.register(name)}
      />
      <FieldError errors={[error]} />
    </Field>
  );
}
