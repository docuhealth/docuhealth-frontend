import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormDialogBody, FormDialogFooter } from "@/components/dashboard/form-dialog";
import { DateInput } from "@/components/date-input";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { TimeInput } from "@/components/time-input";
import { Textarea } from "@/components/ui/textarea";
import { PatientSummary } from "@/features/receptionist/components/patient-summary";
import {
  type BookAppointmentValues,
  bookAppointmentSchema,
} from "@/features/receptionist/lib/schemas";

/**
 * The appointment modals' form: the patient, then a date and time from now on and an optional
 * note. Used to book an appointment and to move one; `onSubmit` gets the time as ISO.
 */
export function AppointmentForm({
  patient,
  defaultValues,
  submitLabel,
  pending,
  onSubmit,
  onBack,
  backLabel,
  patientAction,
}: {
  patient: { name: string; hin: string; phone?: string | null; email?: string | null };
  defaultValues: BookAppointmentValues;
  submitLabel: string;
  pending: boolean;
  onSubmit: (appointment: { at: string; note: string }) => void;
  /** Replaces the footer's Cancel with a button back to the step before. */
  onBack?: () => void;
  backLabel?: string;
  /** Goes beside the patient, e.g. a button to pick someone else. */
  patientAction?: ReactNode;
}) {
  // Midnight today: earlier days can't be picked.
  const [today] = useState(() => new Date(new Date().setHours(0, 0, 0, 0)));
  const form = useForm<BookAppointmentValues>({
    resolver: zodResolver(bookAppointmentSchema),
    defaultValues,
  });
  const { errors } = form.formState;

  return (
    <form
      onSubmit={form.handleSubmit(({ date, time, note }) =>
        onSubmit({ at: new Date(`${date}T${time}`).toISOString(), note }),
      )}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <FormDialogBody>
        <PatientSummary patient={patient} action={patientAction} />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Controller
            name="date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="appointmentDate" className="gap-1">
                  Date <RequiredMark />
                </FieldLabel>
                <DateInput
                  ref={field.ref}
                  id="appointmentDate"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  min={today}
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
                <FieldLabel htmlFor="appointmentTime" className="gap-1">
                  Time <RequiredMark />
                </FieldLabel>
                <TimeInput
                  ref={field.ref}
                  id="appointmentTime"
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

        <Field data-invalid={!!errors.note}>
          <FieldLabel htmlFor="appointmentNote">
            Add note <span className="font-normal text-fg-caption">(optional)</span>
          </FieldLabel>
          <Textarea
            id="appointmentNote"
            placeholder="Type here"
            aria-invalid={!!errors.note}
            className="min-h-28 bg-card"
            {...form.register("note")}
          />
          <FieldError errors={[errors.note]} />
        </Field>
      </FormDialogBody>

      <FormDialogFooter onBack={onBack} backLabel={backLabel}>
        <Button type="submit" loading={pending} className="h-11 px-5 type-heading-sm">
          {submitLabel}
        </Button>
      </FormDialogFooter>
    </form>
  );
}
