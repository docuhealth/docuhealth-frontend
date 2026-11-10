import type { ReactNode } from "react";
import { type Appointment, appointmentStatusLabels } from "@/features/receptionist/api/schemas";
import { formatClockTime } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Green once the patient's here, blue while they're expected, struck through if cancelled. */
const chipTones = {
  upcoming: "border-info-500/30 bg-info-100 text-info-500",
  arrived: "border-success-500/30 bg-success-100 text-success-700",
  checked_in: "border-success-500/30 bg-success-100 text-success-700",
  in_progress: "border-success-500/30 bg-success-100 text-success-700",
  cancelled: "border-line bg-surface text-fg-caption line-through",
} as const satisfies Record<Appointment["status"], string>;

/**
 * One appointment on the calendar, coloured by its status; `children` is what it shows (the
 * patient, maybe the time). Clicking it calls `onOpen`, which shows its details.
 */
export function AppointmentChip({
  appointment,
  onOpen,
  className,
  children,
}: {
  appointment: Appointment;
  onOpen: (appointment: Appointment) => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(appointment)}
      aria-label={`${appointment.patient.name}, ${formatClockTime(new Date(appointment.at))}, ${appointmentStatusLabels[appointment.status]}`}
      className={cn(
        "flex w-full min-w-0 flex-col rounded-md border px-3 py-2 text-left transition-[filter] hover:brightness-95 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        chipTones[appointment.status],
        className,
      )}
    >
      {children}
    </button>
  );
}
