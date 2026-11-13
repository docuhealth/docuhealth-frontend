/** "Good morning" / "Good afternoon" / "Good evening" for the hour of `date`. */
export function greetingFor(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "long" });
const dayMonthYear = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** e.g. "Wednesday, 14 October 2026". */
export function formatLongDate(date: Date) {
  return `${weekday.format(date)}, ${dayMonthYear.format(date)}`;
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "always" });

/** How long ago `date` was, in its largest whole unit: "3 days ago", "2 months ago". */
export function formatTimeAgo(date: Date, now = new Date()) {
  const minutes = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return relative.format(-minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return relative.format(-hours, "hour");
  const days = Math.floor(hours / 24);
  if (days < 30) return relative.format(-days, "day");
  const months = Math.floor(days / 30);
  if (months < 12) return relative.format(-months, "month");
  return relative.format(-Math.floor(days / 365), "year");
}

/** `formatTimeAgo` squeezed into a pill: "5m ago", "3h ago", "2d ago", "1w ago", "4mo ago". */
export function formatShortTimeAgo(date: Date, now = new Date()) {
  const minutes = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/** First letters of the first and last word: "Tunde Adeyemi" → "TA". */
export function initials(name: string) {
  const words = name.trim().split(/\s+/);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

const fullDate = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/** e.g. "02 Oct 2026". */
export function formatDate(date: Date) {
  return fullDate.format(date);
}

/** Whole years from `birth` to `on`. */
export function ageOn(birth: Date, on = new Date()) {
  const birthdayPassed =
    on.getMonth() > birth.getMonth() ||
    (on.getMonth() === birth.getMonth() && on.getDate() >= birth.getDate());
  return on.getFullYear() - birth.getFullYear() - (birthdayPassed ? 0 : 1);
}

const appointmentDay = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const appointmentTime = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

/** e.g. "22 Oct, 2026; 2:30 PM". */
export function formatAppointment(date: Date) {
  const day = appointmentDay.format(date).replace(/ (\d{4})$/, ", $1");
  return `${day}; ${appointmentTime.format(date)}`;
}

/** The name someone goes by, without a title: "Dr. Hauwa Garba" → "Hauwa". */
export function firstName(name: string) {
  return (
    name
      .replace(/^(Dr|Mr|Mrs|Ms|Prof)\.?\s+/i, "")
      .trim()
      .split(/\s+/)[0] ?? ""
  );
}

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

/** A date and time on two lines of a table cell: "Today" / "16 Oct 2026", then "6:30 PM". */
export function formatDayAndTime(date: Date, now = new Date()) {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const day = sameDay(date, now)
    ? "Today"
    : sameDay(date, yesterday)
      ? "Yesterday"
      : appointmentDay.format(date);
  return { day, time: appointmentTime.format(date) };
}

/** Which day of a stay it is: "Day 1" for the first 24 hours, then "Day 2" and so on. */
export function formatDayOfStay(since: Date, now = new Date()) {
  return `Day ${Math.floor(Math.max(0, now.getTime() - since.getTime()) / DAY) + 1}`;
}

/** How long something took, in its largest unit, rounded: "40 min", "1 hour", "4 Days". */
export function formatDuration(minutes: number) {
  const mins = Math.max(0, Math.round(minutes));
  if (mins < 60) return `${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? "Day" : "Days"}`;
}

/** Minutes from `from` to `to`. */
export function minutesBetween(from: Date, to: Date) {
  return (to.getTime() - from.getTime()) / MINUTE;
}

/** A HIN with all but its first five characters hidden, as patient lists show it. */
export function maskHin(hin: string) {
  return `${hin.slice(0, 5)} ••••`;
}

const clockTime = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" });

/** e.g. "09:30 AM". */
export function formatClockTime(date: Date) {
  return clockTime.format(date);
}

const dayMonth = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

/** e.g. "Thu 12 Nov". */
export function formatShortDay(date: Date) {
  return dayMonth.format(date);
}

/** How many digits a HIN has. */
export const HIN_DIGITS = 11;

/** Typed HIN digits grouped as the cards print them: "12334567890" → "123-345-678-90". */
export function formatHin(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, HIN_DIGITS);
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9), digits.slice(9)]
    .filter(Boolean)
    .join("-");
}

const twoDigitDay = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" });

/** e.g. "08 Oct, 2026". */
export function formatDateWithComma(date: Date) {
  return `${twoDigitDay.format(date)}, ${date.getFullYear()}`;
}

/** e.g. "08 Oct, 9:42 AM". */
export function formatDayMonthTime(date: Date) {
  return `${twoDigitDay.format(date)}, ${appointmentTime.format(date)}`;
}

/** e.g. "Tue 13 Oct, 2:00 PM". */
export function formatShortDayTime(date: Date) {
  return `${dayMonth.format(date)}, ${appointmentTime.format(date)}`;
}

/** e.g. "Friday, 9 October 2026 · 11:00 AM". */
export function formatLongDateTime(date: Date) {
  return `${formatLongDate(date)} · ${clockTime.format(date)}`;
}

/** e.g. "23 Dec 2025 · 3:45 PM". */
export function formatDateDotTime(date: Date) {
  return `${appointmentDay.format(date)} · ${appointmentTime.format(date)}`;
}

/** e.g. "3:45 PM". */
export function formatTime(date: Date) {
  return appointmentTime.format(date);
}

/** e.g. "15 Jul 2025, 12:45 PM". */
export function formatDateCommaTime(date: Date) {
  return `${appointmentDay.format(date)}, ${appointmentTime.format(date)}`;
}

/** e.g. "15 Jul 2025". */
export function formatDay(date: Date) {
  return appointmentDay.format(date);
}

/** A file's size in MB from 100 KB up, as the file lists show it: "0.4 MB", "2.5 MB", "24 MB". */
export function formatFileSize(bytes: number) {
  if (bytes < 100_000) return `${Math.max(1, Math.round(bytes / 1000))} KB`;
  const mb = bytes / 1_000_000;
  return `${mb < 10 ? Number(mb.toFixed(1)) : Math.round(mb)} MB`;
}
