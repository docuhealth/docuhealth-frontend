// Text typed into the date and time fields, and the values forms keep: "YYYY-MM-DD" and
// "HH:MM" (24-hour), the same shapes as the native inputs give.

const pad = (n: number) => String(n).padStart(2, "0");

/** `date`'s day in local time, as "YYYY-MM-DD". */
export function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Local midnight on an "YYYY-MM-DD" day. */
export function fromIsoDate(iso: string) {
  const [year = 0, month = 1, day = 1] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Typed digits grouped as a date: "1411202" → "14/11/202". */
export function maskDate(text: string) {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join("/");
}

/** "14/11/2026" → "2026-11-14"; "" until it's a whole, real date (no 31/02). */
export function parseDate(text: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!match) return "";
  const [, day, month, year] = match.map(Number) as [number, number, number, number];
  const date = new Date(year, month - 1, day);
  const real = date.getFullYear() === year && date.getMonth() === month - 1;
  return real && date.getDate() === day ? toIsoDate(date) : "";
}

/** "2026-11-14" → "14/11/2026". */
export function dateText(iso: string) {
  const [year, month, day] = iso.split("-");
  return iso ? `${day}/${month}/${year}` : "";
}

/** Typed digits grouped as a time: "103" → "10:3". */
export function maskTime(text: string) {
  const digits = text.replace(/\D/g, "").slice(0, 4);
  return [digits.slice(0, 2), digits.slice(2)].filter(Boolean).join(":");
}

/** "10:30" back as it is once it's a real 24-hour time, otherwise "". */
export function parseTime(text: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(text);
  return match && Number(match[1]) < 24 && Number(match[2]) < 60 ? text : "";
}
