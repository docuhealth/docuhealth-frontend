import type {
  AppointmentDetail,
  AppointmentExtras,
  Reminder,
} from "@/features/patient/api/pending-appointments";
import type { Appointment } from "@/features/patient/api/schemas";
import { formatDay, formatDayMonth, formatShortDayTime, formatTime } from "@/lib/format";

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

/** An appointment as the patient's appointment screens show it: the API's, plus its extras. */
export type AppointmentView = {
  id: string;
  status: AppointmentStatus;
  at: string;
  /** "Follow-up". */
  type: string | null;
  /** The booking's note: the reason for the visit, in the patient's words. */
  note: string | null;
  cancellationReason: string | null;
  rescheduleReason: string | null;
  department: string | null;
  /** What it's for, e.g. "Eye check". */
  reason: string | null;
  clinician: {
    name: string;
    specialty: string | null;
    role: string | null;
    photo: string | null;
  } | null;
  facility: string | null;
  /** The hospital's sqid. */
  facilityId: string | null;
  /** "ABC Hospital, Ikeja". */
  facilityLabel: string | null;
  facilityAddress: string | null;
  facilityPhoto: string | null;
  clinic: string | null;
  minutes: number | null;
  fee: number | null;
  reminders: Reminder[];
  cancellation: AppointmentDetail["cancellation"];
};

/** The API's appointments, each with its extra details, soonest first. */
export function mergeAppointments(
  appointments: Appointment[],
  extras: AppointmentExtras,
): AppointmentView[] {
  const details = new Map(extras.details.map((detail) => [detail.appointmentId, detail]));
  return appointments
    .map((appointment) => {
      const detail = details.get(appointment.id);
      const facilityLabel = appointment.facility
        ? [appointment.facility, detail?.facilityArea].filter(Boolean).join(", ")
        : null;
      return {
        id: appointment.id,
        // TODO(api): an appointment without a status is taken as waiting for the facility.
        status: appointment.status ?? "pending",
        at: appointment.at,
        type: appointment.type,
        note: appointment.note,
        cancellationReason: appointment.cancellationReason,
        rescheduleReason: appointment.rescheduleReason,
        department: detail?.department ?? null,
        reason: detail?.reason ?? null,
        clinician: appointment.clinician && {
          ...appointment.clinician,
          role: detail?.clinicianRole ?? null,
          photo: detail?.clinicianPhoto ?? null,
        },
        facility: appointment.facility,
        facilityId: appointment.facilityId,
        facilityLabel,
        facilityAddress: detail?.facilityAddress ?? null,
        facilityPhoto: detail?.facilityPhoto ?? null,
        clinic: detail?.clinic ?? null,
        minutes: detail?.minutes ?? null,
        fee: detail?.fee ?? null,
        reminders: detail?.reminders ?? [],
        cancellation: detail?.cancellation ?? null,
      } satisfies AppointmentView;
    })
    .sort((a, b) => a.at.localeCompare(b.at));
}

/** A just-booked appointment, from what the booking said, until the list has it. */
export function bookedView(booked: {
  id: string | null;
  at: string;
  facility: string | null;
  facilityId: string | null;
}): AppointmentView {
  return {
    id: booked.id ?? "",
    status: "pending",
    at: booked.at,
    type: null,
    note: null,
    cancellationReason: null,
    rescheduleReason: null,
    department: null,
    reason: null,
    clinician: null,
    facility: booked.facility,
    facilityId: booked.facilityId,
    facilityLabel: booked.facility,
    facilityAddress: null,
    facilityPhoto: null,
    clinic: null,
    minutes: null,
    fee: null,
    reminders: [],
    cancellation: null,
  };
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/**
 * Upcoming: still to come (today's count all day), soonest first. Past: cancelled, completed or
 * gone, the latest first.
 */
export function splitAppointments(list: AppointmentView[], now = new Date()) {
  const today = startOfDay(now).getTime();
  const isPast = (appointment: AppointmentView) =>
    appointment.status === "cancelled" ||
    appointment.status === "completed" ||
    new Date(appointment.at).getTime() < today;
  return {
    upcoming: list.filter((appointment) => !isPast(appointment)),
    past: list.filter(isPast).reverse(),
  };
}

/** Whether the patient can still change it: upcoming, and not cancelled or done. */
export const isOpen = (appointment: AppointmentView, now = new Date()) =>
  splitAppointments([appointment], now).upcoming.length > 0;

/** Who it's with, or which clinic when no one is assigned yet: "Ophthalmology clinic". */
export function appointmentTitle(appointment: AppointmentView) {
  if (appointment.clinician) return appointment.clinician.name;
  if (appointment.department) return `${appointment.department} clinic`;
  return appointment.type ?? "Appointment";
}

/** "Internal Medicine · ABC Hospital, Ikeja", or with no clinician "Eye check · Reddington…". */
export function appointmentLine(appointment: AppointmentView) {
  const what = appointment.clinician
    ? (appointment.clinician.specialty ?? appointment.department)
    : (appointment.reason ?? appointment.type);
  return [what, appointment.facilityLabel].filter(Boolean).join(" · ");
}

/** "Follow-up · Internal Medicine" (or "Follow-up · Ophthalmology clinic" with no clinician). */
export function visitLine(appointment: AppointmentView) {
  const where = appointment.clinician
    ? (appointment.department ?? appointment.clinician.specialty)
    : appointment.department && `${appointment.department} clinic`;
  return [appointment.type ?? appointment.reason, where].filter(Boolean).join(" · ") || null;
}

/** "ABC Hospital, Ikeja · Clinic 3". */
export function placeLine(appointment: AppointmentView) {
  return [appointment.facilityLabel, appointment.clinic].filter(Boolean).join(" · ") || null;
}

const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short" });
const monthYear = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

/** "Today · 10:00 AM", "Tomorrow · …", "Thu · 2:30 PM" this week, else "22 Oct · 2:30 PM". */
export function whenLabel(at: string, now = new Date()) {
  const date = new Date(at);
  const days = Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / 86_400_000);
  const day =
    days === 0
      ? "Today"
      : days === 1
        ? "Tomorrow"
        : days > 1 && days < 7
          ? weekday.format(date)
          : formatDayMonth(date);
  return `${day} · ${formatTime(date)}`;
}

