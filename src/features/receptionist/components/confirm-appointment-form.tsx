import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { PatientSummary } from "@/components/dashboard/patient-summary";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { useConfirmAppointment } from "@/features/receptionist/api/mutations";
import type { AppointmentDetail } from "@/features/receptionist/api/schemas";
import { StaffPicker } from "@/features/receptionist/components/staff-picker";
import {
  type ConfirmAppointmentValues,
  confirmAppointmentSchema,
} from "@/features/receptionist/lib/schemas";
import { getErrorMessage } from "@/lib/api";
import { formatLongDateTime } from "@/lib/format";

/**
 * Confirm a pending appointment (usually one the patient booked from the app), choosing who will
 * see them: the one they booked with to start with.
 */
export function ConfirmAppointmentForm({
  appointment,
  onBack,
  onConfirmed,
}: {
  appointment: AppointmentDetail;
  onBack: () => void;
  onConfirmed: (confirmed: AppointmentDetail) => void;
}) {
  const confirm = useConfirmAppointment();
  const form = useForm<ConfirmAppointmentValues>({
    resolver: zodResolver(confirmAppointmentSchema),
    defaultValues: { staff: appointment.staffId ?? "" },
  });

  function onSubmit({ staff }: ConfirmAppointmentValues) {
    confirm.mutate(
      { id: appointment.id, staffId: staff },
      { onSuccess: onConfirmed, onError: (error) => toast.error(getErrorMessage(error)) },
    );
  }

  return (
    <>
      <FormDialogHeader
        title="Confirm appointment"
        description={formatLongDateTime(new Date(appointment.at))}
      />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <FormDialogBody minHeight="16rem">
          <PatientSummary patient={appointment.patient} />
          <Controller
            name="staff"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="confirmStaff" className="gap-1">
                  Who they’ll see <RequiredMark />
                </FieldLabel>
                <StaffPicker
                  id="confirmStaff"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  invalid={fieldState.invalid}
                />
                <FieldDescription className="type-caption text-fg-caption">
                  They booked with {appointment.bookedWith}. Choose someone else if needed.
                </FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </FormDialogBody>
        <FormDialogFooter onBack={onBack} backLabel="Back">
          <Button type="submit" loading={confirm.isPending} className="h-11 px-5 type-heading-sm">
            Confirm appointment
          </Button>
        </FormDialogFooter>
      </form>
    </>
  );
}
