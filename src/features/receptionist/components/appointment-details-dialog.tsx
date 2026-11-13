import { zodResolver } from "@hookform/resolvers/zod";
import { CaretRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { SuccessDialog } from "@/components/success-dialog";
import { Button } from "@/components/ui/button";
import { RequiredMark } from "@/components/required-mark";
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  useCancelAppointment,
  useRescheduleAppointment,
} from "@/features/receptionist/api/mutations";
import { appointmentDetailQuery } from "@/features/receptionist/api/queries";
import {
  type AppointmentDetail,
  type CancellationReason,
  cancellationReasonLabels,
} from "@/features/receptionist/api/schemas";
import { AppointmentForm } from "@/features/receptionist/components/appointment-form";
import { StatusTag } from "@/features/receptionist/components/status-tag";
import { PatientSummary } from "@/features/receptionist/components/patient-summary";
import { devPrefill } from "@/features/receptionist/lib/dev-prefill";
import {
  type CancelAppointmentInput,
  type CancelAppointmentValues,
  cancelAppointmentSchema,
} from "@/features/receptionist/lib/schemas";
import { getErrorMessage } from "@/lib/api";
import { toIsoDate } from "@/lib/date-input";
import {
  formatClockTime,
  formatLongDate,
  formatLongDateTime,
  formatShortDayTime,
} from "@/lib/format";

const reasons = Object.keys(cancellationReasonLabels) as CancellationReason[];

/**
 * "Appointment Details" for the appointment `appointmentId` (open while it's set): who, when
 * and why. One still to come can be rescheduled, or cancelled with a reason; either way
 * "Patient Notified!" follows.
 */
export function AppointmentDetailsDialog({
  appointmentId,
  onClose,
}: {
  appointmentId: string | null;
  onClose: () => void;
}) {
  // What the "Patient Notified!" message says after a change.
  const [notice, setNotice] = useState<ReactNode>(null);

  return (
    <>
      <FormDialog open={appointmentId !== null} onOpenChange={(open) => !open && onClose()}>
        {appointmentId !== null && (
          <AppointmentDetails
            key={appointmentId}
            id={appointmentId}
            onCancelled={({ patient }) => {
              onClose();
              setNotice(<>Appointment cancelled. {patient.name} has been notified.</>);
            }}
            onRescheduled={({ at, patient }) => {
              onClose();
              setNotice(
                <>
                  Appointment moved to {formatShortDayTime(new Date(at))}.
                  <br />
                  {patient.name} has been notified.
                </>,
              );
            }}
          />
        )}
      </FormDialog>
      <SuccessDialog
        open={notice !== null}
        onOpenChange={(open) => !open && setNotice(null)}
        title="Patient Notified!"
        description={notice}
        primaryAction={{ label: "Done", onClick: () => setNotice(null) }}
      />
    </>
  );
}

function AppointmentDetails({
  id,
  onCancelled,
  onRescheduled,
}: {
  id: string;
  onCancelled: (appointment: AppointmentDetail) => void;
  onRescheduled: (appointment: AppointmentDetail) => void;
}) {
  const { data: appointment, isPending, isError } = useQuery(appointmentDetailQuery(id));
  const [step, setStep] = useState<"details" | "reschedule" | "cancel">("details");

  if (isPending || isError) {
    return (
      <>
        <FormDialogHeader
          title="Appointment Details"
          description={isError ? "Something went wrong." : "Loading…"}
        />
        <FormDialogBody minHeight="16rem" className="items-center justify-center">
          {isError ? (
            <p className="text-center type-body-sm-regular text-error-500">
              We couldn’t load this appointment. Try again in a moment.
            </p>
          ) : (
            <Spinner className="size-6 text-fg-caption" />
          )}
        </FormDialogBody>
      </>
    );
  }

  if (step === "reschedule") {
    return (
      <RescheduleForm
        appointment={appointment}
        onBack={() => setStep("details")}
        onRescheduled={onRescheduled}
      />
    );
  }
  if (step === "cancel") {
    return (
      <CancelForm
        appointment={appointment}
        onBack={() => setStep("details")}
        onCancelled={onCancelled}
      />
    );
  }
  return (
    <Summary
      appointment={appointment}
      onReschedule={() => setStep("reschedule")}
      onCancel={() => setStep("cancel")}
    />
  );
}

