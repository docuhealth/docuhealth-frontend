import {
  CalendarBlankIcon,
  CalendarDotsIcon,
  CalendarXIcon,
  CaretLeftIcon,
  CaretRightIcon,
  PlusIcon,
  UserCheckIcon,
} from "@phosphor-icons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { StatCard, StatGrid } from "@/components/dashboard/stat-card";
import { Trend } from "@/components/dashboard/trend";
import { Button } from "@/components/ui/button";
import { appointmentCalendarQuery } from "@/features/receptionist/api/queries";
import type { AppointmentCalendar } from "@/features/receptionist/api/schemas";
import { AppointmentDetailsDialog } from "@/features/receptionist/components/appointment-details-dialog";
import { BookAppointmentDialog } from "@/features/receptionist/components/book-appointment-dialog";
import { CalendarList } from "@/features/receptionist/components/calendar-list";
import { CalendarMonth } from "@/features/receptionist/components/calendar-month";
import { CalendarTimeGrid } from "@/features/receptionist/components/calendar-time-grid";
import {
  type CalendarView,
  calendarViewLabels,
  daysBetween,
  formatMonth,
  formatWeekRange,
  minuteOfDay,
  rangeFor,
  slotTime,
  step,
} from "@/features/receptionist/lib/calendar";
import { useNow } from "@/hooks/use-now";
import { toIsoDate } from "@/lib/date-input";
import { formatLongDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const views = Object.keys(calendarViewLabels) as CalendarView[];

/** What a view's numbers cover, and what they're compared with. */
const spans = {
  day: { noun: "day", since: "yesterday", slots: "daily" },
  week: { noun: "week", since: "last week", slots: "weekly" },
  month: { noun: "month", since: "last month", slots: "monthly" },
  list: { noun: "month", since: "last month", slots: "monthly" },
} as const satisfies Record<CalendarView, { noun: string; since: string; slots: string }>;

/**
 * The front desk's appointments as a day, week or month calendar, or a list, around `date`:
 * that span's numbers, then its appointments. Booking starts from "New Appointment" or a
 * free slot's "Add".
 */
export function AppointmentsCalendar({
  view,
  date,
  onNavigate,
}: {
  view: CalendarView;
  date: Date;
  /** Moves the calendar; a `date` of `null` means today. */
  onNavigate: (to: { view?: CalendarView; date?: Date | null }) => void;
}) {
  const range = rangeFor(view, date);
  const { data } = useSuspenseQuery(
    appointmentCalendarQuery(range.from.toISOString(), range.to.toISOString()),
  );
  const now = useNow();
  const [booking, setBooking] = useState<{ slot?: { date: string; time: string } } | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const openAppointment = ({ id }: { id: string }) => setOpenId(id);

  const subtitle =
    view === "day"
      ? formatLongDate(date)
      : view === "week"
        ? formatWeekRange(range.from)
        : formatMonth(date);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="type-h4">Appointments</h1>
          <p aria-live="polite" className="type-body-sm-regular text-fg-caption">
            {subtitle}
          </p>
        </div>

        <div className="flex w-full flex-wrap gap-4 sm:w-auto">
          <div className="flex h-12 items-center rounded-lg border bg-card px-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Previous ${spans[view].noun}`}
              onClick={() => onNavigate({ date: step(view, date, -1) })}
            >
              <CaretLeftIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              className="px-2 type-heading-sm text-fg-heading"
              onClick={() => onNavigate({ date: null })}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Next ${spans[view].noun}`}
              onClick={() => onNavigate({ date: step(view, date, 1) })}
            >
              <CaretRightIcon className="size-4" />
            </Button>
          </div>

          <fieldset className="flex h-12 flex-1 items-center rounded-lg border bg-card p-1 sm:flex-none">
            <legend className="sr-only">View</legend>
            {views.map((option, index) => {
              const active = option === view;
              const previousActive = views[index - 1] === view;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onNavigate({ view: option })}
                  className={cn(
                    "relative h-full flex-1 rounded-md px-4 type-body-sm-regular transition-colors sm:flex-none",
                    active ? "bg-line text-fg-heading" : "text-fg-caption hover:text-fg-heading",
                    // A short rule between two buttons, unless one of them is the active one.
                    index > 0 &&
                      !active &&
                      !previousActive &&
                      "before:absolute before:inset-y-3 before:left-0 before:w-px before:bg-line",
                  )}
                >
                  {calendarViewLabels[option]}
                </button>
              );
            })}
          </fieldset>

          <Button
            className="h-12 w-full gap-2 px-4 type-heading-sm has-data-[icon=inline-start]:pl-4 sm:w-auto"
            onClick={() => setBooking({})}
          >
            <PlusIcon data-icon="inline-start" />
            New Appointment
          </Button>
        </div>
      </div>

      <Summary summary={data.summary} view={view} />

      {view === "day" || view === "week" ? (
        <CalendarTimeGrid
          days={daysBetween(range.from, range.to)}
          appointments={data.items}
          now={now}
          onAdd={(at) =>
            setBooking({ slot: { date: toIsoDate(at), time: slotTime(minuteOfDay(at)) } })
          }
          onOpen={openAppointment}
        />
      ) : view === "month" ? (
        <CalendarMonth
          month={date}
          appointments={data.items}
          now={now}
          onOpenDay={(day) => onNavigate({ view: "day", date: day })}
          onOpenAppointment={openAppointment}
        />
      ) : (
        <CalendarList
          appointments={data.items}
          now={now}
          emptyMessage={`No appointments in ${formatMonth(date)}.`}
          onOpen={openAppointment}
        />
      )}

      <BookAppointmentDialog
        slot={booking?.slot}
        open={booking !== null}
        onOpenChange={(open) => !open && setBooking(null)}
      />
      <AppointmentDetailsDialog appointmentId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

function Summary({
  summary,
  view,
}: {
  summary: AppointmentCalendar["summary"];
  view: CalendarView;
}) {
  const { noun, since, slots } = spans[view];
  const { cancelledChange } = summary;

  return (
    <StatGrid aria-label="Summary" className="gap-3">
      <StatCard
        icon={<CalendarBlankIcon />}
        label={`Booked this ${noun}`}
        value={summary.booked.toLocaleString("en-GB")}
        note={<Trend change={summary.bookedChange} since={since} />}
      />
      <StatCard
        icon={<UserCheckIcon />}
        label="Checked in"
        value={summary.checkedIn.toLocaleString("en-GB")}
        note={`${summary.checkedIn} of ${summary.booked} appointments`}
      />
      <StatCard
        icon={<CalendarXIcon />}
        label="Cancelled"
        value={summary.cancelled.toLocaleString("en-GB")}
        note={
          cancelledChange === 0 ? (
            `Same as ${since}`
          ) : (
            // Fewer cancellations is the good news here.
            <Trend
              change={cancelledChange}
              since={since}
              goodWhen="down"
              amount={`${Math.abs(cancelledChange)} ${cancelledChange < 0 ? "fewer" : "more"}`}
            />
          )
        }
      />
      <StatCard
        icon={<CalendarDotsIcon />}
        label="Open slots left"
        value={summary.openSlots.toLocaleString("en-GB")}
        note={`Of ${summary.totalSlots.toLocaleString("en-GB")} ${slots} slots`}
      />
    </StatGrid>
  );
}
