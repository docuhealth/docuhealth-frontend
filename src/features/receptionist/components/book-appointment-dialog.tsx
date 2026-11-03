import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { DateInput } from "@/components/date-input";
import { RequiredMark } from "@/components/required-mark";
import { SuccessDialog } from "@/components/success-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { TimeInput } from "@/components/time-input";
import { Textarea } from "@/components/ui/textarea";
import { useBookAppointment } from "@/features/receptionist/api/mutations";
import { PatientSummary } from "@/features/receptionist/components/patient-summary";
import { devPrefill } from "@/features/receptionist/lib/dev-prefill";
import {
  type BookAppointmentValues,
  bookAppointmentSchema,
} from "@/features/receptionist/lib/schemas";
import { getErrorMessage } from "@/lib/api";

type Patient = { id: string; name: string; hin: string; phone: string | null };

/**
 * "Appointment Details" modal: the front desk picks a date and time (and an optional note) to
 * book `patient` in. Once it's booked, "Appointment booked!" takes its place.
 */
export function BookAppointmentDialog({
  patient,
  open,
  onOpenChange,
}: {
  patient: Patient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [booked, setBooked] = useState(false);

  return (
    <>
      <FormDialog open={open} onOpenChange={onOpenChange}>
        <FormDialogHeader
          title="Appointment Details"
          description="Add the details for this appointment."
        />
        {/* Remounts on each open, so the form starts fresh. */}
        {open && (
          <BookAppointmentForm
            patient={patient}
            onBooked={() => {
              onOpenChange(false);
              setBooked(true);
            }}
          />
        )}
      </FormDialog>
      <SuccessDialog
        open={booked}
        onOpenChange={setBooked}
        title="Appointment booked!"
        description="You have successfully booked a consultation for a patient"
        primaryAction={{ label: "Done", onClick: () => setBooked(false) }}
      />
    </>
  );
}

function BookAppointmentForm({ patient, onBooked }: { patient: Patient; onBooked: () => void }) {
  const book = useBookAppointment();
  // Midnight today: earlier days can't be picked.
  const [today] = useState(() => new Date(new Date().setHours(0, 0, 0, 0)));
  const form = useForm<BookAppointmentValues>({
    resolver: zodResolver(bookAppointmentSchema),
    defaultValues: devPrefill?.bookAppointment ?? { date: "", time: "", note: "" },
  });
  const { errors } = form.formState;

  function onSubmit({ date, time, note }: BookAppointmentValues) {
    book.mutate(
      { patientId: patient.id, at: new Date(`${date}T${time}`).toISOString(), note },
      {
        onSuccess: onBooked,
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
      <FormDialogBody>
        <PatientSummary patient={{ name: patient.name, hin: patient.hin, phone: patient.phone }} />

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

      <FormDialogFooter>
        <Button type="submit" loading={book.isPending} className="h-11 px-5 type-heading-sm">
          Book Appointment
        </Button>
      </FormDialogFooter>
    </form>
  );
}
