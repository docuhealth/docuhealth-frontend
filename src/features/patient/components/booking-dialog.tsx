import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { FormDialog } from "@/components/dashboard/form-dialog";
import { useBookAppointment, useRescheduleAppointment } from "@/features/patient/api/appointments";
import {
  BookingDetailsStep,
  type BookingDetails,
} from "@/features/patient/components/booking-details-step";
import { BookingDoneStep } from "@/features/patient/components/booking-done-step";
import { BookingTimeStep } from "@/features/patient/components/booking-time-step";
import { bookedView } from "@/features/patient/lib/appointments";
import { useAppointments } from "@/features/patient/lib/use-appointments";
import { getErrorMessage } from "@/lib/api";

/** The appointment being moved: its id, and the facility (name and sqid) it's at. */
export type RescheduleTarget = { id: string; facility: string | null; facilityId: string | null };

/** What was booked or moved; `id` is null when the booking couldn't be found again. */
type Done = {
  id: string | null;
  at: string;
  facility: string | null;
  facilityId: string | null;
  /** Waiting for the hospital to confirm it (a new booking, or a moved one). */
  pending: boolean;
};

/**
 * The patient books an appointment: where, who and what for, then a day and a free time, then
 * "You're booked!". With `reschedule`, only the time step, for that appointment. Either way the
 * hospital confirms it (a moved one goes back to pending), and the last step says so.
 */
export function BookingDialog({
  open,
  onOpenChange,
  reschedule,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reschedule?: RescheduleTarget;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      {/* Remounts on each open, so it starts fresh. */}
      {open && <BookingSteps reschedule={reschedule} onClose={() => onOpenChange(false)} />}
    </FormDialog>
  );
}

function BookingSteps({
  reschedule,
  onClose,
}: {
  reschedule?: RescheduleTarget;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const book = useBookAppointment();
  const move = useRescheduleAppointment();
  const { data: appointments } = useAppointments();
  const [details, setDetails] = useState<BookingDetails | null>(null);
  const [step, setStep] = useState<"details" | "time" | "done">(reschedule ? "time" : "details");
  const [done, setDone] = useState<Done | null>(null);

  const finish = (result: Done) => {
    setDone(result);
    setStep("done");
  };
  const onError = (error: Error) => toast.error(getErrorMessage(error));

  const submit = (at: Date) => {
    if (reschedule) {
      move.mutate(
        { id: reschedule.id, at: at.toISOString() },
        {
          onSuccess: (moved) =>
            finish({
              id: moved.sqid,
              at: moved.scheduled_time,
              facility: reschedule.facility,
              facilityId: reschedule.facilityId,
              pending: moved.status === "pending",
            }),
          onError,
        },
      );
    } else if (details) {
      book.mutate(
        { ...details, at: at.toISOString() },
        {
          onSuccess: (booked) =>
            finish({ ...booked, facility: details.facility || null, pending: true }),
          onError,
        },
      );
    }
  };

  if (step === "done" && done) {
    // The appointment as the list now has it, else what the booking said.
    const appointment =
      (done.id && appointments?.find(({ id }) => id === done.id)) || bookedView(done);
    return (
      <BookingDoneStep
        appointment={appointment}
        rescheduled={!!reschedule}
        pending={done.pending}
        onView={() => {
          onClose();
          void (done.id
            ? navigate({
                to: "/patient/appointments/$appointmentId",
                params: { appointmentId: done.id },
              })
            : navigate({ to: "/patient/appointments" }));
        }}
      />
    );
  }

  if (step === "time") {
    return (
      <BookingTimeStep
        facility={details?.facilityId ?? reschedule?.facilityId ?? "any"}
        title={reschedule ? "Pick a new date and time" : "Pick a date and time"}
        description={
          reschedule
            ? "Choose a new time for your appointment."
            : "Select your preferred appointment date and time."
        }
        progress={reschedule ? undefined : { step: 2, total: 3 }}
        pending={book.isPending || move.isPending}
        onBack={reschedule ? undefined : () => setStep("details")}
        onSubmit={submit}
      />
    );
  }

  return (
    <BookingDetailsStep
      defaultValues={details}
      onContinue={(values) => {
        setDetails(values);
        setStep("time");
      }}
    />
  );
}
