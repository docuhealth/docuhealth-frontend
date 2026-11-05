import { CalendarDotsIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAnswerAppointmentRequest, useCheckOut } from "@/features/receptionist/api/mutations";
import { checkOutSummaryQuery } from "@/features/receptionist/api/queries";
import {
  type AppointmentRequest,
  type CheckOutSummary,
  type QueueEntry,
  requestStatusLabels,
} from "@/features/receptionist/api/schemas";
import { BookAppointmentDialog } from "@/features/receptionist/components/book-appointment-dialog";
import { PatientSummary } from "@/features/receptionist/components/patient-summary";
import { formatDayAndTime, formatShortDay } from "@/lib/format";
import { cn } from "@/lib/utils";

const statusTones = {
  pending: "bg-warning-100 text-warning-700",
  confirmed: "bg-success-100 text-success-700",
  cancelled: "bg-error-100 text-error-700",
} as const satisfies Record<AppointmentRequest["status"], string>;

/**
 * Check-out Patient: before someone in the queue leaves, the front desk settles any appointment
 * requests their doctor made (or books one), then checks them out.
 */
export function CheckOutDialog({
  entry,
  onOpenChange,
}: {
  /** Who's leaving; `null` keeps the dialog closed. */
  entry: QueueEntry | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <FormDialog open={entry !== null} onOpenChange={onOpenChange}>
      <FormDialogHeader
        title="Check-out Patient"
        description="Review appointment requests before patient leaves."
      />
      {entry && <CheckOutReview entry={entry} onDone={() => onOpenChange(false)} />}
    </FormDialog>
  );
}

function CheckOutReview({ entry, onDone }: { entry: QueueEntry; onDone: () => void }) {
  const { data, isPending, isError } = useQuery(checkOutSummaryQuery(entry.id));
  const checkOut = useCheckOut();
  const { name } = entry.patient;

  return (
    <>
      <FormDialogBody className="gap-6">
        {isPending ? (
          <Spinner className="mx-auto my-10 size-6 text-fg-caption" />
        ) : isError ? (
          <p className="py-10 text-center type-body-sm-regular text-error-500">
            We couldn’t load {name}’s details. You can still check them out.
          </p>
        ) : (
          <>
            <PatientSummary patient={data.patient} />
            <section className="flex flex-col gap-3">
              <h3 className="type-body-sm-medium text-fg-heading">Appointment requests</h3>
              {data.appointmentRequests.length === 0 ? (
                <NoRequests patient={data.patient} />
              ) : (
                data.appointmentRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))
              )}
            </section>
          </>
        )}
      </FormDialogBody>

      <FormDialogFooter closeLabel="Close">
        <Button
          type="button"
          loading={checkOut.isPending}
          className="h-11 px-5 type-heading-sm"
          onClick={() =>
            checkOut.mutate(entry.id, {
              onSuccess: () => {
                toast.success(`${name} is checked out.`);
                onDone();
              },
              onError: () => toast.error(`We couldn’t check ${name} out. Try again.`),
            })
          }
        >
          Complete Check-out
          <CaretRightIcon data-icon="inline-end" />
        </Button>
      </FormDialogFooter>
    </>
  );
}

/** A request to settle: what and when the doctor asked for, with Confirm, Reschedule, Cancel. */
function RequestCard({ request }: { request: AppointmentRequest }) {
  const answer = useAnswerAppointmentRequest();
  const requested = formatDayAndTime(new Date(request.requestedAt));
  const proposed = new Date(request.proposedAt);

  function respond(choice: "confirm" | "cancel") {
    answer.mutate(
      { id: request.id, answer: choice },
      {
        onSuccess: () =>
          toast.success(choice === "confirm" ? "Appointment confirmed." : "Request cancelled."),
        onError: () => toast.error("We couldn’t update this request. Try again."),
      },
    );
  }

  return (
    <article className="flex flex-col gap-4 rounded-xl border px-4 py-4">
      <div className="flex flex-col gap-1 border-b pb-4">
        <div className="flex items-start justify-between gap-3">
          <h4 className="type-body text-fg-heading">{request.reason}</h4>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-0.5 type-caption-medium",
              statusTones[request.status],
            )}
          >
            {requestStatusLabels[request.status]}
          </span>
        </div>
        <p className="type-body-sm-regular text-fg-body">
          Requested by {request.requestedBy} · {requested.day === "Today" ? "today" : requested.day}
          , {requested.time}
        </p>
      </div>

      <div className="flex flex-col gap-1 rounded-lg border bg-surface px-5 py-4">
        <span className="type-label text-fg-caption">Requested time</span>
        <span className="type-h5">
          {formatShortDay(proposed)} · {formatDayAndTime(proposed).time}
        </span>
      </div>

      {request.note && (
        <p className="type-body-sm-regular text-fg-body">
          <strong className="font-semibold text-fg-heading">NOTE:</strong> {request.note}
        </p>
      )}

      {request.status === "pending" && (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            disabled={answer.isPending}
            className="h-10 bg-primary/10 px-4 type-body-sm-medium text-primary hover:bg-primary/15"
            onClick={() => respond("confirm")}
          >
            Confirm
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={answer.isPending}
            className="h-10 bg-card px-4 type-body-sm-medium text-fg-heading"
            // TODO(design): open rescheduling once it's designed.
            onClick={() => toast.info("Rescheduling isn’t built yet.")}
          >
            Reschedule
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={answer.isPending}
            className="h-10 px-4 type-body-sm-medium text-error-500 hover:bg-error-100 hover:text-error-700"
            onClick={() => respond("cancel")}
          >
            Cancel request
          </Button>
        </div>
      )}
    </article>
  );
}

function NoRequests({ patient }: { patient: CheckOutSummary["patient"] }) {
  const [booking, setBooking] = useState(false);
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border px-6 py-10 text-center">
      <span className="mb-3 grid size-14 place-content-center rounded-full bg-line text-fg-heading">
        <CalendarDotsIcon className="size-6" />
      </span>
      <p className="type-body-sm-medium text-fg-heading">No appointment requests</p>
      <p className="max-w-sm type-body-sm-regular text-fg-caption">
        Nothing is waiting for this patient. If they need to come back, book a follow-up before they
        leave.
      </p>
      <Button
        type="button"
        className="mt-2 h-10 bg-primary/10 px-4 type-body-sm-medium text-primary hover:bg-primary/15"
        onClick={() => setBooking(true)}
      >
        Book Appointment
      </Button>
      <BookAppointmentDialog patient={patient} open={booking} onOpenChange={setBooking} />
    </div>
  );
}
