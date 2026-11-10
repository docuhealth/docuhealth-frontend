import type { Appointment } from "@/features/receptionist/api/schemas";
import { AppointmentChip } from "@/features/receptionist/components/appointment-chip";
import { monthGrid, sameDay } from "@/features/receptionist/lib/calendar";
import { cn } from "@/lib/utils";

/** How many appointments a day's box lists before "+N more". */
const PREVIEW = 3;

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const shortTime = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
const longDay = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** "1:00", as the month's boxes print times (the details give the AM or PM). */
function compactTime(date: Date) {
  return shortTime.format(date).replace(/\s?[AP]M$/i, "");
}

/**
 * The month view: whole weeks covering `month`, each day with its count and first few
 * appointments. A day's number, or its "+N more", opens that day.
 */
export function CalendarMonth({
  month,
  appointments,
  now,
  onOpenDay,
  onOpenAppointment,
}: {
  month: Date;
  appointments: Appointment[];
  now: Date;
  onOpenDay: (day: Date) => void;
  onOpenAppointment: (appointment: Appointment) => void;
}) {
  const days = monthGrid(month);
  const weeks = Array.from({ length: days.length / 7 }, (_, week) =>
    days.slice(week * 7, week * 7 + 7),
  );

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[56rem] table-fixed border-collapse">
        <thead>
          <tr className="border-b">
            {weekdays.map((day) => (
              <th
                key={day}
                scope="col"
                className="border-l px-4 py-4 text-left type-body-sm-regular font-normal text-fg-caption uppercase first:border-l-0"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0]?.toDateString()} className="border-b last:border-b-0">
              {week.map((day) => (
                <DayBox
                  key={day.toDateString()}
                  day={day}
                  inMonth={day.getMonth() === month.getMonth()}
                  today={sameDay(day, now)}
                  appointments={appointments.filter(({ at }) => sameDay(new Date(at), day))}
                  onOpen={() => onOpenDay(day)}
                  onOpenAppointment={onOpenAppointment}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DayBox({
  day,
  inMonth,
  today,
  appointments,
  onOpen,
  onOpenAppointment,
}: {
  day: Date;
  inMonth: boolean;
  today: boolean;
  appointments: Appointment[];
  onOpen: () => void;
  onOpenAppointment: (appointment: Appointment) => void;
}) {
  const more = appointments.length - PREVIEW;

  return (
    <td
      aria-current={today ? "date" : undefined}
      className="h-40 border-l p-3 align-top first:border-l-0"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onOpen}
            aria-label={`Open ${longDay.format(day)}`}
            className={cn(
              "-m-1 grid h-9 min-w-9 place-content-center rounded-full px-1 type-h4 transition-colors hover:bg-line",
              today
                ? "bg-info-500 text-white hover:bg-info-700"
                : inMonth
                  ? "text-fg-heading"
                  : "text-fg-caption",
            )}
          >
            {day.getDate()}
          </button>
          {appointments.length > 0 && (
            <span className="type-caption text-fg-caption">{appointments.length} Booked</span>
          )}
        </div>
        {appointments.slice(0, PREVIEW).map((appointment) => (
          <AppointmentChip
            key={appointment.id}
            appointment={appointment}
            onOpen={onOpenAppointment}
            className="px-2.5 py-1.5"
          >
            <span className="truncate type-body-sm-tight-semibold">
              {compactTime(new Date(appointment.at))} {appointment.patient.name}
            </span>
          </AppointmentChip>
        ))}
        {more > 0 && (
          <button
            type="button"
            onClick={onOpen}
            className="self-start type-caption text-fg-caption hover:text-fg-heading"
          >
            +{more} more
          </button>
        )}
      </div>
    </td>
  );
}
