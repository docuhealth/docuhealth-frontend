import type { Appointment } from "@/features/receptionist/api/schemas";
import { StatusTag } from "@/features/receptionist/components/status-tag";
import { sameDay } from "@/features/receptionist/lib/calendar";
import { formatClockTime, formatLongDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/** The list view: the month's appointments under a heading for each day that has any. */
export function CalendarList({
  appointments,
  now,
  emptyMessage,
  onOpen,
}: {
  appointments: Appointment[];
  now: Date;
  emptyMessage: string;
  onOpen: (appointment: Appointment) => void;
}) {
  const days: { day: Date; items: Appointment[] }[] = [];
  for (const appointment of appointments) {
    const at = new Date(appointment.at);
    const last = days.at(-1);
    if (last && sameDay(last.day, at)) last.items.push(appointment);
    else days.push({ day: at, items: [appointment] });
  }

  if (days.length === 0) {
    return (
      <p className="rounded-xl border bg-card px-6 py-16 text-center type-body-sm-regular text-fg-caption">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {days.map(({ day, items }) => {
        const today = sameDay(day, now);
        return (
          <section
            key={day.toDateString()}
            aria-label={formatLongDate(day)}
            className="@container rounded-xl border bg-card"
          >
            <header className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
              <h2 className={cn("type-h5", today && "text-info-500")}>
                {today ? "Today · " : ""}
                {formatLongDate(day)}
              </h2>
              <span className="type-caption text-fg-caption">{items.length} Booked</span>
            </header>
            <ul>
              {items.map((appointment) => (
                <li key={appointment.id} className="border-b last:border-b-0">
                  <button
                    type="button"
                    onClick={() => onOpen(appointment)}
                    className="flex w-full items-center gap-3 px-5 py-3.5 text-left type-body-sm-regular transition-colors hover:bg-muted"
                  >
                    <span className="w-20 shrink-0 text-fg-heading">
                      {formatClockTime(new Date(appointment.at))}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span
                        className={cn(
                          "truncate text-fg-heading",
                          appointment.status === "cancelled" && "line-through",
                        )}
                      >
                        {appointment.patient.name}
                      </span>
                      <span className="truncate text-fg-caption">{appointment.patient.phone}</span>
                      <span className="truncate text-fg-caption @md:hidden">
                        {appointment.reason}
                      </span>
                    </span>
                    <span className="hidden w-[30%] truncate text-fg-caption @md:block">
                      {appointment.reason}
                    </span>
                    <span className="w-24 shrink-0 text-right">
                      <StatusTag status={appointment.status} className="inline-block" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