/** The calendar tile's month and day: { month: "OCT", day: "22" }. */
export function dateBlock(at: string) {
  const date = new Date(at);
  const month = formatDayMonth(date).split(" ")[1] ?? "";
  return { month: month.toUpperCase(), day: String(date.getDate()) };
}

/** "Tue, 6 Oct 2026". */
export const longDate = (at: string) =>
  `${weekday.format(new Date(at))}, ${formatDay(new Date(at))}`;

/** "Thu, 22 Oct". */
export const shortDate = (at: string) =>
  `${weekday.format(new Date(at))}, ${formatDayMonth(new Date(at))}`;

/** "10:30 AM · 30 min". */
export function timeLine(appointment: Pick<AppointmentView, "at" | "minutes">) {
  const time = formatTime(new Date(appointment.at));
  return appointment.minutes ? `${time} · ${appointment.minutes} min` : time;
}

/** "Thu 22 Oct · 10:00 AM". */
export const dayAndTime = (at: string) => formatShortDayTime(new Date(at)).replace(", ", " · ");

/** "We'll remind you 1 day before by push and SMS, and 2 hours before by push." */
export function remindersSentence(reminders: Reminder[]) {
  if (reminders.length === 0) return null;
  const parts = reminders.map(
    (reminder) =>
      `${reminder.before} by ${reminder.channels.replace(/\b[A-Z][a-z]+/g, (word) => word.toLowerCase())}`,
  );
  const list =
    parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")}, and ${parts.at(-1)}`;
  return `We’ll remind you ${list}.`;
}

/** Search across who, where and what: every word must match. */
export function matchesSearch(appointment: AppointmentView, query: string) {
  const haystack = [
    appointmentTitle(appointment),
    appointment.clinician?.specialty,
    appointment.facility,
    appointment.department,
    appointment.reason,
    appointment.type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

// The booking calendar.

/** A day as the API's slots take it: "2026-10-06", in local time. */
export function dayKey(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The Sunday that starts `date`'s week, at midnight. */
export function startOfWeek(date: Date) {
  const start = startOfDay(date);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

/** The seven days from `start`. */
export function weekDays(start: Date) {
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

/** "October 2026": the month most of the week is in. */
export const weekMonth = (start: Date) => {
  const middle = new Date(start);
  middle.setDate(start.getDate() + 3);
  return monthYear.format(middle);
};

/** Free times ("HH:MM") as morning (before noon) and afternoon. */
export function splitSlots(times: string[]) {
  const sorted = [...times].sort();
  return {
    morning: sorted.filter((time) => time < "12:00"),
    afternoon: sorted.filter((time) => time >= "12:00"),
  };
}

/** A day and a time ("HH:MM") as one Date. */
export function atTime(day: Date, time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes);
}

/** "10:30 AM" for "10:30". */
export const slotLabel = (time: string) => formatTime(atTime(new Date(), time));

/** "Tue 6 Oct, 10:30 AM": the booking's confirm button. */
export const confirmLabel = (at: Date) => formatShortDayTime(at);

/** Why the patient is cancelling, as the cancel dialog offers it. */
export const cancelReasons = {
  better: "I feel better",
  time: "I can’t make that time",
  mistake: "I booked by mistake",
  other: "Other reason",
} as const;
export type CancelReason = keyof typeof cancelReasons;
