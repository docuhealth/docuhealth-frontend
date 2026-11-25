import { ArrowsClockwiseIcon, CalendarBlankIcon, CaretRightIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/features/patient/api/schemas";
import { BookingDialog, type RescheduleTarget } from "@/features/patient/components/booking-dialog";
import { formatDayAndTime, initials } from "@/lib/format";

/**
 * The brand-colored card at the top of the patient's home: their next appointment (`undefined`
 * while it loads, `null` when nothing is booked), with booking and rescheduling.
 */
export function UpcomingAppointmentCard({
  appointment,
}: {
  appointment: Appointment | null | undefined;
}) {
  const when = appointment ? formatDayAndTime(new Date(appointment.at)) : null;
  const [booking, setBooking] = useState<{ reschedule?: RescheduleTarget } | null>(null);
  return (
    <section
      aria-label="Upcoming appointment"
      className="relative overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgb(255_255_255/0.28),transparent_45%)]"
      />
      <div className="relative flex items-start justify-between gap-4">
        <p className="flex items-center gap-2 type-caption text-white/80">
          <CalendarBlankIcon className="size-4" />
          Upcoming Appointment
        </p>
        {when && (
          <span className="rounded-full bg-warning-300 px-3 py-0.5 type-caption-semibold text-fg-heading">
            {when.day}
          </span>
        )}
      </div>

      {appointment === undefined ? (
        <div className="relative mt-4 h-24 animate-pulse rounded-lg bg-white/10" />
      ) : appointment ? (
        <div className="relative mt-3 flex flex-col gap-5">
          <p className="type-accent-h1 text-white">{when?.time}</p>
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="grid size-10 shrink-0 place-content-center rounded-full bg-white/20 type-body-sm-medium text-white"
            >
              {initials(appointment.clinician?.name ?? "DocuHealth")}
            </span>
            <div className="flex flex-col">
              <span className="type-body">{appointment.clinician?.name ?? "—"}</span>
              <span className="type-caption text-white/70">
                {[appointment.clinician?.specialty, appointment.facility]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="h-10 min-w-40 bg-card px-5 text-primary hover:bg-card/90">
              <Link
                to="/patient/appointments/$appointmentId"
                params={{ appointmentId: appointment.id }}
              >
                View details
                <CaretRightIcon data-icon="inline-end" />
              </Link>
            </Button>
            {/* TODO(api): patients can't reschedule yet; see pending-appointments.ts. */}
            <Button
              variant="outline"
              className="h-10 min-w-40 border-white/30 bg-white/10 px-5 text-white hover:bg-white/20 hover:text-white"
              onClick={() =>
                setBooking({ reschedule: { id: appointment.id, facility: appointment.facility } })
              }
            >
              <ArrowsClockwiseIcon data-icon="inline-start" />
              Reschedule
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative mt-3 flex flex-col gap-4">
          <p className="type-accent-h1 text-white">Nothing booked</p>
          <p className="type-body-sm-regular text-white/80">
            Need to see a doctor? Book a visit in minutes.
          </p>
          {/* TODO(api): patients can't book yet; see pending-appointments.ts. */}
          <Button
            className="h-10 w-full max-w-66 bg-card text-primary hover:bg-card/90"
            onClick={() => setBooking({})}
          >
            <CalendarBlankIcon data-icon="inline-start" />
            Book Appointment
          </Button>
        </div>
      )}
      <BookingDialog
        open={!!booking}
        onOpenChange={(open) => !open && setBooking(null)}
        reschedule={booking?.reschedule}
      />
    </section>
  );
}
