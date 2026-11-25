import { ArrowRightIcon, CaretLeftIcon, CaretRightIcon, ClockIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { slotsQuery } from "@/features/patient/api/pending-appointments";
import { AppointmentConflictBanner } from "@/features/patient/components/appointment-conflict-banner";
import {
  atTime,
  confirmLabel,
  dayKey,
  slotLabel,
  splitSlots,
  startOfWeek,
  weekDays,
  weekMonth,
} from "@/features/patient/lib/appointments";
import { cn } from "@/lib/utils";

const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short" });

const chip =
  "rounded-md border bg-card transition-colors hover:border-primary/40 disabled:pointer-events-none disabled:opacity-40";
const chosen = "border-primary bg-brand-50 text-primary";

/**
 * Booking, step 2 of 3 (or the only step when rescheduling): a week of days, the facility's free
 * times on the chosen one, and a button that books it. `conflict` is the time someone else just
 * took, if they did.
 */
export function BookingTimeStep({
  facility,
  title,
  description,
  progress,
  pending,
  conflict,
  onBack,
  onSubmit,
}: {
  /** The facility whose free times to show. */
  facility: string;
  title: string;
  description: string;
  progress?: { step: number; total: number };
  pending: boolean;
  conflict: string | null;
  onBack?: () => void;
  onSubmit: (at: Date) => void;
}) {
  const [today] = useState(() => new Date(new Date().setHours(0, 0, 0, 0)));
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [day, setDay] = useState(today);
  const [time, setTime] = useState<string | null>(null);
  const slots = useQuery(slotsQuery(facility, dayKey(day)));
  const { morning, afternoon } = splitSlots(slots.data ?? []);
  const picked = time ? atTime(day, time) : null;

  const moveWeek = (weeks: number) => {
    const start = new Date(weekStart);
    start.setDate(start.getDate() + weeks * 7);
    setWeekStart(start);
    // The first day of the new week that can be booked.
    setDay(weekDays(start).find((each) => each >= today) ?? start);
    setTime(null);
  };

  const times = (label: string, list: string[]) =>
    list.length > 0 && (
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 flex items-center gap-1.5 type-body-sm-medium text-fg-heading">
          <ClockIcon aria-hidden className="size-4" />
          {label}
        </legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {list.map((slot) => (
            <button
              key={slot}
              type="button"
              aria-pressed={slot === time}
              onClick={() => setTime(slot)}
              className={cn(chip, "h-10 type-body-sm-regular", slot === time && chosen)}
            >
              {slotLabel(slot)}
            </button>
          ))}
        </div>
      </fieldset>
    );

  return (
    <>
      <FormDialogHeader title={title} description={description} progress={progress} />
      <FormDialogBody minHeight="24rem">
        {conflict && <AppointmentConflictBanner time={conflict} />}
        <div className="flex items-center justify-between gap-3">
          <p className="flex gap-1 type-body-sm-medium text-fg-heading">
            {weekMonth(weekStart)} <RequiredMark />
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Previous week"
              disabled={weekStart <= startOfWeek(today)}
              onClick={() => moveWeek(-1)}
            >
              <CaretLeftIcon />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Next week"
              onClick={() => moveWeek(1)}
            >
              <CaretRightIcon />
            </Button>
          </div>
        </div>

        <fieldset className="grid grid-cols-7 gap-1.5 sm:gap-2">
          <legend className="sr-only">Day</legend>
          {weekDays(weekStart).map((each) => {
            const selected = dayKey(each) === dayKey(day);
            return (
              <button
                key={dayKey(each)}
                type="button"
                aria-pressed={selected}
                aria-label={each.toDateString()}
                disabled={each < today}
                onClick={() => {
                  setDay(each);
                  setTime(null);
                }}
                className={cn(chip, "flex flex-col items-center gap-0.5 py-2", selected && chosen)}
              >
                <span className="type-caption uppercase">{weekday.format(each)}</span>
                <span className="type-accent-h3">{each.getDate()}</span>
              </button>
            );
          })}
        </fieldset>

        {slots.isPending ? (
          <p className="type-body-sm-regular text-fg-caption">Finding free times…</p>
        ) : morning.length + afternoon.length === 0 ? (
          <p className="rounded-md bg-surface px-4 py-6 text-center type-body-sm-regular text-fg-caption">
            No free times on this day. Try another day.
          </p>
        ) : (
          <>
            {times("Morning", morning)}
            {times("Afternoon", afternoon)}
          </>
        )}
      </FormDialogBody>
      <FormDialogFooter onBack={onBack} backLabel="Back" closeLabel="Cancel">
        <Button
          type="button"
          disabled={!picked}
          loading={pending}
          onClick={() => picked && onSubmit(picked)}
          className="h-11 px-5 type-heading-sm"
        >
          {picked ? `Confirm ${confirmLabel(picked)}` : "Pick a time"}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </FormDialogFooter>
    </>
  );
}
