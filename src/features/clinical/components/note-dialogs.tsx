import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  useRecordVitals,
  useWriteAdmissionNote,
  useWriteTextNote,
} from "@/features/clinical/api/note-writes";
import {
  type AdmissionNoteValues,
  admissionNoteSchema,
  type NoteField,
  mobilityLabels,
  nutritionLabels,
  type RecordVitalsValues,
  recordVitalsSchema,
  type TextNoteKind,
  textNoteSchema,
  textNotes,
} from "@/features/clinical/lib/note-schemas";
import { getErrorMessage } from "@/lib/api";
import { emptyVitals } from "@/lib/vitals-form";
import { DraftNotice } from "@/components/draft-notice";
import { useFormDraft } from "@/hooks/use-form-draft";

/** The admission a note is written on. */
type NoteTarget = { hin: string; admissionId: string; patientName: string };

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: NoteTarget;
};

const submitClass = "h-11 px-5 type-heading-sm";

/** A case note, care plan or progress note: boxes of text, some one item per line. */
export function TextNoteDialog({ kind, ...props }: DialogProps & { kind: TextNoteKind }) {
  return (
    <FormDialog open={props.open} onOpenChange={props.onOpenChange}>
      {/* Mounted only while open, so every note starts blank. */}
      {props.open && (
        <TextNoteForm kind={kind} target={props.target} onDone={() => props.onOpenChange(false)} />
      )}
    </FormDialog>
  );
}

