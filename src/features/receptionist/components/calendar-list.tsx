import { CaretRightIcon } from "@phosphor-icons/react";
import { CopyHinButton } from "@/components/copy-hin-button";
import {
  appointmentStatusLabels,
  type CalendarAppointment,
  sexLabels,
} from "@/features/receptionist/api/schemas";
import { StatusTag } from "@/features/receptionist/components/status-tag";
import { sameDay } from "@/features/receptionist/lib/calendar";
import { ageOn, formatClockTime, formatHin, formatLongDate } from "@/lib/format";
import { cn } from "@/lib/utils";

// The header and every row share these, so the columns line up. On narrow cards the HIN moves
// under the patient's name and the reason is left to the details dialog.
const columns = {
  time: "w-20 shrink-0",
  patient: "min-w-0 flex-1",
  hin: "hidden w-44 shrink-0 @md:flex",
  reason: "hidden w-[28%] shrink-0 @2xl:block",
  status: "w-28 shrink-0",
  chevron: "w-4 shrink-0",
};

/** The list view: the month's appointments under a heading for each day that has any. */
export function CalendarList({
  appointments,
  now,
  emptyMessage,
  onOpen,
}: {
  appointments: CalendarAppointment[];
  now: Date;
  emptyMessage: string;
  onOpen: (appointment: CalendarAppointment) => void;
}) {
  const days: { day: Date; items: CalendarAppointment[] }[] = [];
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
            className="@container overflow-hidden rounded-xl border bg-card"
          >
            <header className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
              <h2 className={cn("type-h5", today && "text-info-500")}>
                {today ? "Today · " : ""}
                {formatLongDate(day)}
              </h2>
              <span className="type-caption text-fg-caption">{items.length} Booked</span>
            </header>
            {/* Each row reads in full on its own, so the headings are for sighted scanning only. */}
            <div
              aria-hidden
              className="hidden items-center gap-3 border-b bg-muted px-5 py-2.5 type-caption text-fg-caption @md:flex"
            >
              <span className={columns.time}>Time</span>
              <span className={columns.patient}>Patient</span>
              <span className={columns.hin}>HIN</span>
              <span className={columns.reason}>Reason</span>
              <span className={columns.status}>Status</span>
              <span className={columns.chevron} />
            </div>
            <ul>
              {items.map((appointment) => (
                <Row
                  key={appointment.id}
                  appointment={appointment}
                  now={now}
                  onOpen={() => onOpen(appointment)}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function Row({
  appointment,
  now,
  onOpen,
}: {
  appointment: CalendarAppointment;
  now: Date;
  onOpen: () => void;
}) {
  const { patient, status, reason } = appointment;
  const time = formatClockTime(new Date(appointment.at));
  const hin = formatHin(patient.hin);
  const details = [
    `${ageOn(new Date(`${patient.dateOfBirth}T00:00`), now)} yrs`,
    patient.sex === "prefer_not_to_say" ? null : sexLabels[patient.sex],
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    // The patient's name is the row's button, stretched over the whole row; the copy button sits
    // above it so it can be clicked on its own.
    <li className="relative flex items-center gap-3 border-b px-5 py-3.5 type-body-sm-regular transition-colors last:border-b-0 hover:bg-muted">
      <span className={cn(columns.time, "text-fg-heading")}>{time}</span>
      <span className={cn(columns.patient, "flex flex-col")}>
        <button
          type="button"
          onClick={onOpen}
          aria-label={`${patient.name}, ${time}, ${appointmentStatusLabels[status]}`}
          className={cn(
            "truncate text-left text-fg-heading outline-none",
            "before:absolute before:inset-0 focus-visible:before:ring-2 focus-visible:before:ring-ring focus-visible:before:ring-inset",
            status === "cancelled" && "line-through",
          )}
        >
          {patient.name}
        </button>
        <span className="truncate text-fg-caption">{details}</span>
        <span className="truncate text-fg-caption @md:hidden">HIN {hin}</span>
      </span>
      <span className={cn(columns.hin, "items-center gap-1 text-fg-heading")}>
        {hin}
        <span className="relative">
          <CopyHinButton hin={hin} failureMessage="Couldn’t copy. Write the HIN down instead." />
        </span>
      </span>
      <span className={cn(columns.reason, "truncate text-fg-caption")}>{reason}</span>
      <span className={columns.status}>
        <StatusTag status={status} className="inline-block" />
      </span>
      <CaretRightIcon aria-hidden className={cn(columns.chevron, "size-4 text-fg-caption")} />
    </li>
  );
}
