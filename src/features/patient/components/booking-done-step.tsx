import { CheckIcon, ClockCounterClockwiseIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { AppointmentFacts } from "@/features/patient/components/appointment-facts";
import { RecordList, SectionLabel } from "@/features/patient/components/patient-ui";
import { RelatedRow } from "@/features/patient/components/related-row";
import { type AppointmentView, longDate, timeLine } from "@/features/patient/lib/appointments";
import { formatNaira } from "@/features/patient/lib/lab-results";

/**
 * Booking, done: when and where, the fee, and the reminders that will go out. A new booking, or
 * a moved one (`pending`), waits for the facility to confirm it, and this says so.
 */
export function BookingDoneStep({
  appointment,
  rescheduled,
  pending,
  onView,
}: {
  appointment: AppointmentView;
  rescheduled: boolean;
  pending: boolean;
  onView: () => void;
}) {
  const facility = appointment.facility ?? "The facility";
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="relative flex flex-col items-center gap-3 px-6 pt-6 text-center">
        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="absolute top-5 right-6 rounded-full bg-line hover:bg-divider"
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
        <span className="grid size-16 place-content-center rounded-full bg-success-100">
          <span className="grid size-11 place-content-center rounded-full bg-success-500 text-white">
            <CheckIcon weight="bold" className="size-6" />
          </span>
        </span>
        <DialogTitle className="type-h4 text-fg-heading">
          {rescheduled ? "You’re rescheduled!" : "You’re booked!"}
        </DialogTitle>
        <DialogDescription className="max-w-80 type-body-sm-regular text-fg-caption">
          {pending
            ? `${facility} will confirm ${rescheduled ? "the new time" : "your appointment"}. Until then it shows as pending.`
            : "Your appointment is at the new time."}
        </DialogDescription>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
        <AppointmentFacts
          label="Your appointment"
          columns={2}
          facts={[
            ["Date", longDate(appointment.at)],
            ["Time", timeLine(appointment)],
            ["Facility", appointment.facilityLabel],
            // TODO(api): no fees yet.
            ["Consultation fee", appointment.fee === null ? null : formatNaira(appointment.fee)],
          ]}
        />
        {appointment.reminders.length > 0 && (
          <section className="flex flex-col gap-2">
            <SectionLabel>Reminders</SectionLabel>
            <RecordList label="Reminders">
              {appointment.reminders.map((reminder) => (
                <RelatedRow
                  key={reminder.before}
                  tone="purple"
                  icon={<ClockCounterClockwiseIcon />}
                  title={reminder.before}
                  detail={reminder.channels}
                />
              ))}
            </RecordList>
          </section>
        )}
      </div>

      <footer className="flex gap-3 px-6 pb-6 *:h-11 *:flex-1">
        <DialogClose asChild>
          <Button type="button" variant="outline" className="type-heading-sm">
            Done
          </Button>
        </DialogClose>
        <Button type="button" onClick={onView} className="type-heading-sm">
          View appointment
        </Button>
      </footer>
    </div>
  );
}
