import type { Vaccine, VaccineDose } from "@/features/patient/api/pending-immunizations";
import { formatDay, plural } from "@/lib/format";

// Working out the Immunization screens from the patient's vaccine records. TODO(api): the records
// come from api/pending-immunizations.ts (empty outside the mock dev server).

const DAY = 24 * 60 * 60_000;

const line = (...parts: (string | null | undefined | false)[]) => parts.filter(Boolean).join(" · ");

/** Vaccines with a dose due, the soonest first, and the completed ones in their order. */
export function splitVaccines(vaccines: Vaccine[]) {
  return {
    due: vaccines
      .filter((vaccine) => vaccine.due)
      .toSorted((a, b) => a.due!.at.localeCompare(b.due!.at)),
    completed: vaccines.filter((vaccine) => !vaccine.due),
  };
}

/** "From ABC Hospital, LUTH and 2 others": the facilities that gave the doses. */
export function sourcesLine(vaccines: Vaccine[]) {
  const names = [
    ...new Set(
      vaccines.flatMap((vaccine) => vaccine.doses.map((dose) => dose.facility)).filter(Boolean),
    ),
  ] as string[];
  if (!names.length) return null;
  if (names.length <= 2) return `From ${names.join(" and ")}`;
  const rest = names.length - 2;
  return `From ${names.slice(0, 2).join(", ")} and ${rest} ${rest === 1 ? "other" : "others"}`;
}

/** The newest dose with a date, if any. */
function lastGiven(vaccine: Vaccine) {
  return vaccine.doses.find((dose) => dose.at) ?? null;
}

/** "3 of 3 doses", "2 doses + booster", "1 dose". */
function dosesLabel(vaccine: Vaccine) {
  const primary = vaccine.doses
    .filter((dose) => dose.kind !== "booster")
    .reduce((total, dose) => total + dose.count, 0);
  const boosters = vaccine.doses.filter((dose) => dose.kind === "booster").length;
  const doses = vaccine.dosesTotal
    ? `${primary} of ${plural(vaccine.dosesTotal, "dose")}`
    : plural(primary, "dose");
  if (!boosters) return doses;
  return `${doses} + ${boosters === 1 ? "booster" : plural(boosters, "booster")}`;
}

/** A completed vaccine's row: "3 of 3 doses · Last 14 Jun 2024 · ABC Hospital". */
export function vaccineLine(vaccine: Vaccine) {
  const last = lastGiven(vaccine);
  const newest = vaccine.doses[0];
  return line(
    dosesLabel(vaccine),
    vaccine.lifelong
      ? "Lifelong"
      : last?.at
        ? `Last ${formatDay(new Date(last.at))}`
        : newest?.childhood && "Childhood",
    last?.facility ?? (newest?.fromCard ? "From your vaccine card" : null),
  );
}

/** When a due dose is: "In 10 weeks", "In 5 days", "In 3 months", "Due today" or "Overdue". */
export function dueIn(at: string, now = new Date()) {
  const days = Math.ceil((new Date(at).getTime() - now.getTime()) / DAY);
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  if (days < 14) return `In ${plural(days, "day")}`;
  if (days < 13 * 7) return `In ${Math.round(days / 7)} weeks`;
  return `In ${plural(Math.round(days / 30), "month")}`;
}

/** The tag beside a vaccine's name: Completed, Due soon or Overdue. */
export function vaccineStatus(vaccine: Vaccine, now = new Date()) {
  if (!vaccine.due) return { tone: "success" as const, label: "Completed" };
  return new Date(vaccine.due.at) < now
    ? { tone: "warning" as const, label: "Overdue" }
    : { tone: "warning" as const, label: "Due soon" };
}

/** "Booster · due by 12 Jan 2027". */
export function dueLine(due: NonNullable<Vaccine["due"]>) {
  return `${due.kind === "booster" ? "Booster" : "Next dose"} · due by ${formatDay(new Date(due.at))}`;
}

/** Under a due date: "Last booster 12 Jan 2017 · LUTH". */
export function lastDoseLine(vaccine: Vaccine) {
  const last = lastGiven(vaccine);
  if (!last?.at) return null;
  const what = last.kind === "booster" ? "Last booster" : "Last dose";
  return line(`${what} ${formatDay(new Date(last.at))}`, last.facility);
}

/** A completed vaccine's protection: "3 of 3 doses given", "1 dose given · Lifelong". */
export function protectionLine(vaccine: Vaccine) {
  return line(`${dosesLabel(vaccine)} given`, vaccine.lifelong && "Lifelong");
}

/** A dose's title: "Dose 3 · 14 Jun 2024", "Booster · 12 Jan 2017", "Primary series". */
export function doseTitle(dose: VaccineDose) {
  const what =
    dose.kind === "series"
      ? "Primary series"
      : dose.kind === "booster"
        ? "Booster"
        : dose.number
          ? `Dose ${dose.number}`
          : "Dose";
  return line(what, dose.at && formatDay(new Date(dose.at)));
}

/** A dose's line: "Engerix-B 20 mcg · ABC Hospital", "3 doses · Childhood · From your vaccine card". */
export function doseLine(dose: VaccineDose) {
  return (
    line(
      dose.kind === "series" && plural(dose.count, "dose"),
      dose.kind !== "series" && dose.brand,
      dose.childhood && "Childhood",
      dose.facility ?? (dose.fromCard && "From your vaccine card"),
    ) || null
  );
}

/** The newest dose given by a named person, for "Given by" and its batch. */
export function lastRecordedDose(vaccine: Vaccine) {
  return vaccine.doses.find((dose) => dose.givenBy || dose.batch) ?? null;
}
