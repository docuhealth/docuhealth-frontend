import { CalendarBlankIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { Button } from "@/components/ui/button";
import { AppointmentClinicianCard } from "@/features/patient/components/appointment-clinician-card";
import { AppointmentConflictBanner } from "@/features/patient/components/appointment-conflict-banner";
import { AppointmentFacts } from "@/features/patient/components/appointment-facts";
import { AppointmentNote } from "@/features/patient/components/appointment-note";
import { AppointmentStatusTag } from "@/features/patient/components/appointment-status-tag";
import { AppointmentWhereCard } from "@/features/patient/components/appointment-where-card";
import { BookDoctorBanner } from "@/features/patient/components/book-doctor-banner";
import { BookingDialog } from "@/features/patient/components/booking-dialog";
import { CancelAppointmentDialog } from "@/features/patient/components/cancel-appointment-dialog";
import { DateBlock } from "@/features/patient/components/date-block";
import { PageHeading } from "@/features/patient/components/page-heading";
import { PatientEmpty } from "@/features/patient/components/patient-empty";
import { SectionLabel } from "@/features/patient/components/patient-ui";
import {
  type AppointmentView,
  dayAndTime,
  isOpen,
  longDate,
  placeLine,
  remindersSentence,
  shortDate,
  timeLine,
  visitLine,
} from "@/features/patient/lib/appointments";
import { formatNaira } from "@/features/patient/lib/lab-results";
import { useAppointments } from "@/features/patient/lib/use-appointments";
import { formatDateDotTime } from "@/lib/format";

const headings = {
  confirmed: "Appointment confirmed",
  pending: "Appointment pending",
  cancelled: "Appointment cancelled",
  completed: "Appointment completed",
};

/** One appointment: when, who and where, and cancelling, rescheduling or booking again. */
export function AppointmentDetails({ appointmentId }: { appointmentId: string }) {
  const { data, isError } = useAppointments();
  const appointment = data?.find((each) => each.id === appointmentId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Appointment detail"
        back={{ to: "/patient/appointments", label: "Back to Appointments" }}
      />
      {!data && !isError ? (
        <ListSkeleton />
      ) : appointment ? (
        <AppointmentScreen appointment={appointment} />
      ) : (
        <PatientEmpty
          icon={<CalendarBlankIcon />}
          title="Appointment not found"
          description="It may have been removed. Your appointments are all on the Appointments page."
        />
      )}
    </div>
  );
}

function AppointmentScreen({ appointment }: { appointment: AppointmentView }) {
  const [dialog, setDialog] = useState<"cancel" | "reschedule" | "book" | null>(null);
  const [conflict, setConflict] = useState<string | null>(null);
  const open = isOpen(appointment);
  const visit = visitLine(appointment);
  const line = open
    ? [
        visit && `${visit}.`,
        appointment.facility &&
          `We’ll see you at ${appointment.facility} on ${shortDate(appointment.at)}.`,
      ]
        .filter(Boolean)
        .join(" ")
    : [visit, appointment.facilityLabel].filter(Boolean).join(" · ");

  return (
    <>
      <section
        aria-label={headings[appointment.status]}
        className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center"
      >
        <DateBlock at={appointment.at} status={appointment.status} size="lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="type-accent-h3 text-fg-heading">{headings[appointment.status]}</h2>
            <AppointmentStatusTag status={appointment.status} />
          </div>
          {line && <p className="type-body-sm-regular text-fg-body">{line}</p>}
        </div>
        <div className="flex gap-3 *:h-10 *:px-5 *:type-heading-sm">
          {open ? (
            <>
              <Button
                variant="outline"
                className="border-error-500/40 text-error-500 hover:bg-error-100 hover:text-error-700"
                onClick={() => setDialog("cancel")}
              >
                Cancel booking
              </Button>
              <Button
                onClick={() => {
                  setConflict(null);
                  setDialog("reschedule");
                }}
              >
                Reschedule
              </Button>
            </>
          ) : (
            <Button onClick={() => setDialog("book")}>Book again</Button>
          )}
        </div>
      </section>

      {conflict && <AppointmentConflictBanner time={conflict} />}

      {open ? (
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-2">
              <SectionLabel>Your clinician</SectionLabel>
              <AppointmentClinicianCard appointment={appointment} />
            </section>
            <section className="flex flex-col gap-2">
              <SectionLabel>Where</SectionLabel>
              <AppointmentWhereCard appointment={appointment} />
            </section>
          </div>
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-2">
              <SectionLabel>Details</SectionLabel>
              <AppointmentFacts
                label="Details"
                facts={[
                  ["Date", longDate(appointment.at)],
                  ["Time", timeLine(appointment)],
                  ["Visit", visit],
                  ["Facility", placeLine(appointment)],
                ]}
              />
            </section>
            {/* TODO(api): no reminders yet. */}
            {appointment.reminders.length > 0 && (
              <AppointmentNote tone="info" title="Reminders on">
                {remindersSentence(appointment.reminders)}
              </AppointmentNote>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-2">
              <SectionLabel>Summary</SectionLabel>
              <AppointmentFacts label="Summary" columns={2} facts={summaryOf(appointment)} />
            </section>
            {appointment.cancellation?.sentTo && (
              <AppointmentNote tone="success" title="Confirmation sent">
                We sent a confirmation by SMS to {appointment.cancellation.sentTo}.
              </AppointmentNote>
            )}
          </div>
          <div>
            <BookDoctorBanner onBook={() => setDialog("book")} />
          </div>
        </div>
      )}

      <CancelAppointmentDialog
        appointment={appointment}
        open={dialog === "cancel"}
        onOpenChange={(next) => !next && setDialog(null)}
      />
      <BookingDialog
        open={dialog === "reschedule" || dialog === "book"}
        onOpenChange={(next) => !next && setDialog(null)}
        reschedule={
          dialog === "reschedule"
            ? { id: appointment.id, facility: appointment.facility }
            : undefined
        }
        onConflict={dialog === "reschedule" ? setConflict : undefined}
      />
    </>
  );
}

/** A past or cancelled appointment's summary. TODO(api): no cancellation details yet. */
function summaryOf(appointment: AppointmentView): [string, string | null][] {
  const { cancellation } = appointment;
  const facts: [string, string | null][] = [
    ["Was booked for", dayAndTime(appointment.at)],
    ["Clinician", appointment.clinician?.name ?? null],
  ];
  if (appointment.status !== "cancelled") {
    return [...facts, ["Facility", placeLine(appointment)]];
  }
  return [
    ...facts,
    ["Cancelled", cancellation ? formatDateDotTime(new Date(cancellation.at)) : null],
    ["Reason", cancellation?.reason ?? null],
    [
      "Fee",
      cancellation?.fee == null
        ? null
        : cancellation.fee === 0
          ? "None"
          : formatNaira(cancellation.fee),
    ],
  ];
}
