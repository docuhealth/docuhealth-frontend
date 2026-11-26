import { ClockIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AppointmentStatusTag } from "@/features/patient/components/appointment-status-tag";
import { DateBlock } from "@/features/patient/components/date-block";
import {
  type AppointmentView,
  appointmentLine,
  appointmentTitle,
  isOpen,
  whenLabel,
} from "@/features/patient/lib/appointments";

/**
 * An appointment in the list: its date tile, who and where, when, its status, and what the
 * patient can do: reschedule a confirmed one, confirm they'll come to a pending one.
 * TODO(api): confirming attendance has no patient endpoint (see `pending-appointments.ts`).
 */
export function AppointmentCard({
  appointment,
  confirming,
  onReschedule,
  onConfirm,
}: {
  appointment: AppointmentView;
  confirming: boolean;
  onReschedule: () => void;
  onConfirm: () => void;
}) {
  const title = appointmentTitle(appointment);
  const open = isOpen(appointment);
  return (
    <article aria-label={title} className="flex flex-col gap-4 rounded-xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <DateBlock at={appointment.at} status={appointment.status} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate type-h5 text-fg-heading">{title}</h3>
            <AppointmentStatusTag status={appointment.status} />
          </div>
          <p className="truncate type-caption text-fg-body">{appointmentLine(appointment)}</p>
          <p className="flex items-center gap-1 type-caption text-fg-caption">
            <ClockIcon aria-hidden className="size-3.5" />
            {whenLabel(appointment.at)}
          </p>
        </div>
      </div>
      <div className="flex gap-3 border-t pt-4 *:h-10 *:flex-1">
        <Button variant="outline" asChild className="type-heading-sm">
          <Link
            to="/patient/appointments/$appointmentId"
            params={{ appointmentId: appointment.id }}
          >
            View details
          </Link>
        </Button>
        {open && appointment.status === "pending" && (
          <Button className="type-heading-sm" loading={confirming} onClick={onConfirm}>
            Confirm attendance
          </Button>
        )}
        {open && appointment.status === "confirmed" && (
          <Button className="type-heading-sm" onClick={onReschedule}>
            Reschedule
          </Button>
        )}
      </div>
    </article>
  );
}
