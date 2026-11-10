import { type Appointment, appointmentStatusLabels } from "@/features/receptionist/api/schemas";
import { cn } from "@/lib/utils";

const statusTones = {
  upcoming: "bg-line text-fg-caption",
  arrived: "bg-success-100 text-success-700",
  checked_in: "bg-success-100 text-success-500",
  in_progress: "bg-info-100 text-info-500",
  cancelled: "bg-line text-fg-caption line-through",
} as const satisfies Record<Appointment["status"], string>;

/** An appointment's status as a small tinted pill. */
export function StatusTag({
  status,
  className,
}: {
  status: Appointment["status"];
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 type-caption-medium whitespace-nowrap",
        statusTones[status],
        className,
      )}
    >
      {appointmentStatusLabels[status]}
    </span>
  );
}
