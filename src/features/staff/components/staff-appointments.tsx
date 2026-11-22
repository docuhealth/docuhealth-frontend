import { CheckCircleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { CountTab, CountTabsList } from "@/components/dashboard/count-tabs";
import { DashboardTable, PersonCell } from "@/components/dashboard/dashboard-table";
import { SearchField } from "@/components/dashboard/search-field";
import { StatusPill } from "@/components/dashboard/status-pill";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { DateInput } from "@/components/date-input";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { useCloseAppointment } from "@/features/staff/api/mutations";
import {
  APPOINTMENTS_PAGE_SIZE,
  type AppointmentParams,
  appointmentListQuery,
} from "@/features/staff/api/queries";
import {
  type Appointment,
  type AppointmentStatus,
  type AppointmentTimeframe,
  appointmentStatusLabels,
  appointmentTimeframeLabels,
} from "@/features/staff/api/schemas";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/api";
import { formatDayAndTime } from "@/lib/format";

const timeframes = Object.keys(appointmentTimeframeLabels) as AppointmentTimeframe[];

const statusTones = {
  pending: "warning",
  confirmed: "info",
  completed: "success",
  cancelled: "neutral",
} as const satisfies Record<AppointmentStatus, string>;

const emptyIn = {
  today: "No appointments today.",
  upcoming: "No upcoming appointments.",
  history: "No past appointments.",
} as const satisfies Record<AppointmentTimeframe, string>;

const columns = { when: "w-32", type: "w-[16%]", staff: "w-[18%]", status: "w-28", action: "w-24" };

/**
 * Appointments by Today / Upcoming / Past, searchable and narrowed to a date range. `scope`
 * "mine" lists the signed-in member's own; "hospital" every appointment (the hospital admin).
 * Open ones can be closed once the visit is done.
 */
export function StaffAppointments({ scope }: { scope: AppointmentParams["scope"] }) {
  const [timeframe, setTimeframe] = useState<AppointmentTimeframe>("today");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [closing, setClosing] = useState<Appointment | null>(null);
  const term = useDebouncedValue(search.trim());
  const { data, isError } = useQuery(
    appointmentListQuery({ scope, timeframe, page, search: term, from, to }),
  );
  // When the page opened, for "Today" and "Yesterday".
  const [now] = useState(() => new Date());
  const items = data?.items ?? [];
  const filtered = !!(term || from || to);

  const empty = isError
    ? "We couldn’t load the appointments. Try again in a moment."
    : data?.items.length === 0 &&
      (filtered ? "No appointments match your filters." : emptyIn[timeframe]);

  const resetPage =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      setPage(1);
    };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="type-h4">Appointments</h1>
        <p className="type-body-sm-regular text-fg-caption">
          {scope === "mine" ? "The visits booked with you." : "Every visit booked at the hospital."}
        </p>
      </div>

      <section aria-label="Appointments" className="@container rounded-xl border bg-card p-4">
        <header className="flex flex-wrap items-center gap-4">
          <SearchField
            size="lg"
            label="Search appointments"
            placeholder="Search by patient name or HIN"
            value={search}
            onChange={resetPage(setSearch)}
            className="@3xl:w-80"
          />
          <div className="flex w-full flex-wrap items-center gap-3 @3xl:ml-auto @3xl:w-auto">
            <span className="type-body-sm-regular text-fg-caption">From</span>
            <DateInput
              value={from}
              onChange={resetPage(setFrom)}
              max={to ? new Date(`${to}T00:00`) : undefined}
              className="w-40"
            />
            <span className="type-body-sm-regular text-fg-caption">to</span>
            <DateInput
              value={to}
              onChange={resetPage(setTo)}
              min={from ? new Date(`${from}T00:00`) : undefined}
              className="w-40"
            />
          </div>
        </header>

        <Tabs
          value={timeframe}
          onValueChange={(next) => resetPage(setTimeframe)(next as AppointmentTimeframe)}
          className="mt-2 gap-0"
        >
          {/* Ruled edge to edge, past the card's padding. */}
          <CountTabsList className="-mx-4 w-auto px-4">
            {timeframes.map((value) => (
              <CountTab
                key={value}
                value={value}
                count={value === timeframe ? data?.total : undefined}
              >
                {appointmentTimeframeLabels[value]}
              </CountTab>
            ))}
          </CountTabsList>
        </Tabs>

        <div className="hidden @3xl:block">
          <DashboardTable
            className="type-body-sm-regular [&_tbody_tr:last-child]:border-b"
            columns={[
              { label: "Date & Time", className: `${columns.when} type-body-sm-regular` },
              { label: "Patient", className: "type-body-sm-regular" },
              { label: "Type", className: `${columns.type} type-body-sm-regular` },
              {
                label: scope === "mine" ? "Booked with" : "Staff",
                className: `${columns.staff} type-body-sm-regular`,
              },
              { label: "Status", className: `${columns.status} type-body-sm-regular` },
              { label: "Actions", hideLabel: true, className: columns.action },
            ]}
            empty={empty}
          >
            {items.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  <When at={appointment.at} now={now} />
                </TableCell>
                <TableCell>
                  <Patient appointment={appointment} />
                </TableCell>
                <TableCell>{appointment.type ?? "—"}</TableCell>
                <TableCell className="whitespace-normal">
                  {appointment.staff?.name || "—"}
                </TableCell>
                <TableCell>
                  <Status status={appointment.status} />
                </TableCell>
                <TableCell className="text-right">
                  <CloseButton appointment={appointment} onClick={() => setClosing(appointment)} />
                </TableCell>
              </TableRow>
            ))}
          </DashboardTable>
        </div>

        <div className="mt-4 border-t @3xl:hidden">
          {empty ? (
            <p className="py-10 text-center type-caption text-fg-caption">{empty}</p>
          ) : (
            <ul aria-label="Appointments">
              {items.map((appointment) => (
                <li key={appointment.id} className="flex flex-col gap-3 border-b px-1 py-3">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1 type-body-sm-regular">
                      <Patient appointment={appointment} />
                    </div>
                    <CloseButton
                      appointment={appointment}
                      onClick={() => setClosing(appointment)}
                    />
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 pl-10 @md:grid-cols-4">
                    <Detail label="Date & Time">
                      <When at={appointment.at} now={now} />
                    </Detail>
                    <Detail label="Type">{appointment.type ?? "—"}</Detail>
                    <Detail label={scope === "mine" ? "Booked with" : "Staff"}>
                      {appointment.staff?.name || "—"}
                    </Detail>
                    <Detail label="Status">
                      <Status status={appointment.status} />
                    </Detail>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </div>

        {data && data.total > 0 && (
          <TablePagination
            page={page}
            pageSize={APPOINTMENTS_PAGE_SIZE}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </section>

      {closing && <CloseAppointmentDialog appointment={closing} onClose={() => setClosing(null)} />}
    </div>
  );
}

function CloseAppointmentDialog({
  appointment,
  onClose,
}: {
  appointment: Appointment;
  onClose: () => void;
}) {
  const close = useCloseAppointment();
  return (
    <ConfirmDialog
      tone="brand"
      icon={<CheckCircleIcon />}
      title="Close appointment"
      confirmLabel="Close appointment"
      pending={close.isPending}
      onClose={() => !close.isPending && onClose()}
      onConfirm={() =>
        close.mutate(appointment.id, {
          onSuccess: () => {
            toast.success(`${appointment.patient.name}’s appointment is closed.`);
            onClose();
          },
          onError: (error) => toast.error(getErrorMessage(error)),
        })
      }
    >
      <DialogDescription className="type-body-regular text-fg-body">
        Close {appointment.patient.name}’s appointment once the visit is over. It moves to Past and
        can’t be reopened.
      </DialogDescription>
    </ConfirmDialog>
  );
}

function CloseButton({ appointment, onClick }: { appointment: Appointment; onClick: () => void }) {
  if (appointment.status === "completed" || appointment.status === "cancelled") return null;
  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={`Close ${appointment.patient.name}’s appointment`}
      onClick={onClick}
      className="bg-card type-caption-semibold font-sans text-fg-heading"
    >
      Close
    </Button>
  );
}

function Patient({ appointment }: { appointment: Appointment }) {
  return (
    <PersonCell
      name={appointment.patient.name}
      avatarUrl={null}
      detail={
        appointment.patient.hin ? `HIN: ${appointment.patient.hin}` : appointment.patient.phone
      }
    />
  );
}

function When({ at, now }: { at: string; now: Date }) {
  const { day, time } = formatDayAndTime(new Date(at), now);
  return (
    <div className="flex flex-col">
      <span className="text-fg-heading">{day}</span>
      <span className="text-fg-caption">{time}</span>
    </div>
  );
}

function Status({ status }: { status: AppointmentStatus }) {
  return <StatusPill tone={statusTones[status]}>{appointmentStatusLabels[status]}</StatusPill>;
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-1">
      <dt className="type-caption text-fg-caption">{label}</dt>
      <dd className="max-w-full truncate type-caption text-fg-heading">{children}</dd>
    </div>
  );
}
