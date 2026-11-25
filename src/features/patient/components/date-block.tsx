import type { AppointmentStatus } from "@/features/patient/lib/appointments";
import { dateBlock } from "@/features/patient/lib/appointments";
import { cn } from "@/lib/utils";

// The month band's color says where the appointment stands.
const bands: Record<AppointmentStatus, string> = {
  confirmed: "bg-error-500",
  pending: "bg-warning-500",
  cancelled: "bg-fg-caption",
  completed: "bg-fg-caption",
};

/** A tear-off calendar tile: the month on a band colored by status, the day under it. */
export function DateBlock({
  at,
  status,
  size = "md",
}: {
  at: string;
  status: AppointmentStatus;
  size?: "md" | "lg";
}) {
  const { month, day } = dateBlock(at);
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 flex-col overflow-hidden rounded-md border bg-card text-center",
        size === "lg" ? "w-14" : "w-11",
      )}
    >
      <span className={cn("py-0.5 type-caption-semibold text-white", bands[status])}>{month}</span>
      <span
        className={cn(
          "text-fg-heading",
          size === "lg" ? "py-1.5 type-accent-h2" : "py-1 type-accent-h3",
        )}
      >
        {day}
      </span>
    </span>
  );
}