function TextNoteForm({
  kind,
  target,
  onDone,
}: {
  kind: TextNoteKind;
  target: NoteTarget;
  onDone: () => void;
}) {
  const { title, description, done } = textNotes[kind];
  const fields: readonly NoteField[] = textNotes[kind].fields;
  const write = useWriteTextNote(kind);
  const form = useForm<Record<string, string>>({
    resolver: zodResolver(textNoteSchema(fields)),
    defaultValues: Object.fromEntries(fields.map(({ name }) => [name, ""])),
  });
  const { errors } = form.formState;
  // Unsent notes survive a refresh, but only while the tab is open: they're health information.
  const draft = useFormDraft(form, {
    form: `notes:${kind}:${target.admissionId}`,
    fields: fields.map(({ name }) => name),
    storage: "session",
  });

  function onSubmit(values: Record<string, string>) {
    write.mutate(
      { hin: target.hin, admissionId: target.admissionId, values },
      {
        onSuccess: () => {
          draft.clear();
          toast.success(done);
          onDone();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <FormDialogHeader title={title} description={`${description} ${target.patientName}.`} />
      <FormDialogBody>
        <DraftNotice restored={draft.restored} onDiscard={draft.discard} />
        {fields.map(({ name, label, placeholder, required, list }) => {
          const id = `${kind}-${name}`;
          const error = errors[name];
          return (
            <Field key={name} data-invalid={!!error}>
              <FieldLabel htmlFor={id} className="gap-1">
                {label} {required && <RequiredMark />}
              </FieldLabel>
              <Textarea
                id={id}
                placeholder={placeholder}
                aria-required={required}
                aria-invalid={!!error}
                aria-describedby={list ? `${id}-hint` : undefined}
                className="min-h-20 bg-card"
                {...form.register(name)}
              />
              {list && (
                <p id={`${id}-hint`} className="type-caption text-fg-caption">
                  One per line.
                </p>
              )}
              <FieldError errors={[error]} />
            </Field>
          );
        })}
      </FormDialogBody>
      <FormDialogFooter>
        <Button type="submit" loading={write.isPending} className={submitClass}>
          Save note
        </Button>
      </FormDialogFooter>
    </form>
  );
}

/**
 * The nurse's admission note, written when the patient arrives on the ward: a full set of vitals
 * and the nursing assessment (allergies, mobility, nutrition, fall risk, skin, first concern).
 */
export function AdmissionNoteDialog(props: DialogProps) {
  return (
    <FormDialog open={props.open} onOpenChange={props.onOpenChange}>
      {props.open && (
        <AdmissionNoteForm target={props.target} onDone={() => props.onOpenChange(false)} />
      )}
    </FormDialog>
  );
}

function AdmissionNoteForm({ target, onDone }: { target: NoteTarget; onDone: () => void }) {
  const write = useWriteAdmissionNote();
  const form = useForm<AdmissionNoteValues>({
    resolver: zodResolver(admissionNoteSchema),
    defaultValues: {
      vitals: emptyVitals,
      allergies: "",
      mobility: "",
      nutrition: "",
      fallRisk: "",
      skin: "",
      concern: "",
    },
  });
  const { errors } = form.formState;
  const draft = useFormDraft(form, {
    form: `notes:admission:${target.admissionId}`,
    fields: ["vitals", "allergies", "mobility", "nutrition", "fallRisk", "skin", "concern"],
    storage: "session",
  });

  function onSubmit(values: AdmissionNoteValues) {
    write.mutate(
      { ...values, hin: target.hin, admissionId: target.admissionId },
      {
        onSuccess: () => {
          draft.clear();
          toast.success(`${target.patientName}’s admission note is saved.`);
          onDone();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  const choices = [
    ["mobility", "Mobility", mobilityLabels],
    ["nutrition", "Nutrition", nutritionLabels],
  ] as const;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <FormDialogHeader
          title="Admission note"
          description={`${target.patientName}’s vitals and nursing assessment on arrival.`}
        />
        <FormDialogBody>
          <DraftNotice restored={draft.restored} onDiscard={draft.discard} />
          <VitalsFields idPrefix="admissionNote" />

          <Field data-invalid={!!errors.concern}>
            <FieldLabel htmlFor="admissionNote-concern" className="gap-1">
              Initial nursing concern <RequiredMark />
            </FieldLabel>
            <Textarea
              id="admissionNote-concern"
              placeholder="e.g. Shortness of breath on exertion"
              aria-required
              aria-invalid={!!errors.concern}
              className="min-h-20 bg-card"
              {...form.register("concern")}
            />
            <FieldError errors={[errors.concern]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="admissionNote-allergies">Allergies</FieldLabel>
            <Textarea
              id="admissionNote-allergies"
              placeholder="e.g. Penicillin"
              aria-describedby="admissionNote-allergies-hint"
              className="min-h-16 bg-card"
              {...form.register("allergies")}
            />
            <p id="admissionNote-allergies-hint" className="type-caption text-fg-caption">
              One per line. Leave empty if none are known.
            </p>
          </Field>

          {choices.map(([name, legend, labels]) => (
            <Controller
              key={name}
              name={name}
              control={form.control}
              render={({ field }) => (
                <FieldSet>
                  <FieldLegend variant="label">{legend}</FieldLegend>
                  <RadioGroup
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-wrap gap-x-5 gap-y-3"
                  >
                    {Object.entries(labels).map(([value, label]) => (
                      <Field key={value} orientation="horizontal" className="w-auto">
                        <RadioGroupItem value={value} id={`admissionNote-${name}-${value}`} />
                        <FieldLabel
                          htmlFor={`admissionNote-${name}-${value}`}
                          className="font-normal"
                        >
                          {label}
                        </FieldLabel>
                      </Field>
                    ))}
                  </RadioGroup>
                </FieldSet>
              )}
            />
          ))}

          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="admissionNote-fallRisk">Fall risk</FieldLabel>
              <Input
                id="admissionNote-fallRisk"
                placeholder="e.g. High: unsteady on feet"
                className="bg-card"
                {...form.register("fallRisk")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="admissionNote-skin">Skin</FieldLabel>
              <Input
                id="admissionNote-skin"
                placeholder="e.g. Intact, no pressure areas"
                className="bg-card"
                {...form.register("skin")}
              />
            </Field>
          </div>
        </FormDialogBody>
        <FormDialogFooter>
          <Button type="submit" loading={write.isPending} className={submitClass}>
            Save admission note
          </Button>
        </FormDialogFooter>
      </form>
    </FormProvider>
  );
}

/** Vital signs taken on the ward, outside a care task. */
export function RecordVitalsDialog(props: DialogProps) {
  return (
    <FormDialog open={props.open} onOpenChange={props.onOpenChange}>
      {props.open && (
        <RecordVitalsForm target={props.target} onDone={() => props.onOpenChange(false)} />
      )}
    </FormDialog>
  );
}

function RecordVitalsForm({ target, onDone }: { target: NoteTarget; onDone: () => void }) {
  const record = useRecordVitals();
  const form = useForm<RecordVitalsValues>({
    resolver: zodResolver(recordVitalsSchema),
    defaultValues: { vitals: emptyVitals, notes: "" },
  });

  function onSubmit({ vitals, notes }: RecordVitalsValues) {
    record.mutate(
      { hin: target.hin, admissionId: target.admissionId, vitals, notes },
      {
        onSuccess: () => {
          toast.success(`${target.patientName}’s vitals are recorded.`);
          onDone();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <FormDialogHeader
          title="Record vitals"
          description={`${target.patientName}’s vital signs, taken now.`}
        />
        <FormDialogBody>
          <VitalsFields idPrefix="recordVitals" />
          <Field>
            <FieldLabel htmlFor="recordVitals-notes">Notes</FieldLabel>
            <Textarea
              id="recordVitals-notes"
              placeholder="e.g. Taken after the evening dose"
              className="min-h-16 bg-card"
              {...form.register("notes")}
            />
          </Field>
        </FormDialogBody>
        <FormDialogFooter>
          <Button type="submit" loading={record.isPending} className={submitClass}>
            Save vitals
          </Button>
        </FormDialogFooter>
      </form>
    </FormProvider>
  );
}
