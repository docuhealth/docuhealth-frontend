import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { FormDialog } from "@/components/dashboard/form-dialog";
import {
  type Booked,
  useBookAppointment,
  useRescheduleAppointment,
} from "@/features/patient/api/pending-appointments";
import {
  BookingDetailsStep,
  type BookingDetails,
} from "@/features/patient/components/booking-details-step";
import { BookingDoneStep } from "@/features/patient/components/booking-done-step";
import { BookingTimeStep } from "@/features/patient/components/booking-time-step";
import { mergeAppointments } from "@/features/patient/lib/appointments";
import { errorCode, getErrorMessage } from "@/lib/api";
import { formatTime } from "@/lib/format";

/** The appointment being moved: its id, and the facility whose free times to offer. */
export type RescheduleTarget = { id: string; facility: string | null };

/**
 * The patient books an appointment: where and what for, then a day and a free time, then
 * "You're booked!". With `reschedule`, only the time step, for that appointment. When someone
 * takes the time first, the time step says so, or `onConflict` hears of it (and the dialog
 * closes) so the page can. TODO(api): patients can't book yet; see `pending-appointments.ts`.
 */
export function BookingDialog({
  open,
  onOpenChange,
  reschedule,
  onConflict,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reschedule?: RescheduleTarget;
  onConflict?: (time: string) => void;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      {/* Remounts on each open, so it starts fresh. */}
      {open && (
        <BookingSteps
          reschedule={reschedule}
          onClose={() => onOpenChange(false)}
          onConflict={
            onConflict &&
            ((time) => {
              onOpenChange(false);
              onConflict(time);
            })
          }
        />
      )}
    </FormDialog>
  );
}

function BookingSteps({
  reschedule,
  onClose,
  onConflict,
}: {
  reschedule?: RescheduleTarget;
  onClose: () => void;
  onConflict?: (time: string) => void;
}) {
  const navigate = useNavigate();
  const book = useBookAppointment();
  const move = useRescheduleAppointment();
  const [details, setDetails] = useState<BookingDetails | null>(null);
  const [step, setStep] = useState<"details" | "time" | "done">(reschedule ? "time" : "details");
  const [booked, setBooked] = useState<Booked | null>(null);
  const [conflict, setConflict] = useState<string | null>(null);

  const handlers = (at: Date) => ({
    onSuccess: (result: Booked) => {
      setBooked(result);
      setStep("done");
    },
    onError: (error: Error) => {
      if (errorCode(error) !== "slot_taken") {
        toast.error(getErrorMessage(error));
        return;
      }
      if (onConflict) onConflict(formatTime(at));
      else setConflict(formatTime(at));
    },
  });

  const submit = (at: Date) => {
    setConflict(null);
    if (reschedule) {
      move.mutate({ id: reschedule.id, at: at.toISOString() }, handlers(at));
    } else if (details) {
      book.mutate({ ...details, at: at.toISOString() }, handlers(at));
    }
  };

  if (step === "done" && booked) {
    const [appointment] = mergeAppointments([], {
      bookings: [booked.appointment],
      details: [booked.detail],
    });
    if (!appointment) return null;
    return (
      <BookingDoneStep
        appointment={appointment}
        rescheduled={!!reschedule}
        onView={() => {
          onClose();
          void navigate({
            to: "/patient/appointments/$appointmentId",
            params: { appointmentId: appointment.id },
          });
        }}
      />
    );
  }

  if (step === "time") {
    return (
      <BookingTimeStep
        // TODO(api): free times by facility name when rescheduling: appointments carry no id.
        facility={details?.facilityId ?? reschedule?.facility ?? "any"}
        title={reschedule ? "Pick a new date and time" : "Pick a date and time"}
        description={
          reschedule
            ? "Choose a new time for your appointment."
            : "Select your preferred appointment date and time."
        }
        progress={reschedule ? undefined : { step: 2, total: 3 }}
        pending={book.isPending || move.isPending}
        conflict={conflict}
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