function Summary({
  appointment,
  onReschedule,
  onCancel,
}: {
  appointment: AppointmentDetail;
  onReschedule: () => void;
  onCancel: () => void;
}) {
  const at = new Date(appointment.at);
  // Only an appointment still to come can be moved or called off.
  const [openedAt] = useState(() => new Date());
  const manageable = appointment.status === "upcoming" && at > openedAt;

  return (
    <>
      <FormDialogHeader title="Appointment Details" description={formatLongDateTime(at)} />
      <FormDialogBody minHeight="20rem">
        <PatientSummary patient={appointment.patient} />
        <dl className="flex flex-col gap-4 type-body [&_dd]:text-right [&_dd]:text-fg-heading [&_div]:flex [&_div]:items-center [&_div]:justify-between [&_div]:gap-4 [&_dt]:text-fg-caption">
          <div>
            <dt>Status</dt>
            <dd>
              <StatusTag status={appointment.status} />
            </dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd className="font-semibold">{formatLongDate(at)}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd className="font-semibold">{formatClockTime(at)}</dd>
          </div>
          <div>
            <dt>Booked with</dt>
            <dd>{appointment.bookedWith}</dd>
          </div>
          {appointment.note && (
            <div>
              <dt>Note</dt>
              <dd className="wrap-anywhere">{appointment.note}</dd>
            </div>
          )}
        </dl>
      </FormDialogBody>

      {manageable && (
        // Wraps like FormDialogFooter: side by side while both fit, then stacked, full width.
        <footer className="@container border-t px-6 py-6 short:py-3">
          <div className="flex flex-wrap-reverse items-center justify-between gap-3 *:grow *:whitespace-nowrap @sm:*:grow-0">
            <Button
              variant="outline"
              className="h-11 border-error-500 px-5 type-body-sm-medium text-error-500 hover:bg-error-100 hover:text-error-700"
              onClick={onCancel}
            >
              Cancel appointment
            </Button>
            <Button
              className="h-11 gap-2 px-5 type-heading-sm has-data-[icon=inline-end]:pr-4"
              onClick={onReschedule}
            >
              Reschedule
              <CaretRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </footer>
      )}
    </>
  );
}

function RescheduleForm({
  appointment,
  onBack,
  onRescheduled,
}: {
  appointment: AppointmentDetail;
  onBack: () => void;
  onRescheduled: (appointment: AppointmentDetail) => void;
}) {
  const reschedule = useRescheduleAppointment();
  const at = new Date(appointment.at);

  return (
    <>
      <FormDialogHeader
        title="Appointment Details"
        description="Add the details for this appointment."
      />
      <AppointmentForm
        patient={appointment.patient}
        defaultValues={{
          date: toIsoDate(at),
          time: `${String(at.getHours()).padStart(2, "0")}:${String(at.getMinutes()).padStart(2, "0")}`,
          note: appointment.note ?? "",
        }}
        submitLabel="Reschedule"
        pending={reschedule.isPending}
        onBack={onBack}
        backLabel="Cancel"
        onSubmit={(change) =>
          reschedule.mutate(
            { id: appointment.id, ...change },
            { onSuccess: onRescheduled, onError: (error) => toast.error(getErrorMessage(error)) },
          )
        }
      />
    </>
  );
}

function CancelForm({
  appointment,
  onBack,
  onCancelled,
}: {
  appointment: AppointmentDetail;
  onBack: () => void;
  onCancelled: (appointment: AppointmentDetail) => void;
}) {
  const cancel = useCancelAppointment();
  const form = useForm<CancelAppointmentInput, unknown, CancelAppointmentValues>({
    resolver: zodResolver(cancelAppointmentSchema),
    defaultValues: devPrefill?.cancelAppointment ?? { reason: "", details: "" },
  });
  const reason = useWatch({ control: form.control, name: "reason" });
  const { errors } = form.formState;

  function onSubmit({ reason, details }: CancelAppointmentValues) {
    cancel.mutate(
      // The details only mean something alongside "Other".
      { id: appointment.id, reason, details: reason === "other" ? details : "" },
      { onSuccess: onCancelled, onError: (error) => toast.error(getErrorMessage(error)) },
    );
  }

  return (
    <>
      <FormDialogHeader
        title="Cancel appointment?"
        description={`${appointment.patient.name} · ${formatLongDateTime(new Date(appointment.at))}`}
      />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <FormDialogBody minHeight="20rem">
          <Controller
            name="reason"
            control={form.control}
            render={({ field, fieldState }) => (
              <FieldSet data-invalid={fieldState.invalid}>
                <FieldLegend
                  variant="label"
                  className="mb-3 flex items-center gap-1 type-body-sm-medium text-fg-heading"
                >
                  Reason for cancellation <RequiredMark />
                </FieldLegend>
                <div className="flex flex-wrap gap-3">
                  {reasons.map((value) => (
                    <label
                      key={value}
                      className="cursor-pointer rounded-full border bg-card px-4 py-2 type-body-sm-regular text-fg-caption transition-colors hover:border-divider hover:text-fg-heading has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={value}
                        checked={field.value === value}
                        onChange={() => field.onChange(value)}
                        onBlur={field.onBlur}
                        className="sr-only"
                      />
                      {cancellationReasonLabels[value]}
                    </label>
                  ))}
                </div>
                <FieldError errors={[fieldState.error]} />
              </FieldSet>
            )}
          />

          {reason === "other" && (
            <Field data-invalid={!!errors.details}>
              <FieldLabel htmlFor="cancelDetails" className="gap-1">
                Specify reason <RequiredMark />
              </FieldLabel>
              <Textarea
                id="cancelDetails"
                placeholder="Type here..."
                aria-invalid={!!errors.details}
                className="min-h-28 bg-card"
                {...form.register("details")}
              />
              <FieldError errors={[errors.details]} />
            </Field>
          )}
        </FormDialogBody>

        <FormDialogFooter onBack={onBack} backLabel="Keep appointment">
          <Button
            type="submit"
            loading={cancel.isPending}
            className="h-11 bg-error-500 px-5 type-heading-sm text-white hover:bg-error-700"
          >
            Cancel appointment
          </Button>
        </FormDialogFooter>
      </form>
    </>
  );
}
