import { zodResolver } from "@hookform/resolvers/zod";
import { CaretRightIcon } from "@phosphor-icons/react";
import { useState } from "react";
import {
  Controller,
  type FieldError as FormFieldError,
  type FieldPath,
  useForm,
  type UseFormReturn,
} from "react-hook-form";
import { toast } from "sonner";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useCreateEncounterNote } from "@/features/doctor/api/mutations";
import {
  emptyEncounterNote,
  type EncounterNoteValues,
  encounterNoteSchema,
  historySchema,
} from "@/features/doctor/lib/schemas";
import { getErrorMessage } from "@/lib/api";
import { DraftNotice } from "@/components/draft-notice";
import { useFormDraft } from "@/hooks/use-form-draft";

type Key = FieldPath<EncounterNoteValues>;

/** Step 1's boxes and step 2's, with which are lists ("one per line") and which are needed. */
const steps: {
  name: Exclude<Key, "shareWithNurses">;
  label: string;
  list?: boolean;
  required?: boolean;
  placeholder: string;
}[][] = [
  [
    {
      name: "chiefComplaint",
      label: "Chief complaint",
      required: true,
      placeholder: "e.g. Fever and sore throat for 3 days",
    },
    {
      name: "historyOfComplaint",
      label: "History of the complaint",
      placeholder: "Onset, course, what makes it better or worse",
    },
    {
      name: "pastMedicalHistory",
      label: "Past medical history",
      placeholder: "Illnesses, operations, admissions",
    },
    {
      name: "drugHistoryAllergies",
      label: "Drug history and allergies",
      list: true,
      placeholder: "One per line, e.g. Penicillin allergy",
    },
    { name: "familyHistory", label: "Family history", placeholder: "e.g. Mother hypertensive" },
    { name: "socialHistory", label: "Social history", placeholder: "Occupation, smoking, alcohol" },
    { name: "review", label: "Review of systems", placeholder: "Anything found on review" },
    {
      name: "generalExam",
      label: "General examination",
      list: true,
      placeholder: "One finding per line",
    },
    {
      name: "systemicExam",
      label: "Systemic examination",
      list: true,
      placeholder: "One finding per line",
    },
    {
      name: "bedsideTests",
      label: "Bedside tests",
      list: true,
      placeholder: "One per line, e.g. Urinalysis: NAD",
    },
    { name: "investigations", label: "Investigations", list: true, placeholder: "One per line" },
  ],
  [
    {
      name: "primaryDiagnosis",
      label: "Primary diagnosis",
      required: true,
      placeholder: "e.g. Acute pharyngitis",
    },
    {
      name: "differentialDiagnosis",
      label: "Differential diagnosis",
      placeholder: "Other possibilities",
    },
    { name: "problems", label: "Problems", list: true, placeholder: "One per line" },
    {
      name: "treatmentPlan",
      label: "Treatment plan",
      list: true,
      placeholder: "One per line, e.g. Tab Paracetamol 1g 8-hourly × 3 days",
    },
    {
      name: "careInstructions",
      label: "Care instructions",
      list: true,
      required: true,
      placeholder: "One per line, e.g. Warm saline gargles, plenty of fluids",
    },
    {
      name: "patientEducation",
      label: "Patient education",
      placeholder: "What the patient was told",
    },
  ],
];

/**
 * A new encounter (SOAP) note for the consultation: the history and examination, then the
 * assessment and plan. TODO(api): investigation files, referral and the next appointment aren't
 * asked for yet.
 */
export function EncounterNoteDialog({
  open,
  onOpenChange,
  hin,
  checkInId,
  patientName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hin: string;
  checkInId: string;
  patientName: string;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      {/* Mounted only while open, so every note starts blank. */}
      {open && (
        <NoteForm
          hin={hin}
          checkInId={checkInId}
          patientName={patientName}
          onSaved={() => onOpenChange(false)}
        />
      )}
    </FormDialog>
  );
}

function NoteForm({
  hin,
  checkInId,
  patientName,
  onSaved,
}: {
  hin: string;
  checkInId: string;
  patientName: string;
  onSaved: () => void;
}) {
  const create = useCreateEncounterNote();
  const [step, setStep] = useState<0 | 1>(0);
  const form = useForm<EncounterNoteValues>({
    resolver: zodResolver(encounterNoteSchema),
    defaultValues: emptyEncounterNote,
  });
  // Unsent notes survive a refresh, but only while the tab is open: they're health information.
  const draft = useFormDraft(form, {
    form: `doctor:encounter-note:${checkInId}`,
    fields: Object.keys(emptyEncounterNote) as (keyof EncounterNoteValues)[],
    storage: "session",
  });

  // Read here, so the form re-renders as they change.
  const { errors } = form.formState;

  async function next() {
    const keys = Object.keys(historySchema.shape) as Key[];
    if (await form.trigger(keys)) setStep(1);
  }

  function onSubmit(note: EncounterNoteValues) {
    create.mutate(
      { hin, checkInId, note },
      {
        onSuccess: () => {
          draft.clear();
          toast.success(`${patientName}’s encounter note is saved.`);
          onSaved();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <form
      onSubmit={
        step === 0
          ? (event) => {
              event.preventDefault();
              void next();
            }
          : form.handleSubmit(onSubmit)
      }
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <FormDialogHeader
        title="New encounter note"
        description={
          step === 0
            ? `${patientName}: history and examination.`
            : `${patientName}: assessment and plan.`
        }
        progress={{ step: step + 1, total: 2 }}
      />
      <FormDialogBody>
        <DraftNotice restored={draft.restored} onDiscard={draft.discard} />
        {(steps[step] ?? []).map((field) => (
          <NoteField key={field.name} form={form} error={errors[field.name]} {...field} />
        ))}
        {step === 1 && (
          <Controller
            name="shareWithNurses"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <Checkbox
                  id="shareWithNurses"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                <FieldLabel htmlFor="shareWithNurses" className="font-normal">
                  Share with the nurses
                </FieldLabel>
              </Field>
            )}
          />
        )}
      </FormDialogBody>
      <FormDialogFooter onBack={step === 1 ? () => setStep(0) : undefined}>
        {step === 0 ? (
          <Button type="submit" className="h-11 px-5 type-heading-sm">
            Next
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        ) : (
          <Button type="submit" loading={create.isPending} className="h-11 px-5 type-heading-sm">
            Save note
          </Button>
        )}
      </FormDialogFooter>
    </form>
  );
}

function NoteField({
  form,
  name,
  label,
  list,
  required,
  placeholder,
  error,
}: (typeof steps)[number][number] & {
  form: UseFormReturn<EncounterNoteValues>;
  error: FormFieldError | undefined;
}) {
  const id = `note-${name}`;
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id} className="gap-1">
        {label} {required && <RequiredMark />}
      </FieldLabel>
      <Textarea
        id={id}
        placeholder={placeholder}
        aria-required={required}
        aria-invalid={!!error}
        className="min-h-20 bg-card"
        {...form.register(name)}
      />
      {list && !error && <FieldDescription>One per line.</FieldDescription>}
      <FieldError errors={[error]} />
    </Field>
  );
}
