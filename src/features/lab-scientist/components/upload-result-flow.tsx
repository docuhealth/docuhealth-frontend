import { CaretRightIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { DateInput } from "@/components/date-input";
import { InformationCircleIcon, PencilEditIcon } from "@/components/hugeicons";
import { RequiredMark } from "@/components/required-mark";
import { SuccessDialog } from "@/components/success-dialog";
import { TimeInput } from "@/components/time-input";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUploadTestResult } from "@/features/lab-scientist/api/mutations";
import type { TestOrder } from "@/features/lab-scientist/api/schemas";
import { FlagTag } from "@/features/lab-scientist/components/status-tag";
import { TestName } from "@/features/lab-scientist/components/test-name";
import { devPrefill } from "@/features/lab-scientist/lib/dev-prefill";
import {
  clockOf,
  type UploadResultValues,
  uploadResultSchema,
} from "@/features/lab-scientist/lib/schemas";
import { flagFor, referenceRange } from "@/features/lab-scientist/lib/stage";
import { getErrorMessage } from "@/lib/api";
import { toIsoDate } from "@/lib/date-input";

/**
 * "Upload test result": a value for each test (flagged against its range as it's typed), the
 * interpretation and clinical correlation, and when the sample was collected; then "Confirm
 * Upload", then "Result uploaded!". Cancel on the confirmation goes back to the form as it was.
 */
export function UploadResultFlow({
  order,
  open,
  onOpenChange,
}: {
  order: TestOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const upload = useUploadTestResult(order);
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
        {open && (
          <UploadResultForm
            order={order}
            draft={draft}
            onCancel={() => {
              setDraft(null);
              onOpenChange(false);
            }}
            onDone={(values) => {
              setDraft(values);
              onOpenChange(false);
              setConfirming(true);
            }}
          />
        )}
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
            By proceeding you confirm that you have carried out the requested test and you are
            certain of the results/findings. Once uploaded, the result will be shared with both the
            doctor and the patient!
          </DialogDescription>
        </ConfirmDialog>
      )}

      <SuccessDialog
        open={uploaded}
        onOpenChange={setUploaded}
        title="Result uploaded!"
        description="You have successfully uploaded a completed test result! The requesting doctor can now review it."
        primaryAction={{ label: "Done", onClick: () => setUploaded(false) }}
      />
    </>
  );
}

function UploadResultForm({
  order,
  draft,
  onCancel,
  onDone,
}: {
  order: TestOrder;
  draft: UploadResultValues | null;
  onCancel: () => void;
  onDone: (values: UploadResultValues) => void;
}) {
  const [requestedAt] = useState(() => new Date(order.requestedAt));
  const [schema] = useState(() => uploadResultSchema(requestedAt));
  // The collection time logged already, if there is one.
  const collected = order.sampleCollectedAt ? new Date(order.sampleCollectedAt) : null;
  const form = useForm<UploadResultValues>({
    resolver: zodResolver(schema),
    defaultValues: draft ?? {
      values: order.tests.map(() => ""),
      interpretation: devPrefill?.uploadResult.interpretation ?? "",
      clinicalCorrelation: devPrefill?.uploadResult.clinicalCorrelation ?? "",
      ...(collected
        ? { date: toIsoDate(collected), time: clockOf(collected) }
        : {
            date: devPrefill?.uploadResult.date ?? "",
            time: devPrefill?.uploadResult.time ?? "",
          }),
    },
  });
  const { errors } = form.formState;
  const values = useWatch({ control: form.control, name: "values" });

  return (
    <form onSubmit={form.handleSubmit(onDone)} noValidate className="flex min-h-0 flex-1 flex-col">
      <FormDialogHeader
        title="Upload test result"
        description="Attach the test report file to share it with the requesting doctor."
      />

      <FormDialogBody>
        <div className="overflow-x-auto">
          <table className="w-full min-w-lg table-fixed type-caption text-fg-body">
            <thead>
              <tr className="bg-line">
                <th className="h-9 rounded-l-lg pl-3 text-left font-normal">Test</th>
                <th className="w-[26%] text-left font-normal">Reference range</th>
                <th className="w-[24%] text-left font-normal">Test result</th>
                <th className="w-[22%] rounded-r-lg pr-3 text-left font-normal">Alert</th>
              </tr>
            </thead>
            <tbody>
              {order.tests.map((test, index) => {
                const typed = values?.[index]?.trim() ?? "";
                const number = Number(typed);
                const error = errors.values?.[index];
                return (
                  <tr key={test.loinc} className="border-b align-top last:border-0">
                    <td className="py-3 pl-3">
                      <TestName test={test} />
                    </td>
                    <td className="py-3 pt-5">{referenceRange(test)}</td>
                    <td className="py-3 pr-3">
                      <div className="relative">
                        <Input
                          inputMode="decimal"
                          autoComplete="off"
                          aria-label={`${test.name} result${test.unit ? ` in ${test.unit}` : ""}`}
                          aria-invalid={!!error}
                          placeholder="0.00"
                          className="h-10 bg-surface pr-8"
                          {...form.register(`values.${index}`)}
                        />
                        <PencilEditIcon
                          aria-hidden
                          className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-fg-caption"
                        />
                      </div>
                      {error && <p className="mt-1 type-caption text-error-500">{error.message}</p>}
                    </td>
                    <td className="py-3 pt-4 pr-3">
                      {typed !== "" && Number.isFinite(number) ? (
                        <FlagTag flag={flagFor(test, number)} range />
                      ) : (
                        <span className="text-fg-caption">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.interpretation}>
            <FieldLabel htmlFor="resultInterpretation" className="gap-1">
              Approved interpretation <RequiredMark />
            </FieldLabel>
            <Textarea
              id="resultInterpretation"
              placeholder="Admin-approved interpretation appears here."
              aria-required
              aria-invalid={!!errors.interpretation}
              className="min-h-24 bg-card"
              {...form.register("interpretation")}
            />
            <FieldError errors={[errors.interpretation]} />
          </Field>
          <Field data-invalid={!!errors.clinicalCorrelation}>
            <FieldLabel htmlFor="resultCorrelation" className="gap-1">
              Clinical correlation <RequiredMark />
            </FieldLabel>
            <Textarea
              id="resultCorrelation"
              placeholder="Add text here..."
              aria-required
              aria-invalid={!!errors.clinicalCorrelation}
              className="min-h-24 bg-card"
              {...form.register("clinicalCorrelation")}
            />
            <FieldError errors={[errors.clinicalCorrelation]} />
          </Field>

          <Controller
            name="date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="collectionDate" className="gap-1">
                  Collection date <RequiredMark />
                </FieldLabel>
                <DateInput
                  ref={field.ref}
                  id="collectionDate"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  min={requestedAt}
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
                <FieldLabel htmlFor="collectionTime" className="gap-1">
                  Collection time <RequiredMark />
                </FieldLabel>
                <TimeInput
                  ref={field.ref}
                  id="collectionTime"
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

      <FormDialogFooter onBack={onCancel} backLabel="Go back">
        <Button type="submit" className="h-11 gap-2 px-5 type-heading-sm">
          Upload result
          <CaretRightIcon data-icon="inline-end" />
        </Button>
      </FormDialogFooter>
    </form>
  );
}
