import { z } from "zod";
import { fromIsoDate, toIsoDate } from "@/lib/date-input";

// Date maths for the Appointments calendar. Everything is in local time; weeks start on Sunday.

export const calendarViewLabels = {
  day: "Day",
  week: "Week",
  month: "Month",
  list: "List",
} as const;
export type CalendarView = keyof typeof calendarViewLabels;
export const calendarViewSchema = z.enum(
  Object.keys(calendarViewLabels) as [CalendarView, ...CalendarView[]],
);

/** The calendar's minutes per row in the day and week views. */
export const SLOT_MINUTES = 30;

/** How many appointments the front desk books into one slot at most. */
export const SLOT_CAPACITY = 3;

/** The rows a day and week view always show, 08:00 to 17:30; appointments outside add rows. */
const OPENING_HOUR = 8;
const CLOSING_HOUR = 18;

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  return addDays(date, -date.getDay());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

/** The same day `months` later, kept inside shorter months: 31 Jan + 1 → 28/29 Feb. */
export function addMonths(date: Date, months: number) {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}

/** The first day shown and the day after the last, for `view` around `date`. */
export function rangeFor(view: CalendarView, date: Date) {
  if (view === "day") return { from: startOfDay(date), to: addDays(date, 1) };
  if (view === "week") {
    const from = startOfWeek(date);
    return { from, to: addDays(from, 7) };
  }
  const first = startOfMonth(date);
  return { from: first, to: addMonths(first, 1) };
}

/** `date` one day, week or month (for the month and list views) earlier or later. */
export function step(view: CalendarView, date: Date, direction: 1 | -1) {
  if (view === "day") return addDays(date, direction);
  if (view === "week") return addDays(date, 7 * direction);
  return addMonths(date, direction);
}

/** Every day in [from, to). */
export function daysBetween(from: Date, to: Date) {
  const days: Date[] = [];
  for (let day = startOfDay(from); day < to; day = addDays(day, 1)) days.push(day);
  return days;
}

/** The month view's days: whole weeks, Sunday first, covering the month `date` is in. */
export function monthGrid(date: Date) {
  const first = startOfMonth(date);
  const last = addDays(addMonths(first, 1), -1);
  return daysBetween(startOfWeek(first), addDays(startOfWeek(last), 7));
}

/** Minutes since midnight. */
export function minuteOfDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

/** The start (in minutes since midnight) of the row `date` falls in. */
export function slotOf(date: Date) {
  return Math.floor(minuteOfDay(date) / SLOT_MINUTES) * SLOT_MINUTES;
}

/**
 * Row starts, in minutes since midnight, from opening to closing time, stretched to take in
 * any of `times` that fall outside it.
 */
export function slotsFor(times: Date[]) {
  const starts = times.map(slotOf);
  const first = Math.min(OPENING_HOUR * 60, ...starts);
  const last = Math.max(CLOSING_HOUR * 60 - SLOT_MINUTES, ...starts);
  const slots: number[] = [];
  for (let minute = first; minute <= last; minute += SLOT_MINUTES) slots.push(minute);
  return slots;
}

/** `day` at `minutes` past midnight. */
export function atMinute(day: Date, minutes: number) {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minutes);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Minutes since midnight as the booking form's "HH:MM". */
export function slotTime(minutes: number) {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

/** The URL's `date` ("YYYY-MM-DD"), or today when it's missing or not a real day. */
export function parseCalendarDate(iso: string | undefined, today = new Date()) {
  if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const date = fromIsoDate(iso);
    if (toIsoDate(date) === iso) return date;
  }
  return startOfDay(today);
}

const monthYear = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
const dayOnly = new Intl.DateTimeFormat("en-GB", { day: "numeric" });
const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" });
const dayMonthYear = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** The span a week view shows: "4 – 10 October 2026", "27 September – 3 October 2026". */
export function formatWeekRange(from: Date) {
  const to = addDays(from, 6);
  if (from.getFullYear() !== to.getFullYear()) {
    return `${dayMonthYear.format(from)} – ${dayMonthYear.format(to)}`;
  }
  const start = from.getMonth() === to.getMonth() ? dayOnly.format(from) : dayMonth.format(from);
  return `${start} – ${dayMonthYear.format(to)}`;
}

/** e.g. "October 2026". */
export function formatMonth(date: Date) {
  return monthYear.format(date);
}
