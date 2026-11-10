import { PlusIcon } from "@phosphor-icons/react";
import { useLayoutEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { type Appointment, appointmentStatusLabels } from "@/features/receptionist/api/schemas";
import { AppointmentChip } from "@/features/receptionist/components/appointment-chip";
import {
  atMinute,
  sameDay,
  SLOT_CAPACITY,
  SLOT_MINUTES,
  slotOf,
  slotsFor,
} from "@/features/receptionist/lib/calendar";
import { formatClockTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short" });
const longDay = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/**
 * The day and week views: a half-hour row per time down the side and a column per day, with
 * each appointment in the row it starts in. A single day shows each appointment's status and
 * reason too; a week has room for names only. Hovering a slot that's still to come offers
 * "Add", which books it.
 */
export function CalendarTimeGrid({
  days,
  appointments,
  now,
  onAdd,
  onOpen,
}: {
  days: Date[];
  appointments: Appointment[];
  now: Date;
  onAdd: (at: Date) => void;
  onOpen: (appointment: Appointment) => void;
}) {
  const single = days.length === 1;
  const slots = slotsFor(appointments.map(({ at }) => new Date(at)));
  const showsToday = days.some((day) => sameDay(day, now));
  const nowSlot = showsToday ? slotOf(now) : null;

  // Each day's appointments, by the row they start in.
  const bySlot = new Map<string, Appointment[]>();
  for (const appointment of appointments) {
    const at = new Date(appointment.at);
    const key = `${at.toDateString()} ${slotOf(at)}`;
    bySlot.set(key, [...(bySlot.get(key) ?? []), appointment]);
  }

  // Opens on the current time today, or else the first appointment.
  const scrollTo = nowSlot ?? (appointments[0] ? slotOf(new Date(appointments[0].at)) : null);
  const scroller = useRef<HTMLDivElement>(null);
  const rangeKey = days[0]?.toDateString();
  useLayoutEffect(() => {
    const container = scroller.current;
    const row = container?.querySelector<HTMLElement>(`[data-slot-start="${scrollTo}"]`);
    const header = container?.querySelector("thead");
    if (container && row) container.scrollTop = row.offsetTop - (header?.offsetHeight ?? 0);
  }, [rangeKey, scrollTo]);

  return (
    <div ref={scroller} className="max-h-[42rem] overflow-auto rounded-xl border bg-card">
      <table className={cn("w-full table-fixed border-collapse", !single && "min-w-[60rem]")}>
        <caption className="sr-only">
          {single ? `Appointments on ${longDay.format(days[0] ?? now)}` : "Appointments this week"}
        </caption>
        <thead className="sticky top-0 z-10 bg-card">
          <tr className="border-b">
            <th
              scope="col"
              className="sticky left-0 w-24 bg-card px-3 py-4 text-left align-top type-body-sm-regular text-fg-caption uppercase sm:w-34 sm:px-4"
            >
              Time
            </th>
            {single ? (
              <th
                scope="col"
                className="border-l px-4 py-4 text-left align-top type-body-sm-regular text-fg-caption uppercase"
              >
                <span className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  Front desk appointments
                  <span className="type-body-sm-regular normal-case">
                    Up to {SLOT_CAPACITY} per {SLOT_MINUTES}-min slot
                  </span>
                </span>
              </th>
            ) : (
              days.map((day) => (
                <WeekdayHeader
                  key={day.toDateString()}
                  day={day}
                  today={sameDay(day, now)}
                  booked={appointments.filter(({ at }) => sameDay(new Date(at), day)).length}
                />
              ))
            )}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot} data-slot-start={slot} className="border-b last:border-b-0">
              <th
                scope="row"
                className="sticky left-0 bg-card px-3 py-4 text-left align-top type-body-sm-regular font-normal whitespace-nowrap text-fg-caption sm:px-4"
              >
                {formatClockTime(atMinute(now, slot))}
                {slot === nowSlot && (
                  <span className="mt-1 block type-body-sm-regular text-primary">NOW</span>
                )}
              </th>
              {days.map((day) => {
                const start = atMinute(day, slot);
                return (
                  <SlotCell
                    key={day.toDateString()}
                    appointments={bySlot.get(`${day.toDateString()} ${slot}`) ?? []}
                    detailed={single}
                    canAdd={start > now}
                    addLabel={`Book ${longDay.format(day)} at ${formatClockTime(start)}`}
                    onAdd={() => onAdd(start)}
                    onOpen={onOpen}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WeekdayHeader({ day, today, booked }: { day: Date; today: boolean; booked: number }) {
  return (
    <th
      scope="col"
      aria-current={today ? "date" : undefined}
      className={cn(
        "border-l px-4 py-4 text-left align-top font-normal",
        today ? "bg-info-100 text-info-500" : "text-fg-caption",
      )}
    >
      <span className="sr-only">{longDay.format(day)}</span>
      <span aria-hidden className="flex flex-col gap-1">
        <span className="type-body-sm-regular uppercase">{weekday.format(day)}</span>
        <span className="type-h4">{day.getDate()}</span>
      </span>
      <span className="mt-1 block type-caption">{booked} Booked</span>
    </th>
  );
}

function SlotCell({
  appointments,
  detailed,
  canAdd,
  addLabel,
  onAdd,
  onOpen,
}: {
  appointments: Appointment[];
  detailed: boolean;
  canAdd: boolean;
  addLabel: string;
  onAdd: () => void;
  onOpen: (appointment: Appointment) => void;
}) {
  return (
    <td className="group h-20 border-l p-3 align-top">
      <div
        className={cn("flex flex-col items-start gap-2", detailed && "sm:flex-row sm:flex-wrap")}
      >
        {appointments.map((appointment) => (
          <AppointmentChip
            key={appointment.id}
            appointment={appointment}
            onOpen={onOpen}
            className={cn(detailed && "sm:w-auto sm:max-w-80 sm:min-w-56")}
          >
            <span className="truncate type-body-sm-tight-semibold">{appointment.patient.name}</span>
            {detailed && (
              <span className="truncate type-body-sm-regular">
                {appointmentStatusLabels[appointment.status]} · {appointment.reason}
              </span>
            )}
          </AppointmentChip>
        ))}
        {canAdd && (
          <Button
            variant="outline"
            size="sm"
            aria-label={addLabel}
            onClick={onAdd}
            className="h-9 gap-1.5 bg-card px-3 type-body-sm-medium text-fg-heading opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:hidden"
          >
            <PlusIcon data-icon="inline-start" />
            Add
          </Button>
        )}
      </div>
    </td>
  );
}
