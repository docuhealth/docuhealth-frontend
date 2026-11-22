import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { VitalsFields } from "@/components/dashboard/vitals-fields";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useNursingAssessment } from "@/features/nurse/api/mutations";
import { type QueueEntry, type Triage, triageLabels } from "@/features/nurse/api/schemas";
import {
  type AssessmentInput,
  type AssessmentValues,
  assessmentSchema,
} from "@/features/nurse/lib/schemas";
import { getErrorMessage } from "@/lib/api";
import { emptyVitals } from "@/lib/vitals-form";

/**
 * The nursing assessment of a checked-in patient: vitals, triage and notes. "Send to doctor"
 * passes them on to the doctors' queue; "Record and close" ends the visit here.
 */
export function AssessmentDialog({
  entry,
  onClose,
}: {
  entry: QueueEntry | null;
  onClose: () => void;
}) {
  return (
    <FormDialog open={!!entry} onOpenChange={(open) => !open && onClose()}>
      {/* Mounted only while open, so every assessment starts blank. */}
      {entry && <AssessmentForm entry={entry} onDone={onClose} />}
    </FormDialog>
  );
}

function AssessmentForm({ entry, onDone }: { entry: QueueEntry; onDone: () => void }) {
  const assess = useNursingAssessment();
  // Which button sent the form, for the button's spinner.
  const [sending, setSending] = useState<"doctor" | "close" | null>(null);
  const form = useForm<AssessmentInput, unknown, AssessmentValues>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: { vitals: emptyVitals, triage: "", notes: "" },
  });
  const { errors } = form.formState;

  const submit = (sendToDoctor: boolean) =>
    form.handleSubmit(({ vitals, triage, notes }) => {
      setSending(sendToDoctor ? "doctor" : "close");
      assess.mutate(
        { id: entry.id, vitals, triage, notes, sendToDoctor },
        {
          onSuccess: () => {
            toast.success(
              sendToDoctor
                ? `${entry.patient.name} is sent to the doctor.`
                : `${entry.patient.name}’s assessment is recorded and the visit closed.`,
            );
            onDone();
          },
          onError: (error) => toast.error(getErrorMessage(error)),
          onSettled: () => setSending(null),
        },
      );
    });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(event) => void submit(true)(event)}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <FormDialogHeader
          title="Nursing assessment"
          description={`${entry.patient.name}: vitals, triage and notes.`}
        />
        <FormDialogBody>
          <VitalsFields idPrefix="assessment" />

          <Controller
            name="triage"
            control={form.control}
            render={({ field, fieldState }) => (
              <FieldSet data-invalid={fieldState.invalid}>
                <FieldLegend variant="label" className="flex gap-1">
                  Triage <RequiredMark />
                </FieldLegend>
                <RadioGroup
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                  className="flex flex-wrap gap-5"
                >
                  {(Object.entries(triageLabels) as [Triage, string][]).map(([value, label]) => (
                    <Field key={value} orientation="horizontal" className="w-auto">
                      <RadioGroupItem value={value} id={`triage-${value}`} />
                      <FieldLabel htmlFor={`triage-${value}`} className="font-normal">
                        {label}
                      </FieldLabel>
                    </Field>
                  ))}
                </RadioGroup>
                <FieldError errors={[fieldState.error]} />
              </FieldSet>
            )}
          />

          <Field data-invalid={!!errors.notes}>
            <FieldLabel htmlFor="assessmentNotes">Notes</FieldLabel>
            <Textarea
              id="assessmentNotes"
              placeholder="What the patient came in with, and anything the doctor should know"
              aria-invalid={!!errors.notes}
              className="min-h-24 bg-card"
              {...form.register("notes")}
            />
            <FieldError errors={[errors.notes]} />
          </Field>
        </FormDialogBody>
        <FormDialogFooter>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              loading={sending === "close"}
              disabled={assess.isPending}
              onClick={(event) => void submit(false)(event)}
              className="h-11 bg-card px-5 type-body-sm-medium"
            >
              Record and close
            </Button>
            <Button
              type="submit"
              loading={sending === "doctor"}
              disabled={assess.isPending}
              className="h-11 px-5 type-heading-sm"
            >
              Send to doctor
            </Button>
          </div>
        </FormDialogFooter>
      </form>
    </FormProvider>
  );
}
