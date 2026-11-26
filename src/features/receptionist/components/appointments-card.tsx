import { ArrowRightIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { CountTab, CountTabsList } from "@/components/dashboard/count-tabs";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { SearchField } from "@/components/dashboard/search-field";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { appointmentListQuery } from "@/features/receptionist/api/queries";
import {
  type AppointmentDay,
  appointmentDayLabels,
  type AppointmentList,
} from "@/features/receptionist/api/schemas";
import { AppointmentDetailsDialog } from "@/features/receptionist/components/appointment-details-dialog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { StatusTag } from "@/features/receptionist/components/status-tag";
import { formatClockTime, formatShortDay } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/dashboard/skeletons";

type Appointment = AppointmentList["items"][number];

/** How many appointments the card shows; the rest are a click away. */
const PREVIEW_ROWS = 5;

const days = Object.keys(appointmentDayLabels) as AppointmentDay[];

const noneOn = {
  today: "No appointments today.",
  tomorrow: "No appointments tomorrow.",
  upcoming: "No appointments coming up.",
} as const satisfies Record<AppointmentDay, string>;

/** Today's, tomorrow's and later appointments, searchable by the patient's name or email. */
export function AppointmentsCard() {
  const [day, setDay] = useState<AppointmentDay>("today");
  const [search, setSearch] = useState("");
  const term = useDebouncedValue(search.trim());
  const { data, isError } = useQuery(appointmentListQuery(day, term));
  const [openId, setOpenId] = useState<string | null>(null);

  const empty = isError
    ? "We couldn’t load the appointments. Try again in a moment."
    : data?.items.length === 0 && (term ? `No appointments match “${term}”.` : noneOn[day]);

  return (
    <DashboardCard
      title="Appointment Management"
      className="p-5"
      action={
        <SearchField
          label="Search appointments"
          placeholder="Search Patient"
          value={search}
          onChange={setSearch}
        />
      }
    >
      <Tabs value={day} onValueChange={(next) => setDay(next as AppointmentDay)}>
        {/* Ruled edge to edge, past the card's padding. */}
        <CountTabsList className="-mx-5 w-auto px-5">
          {days.map((value) => (
            <CountTab key={value} value={value} count={data?.counts[value]}>
              {appointmentDayLabels[value]}
            </CountTab>
          ))}
        </CountTabsList>
      </Tabs>

      {empty ? (
        <EmptyState compact description={empty} />
      ) : !data ? (
        <ListSkeleton className="py-4" />
      ) : (
        <>
          {/* Column labels; widths match AppointmentRow's. Screen readers get each row whole. */}
          <div
            aria-hidden
            className="mt-4 flex h-9 items-center gap-3 rounded-t-lg bg-line pl-4 type-caption text-fg-body"
          >
            <span className="w-20 shrink-0 @md:w-24">Time</span>
            <span className="min-w-0 flex-1">Patient Name</span>
            <span className="hidden w-[22%] @md:block">Reason</span>
            <span className="hidden w-24 shrink-0 @sm:block">Status</span>
            {/* Room for the row's open button. */}
            <span className="w-5.5 shrink-0" />
          </div>
          <ul aria-label={`${appointmentDayLabels[day]}’s appointments`}>
            {data?.items.slice(0, PREVIEW_ROWS).map((appointment) => (
              <AppointmentRow
                key={appointment.id}
                appointment={appointment}
                showDay={day === "upcoming"}
                onOpen={setOpenId}
              />
            ))}
          </ul>
        </>
      )}

      <Link
        to="/hospital/receptionist/appointments"
        className="mx-auto mt-auto flex items-center gap-2 pt-4 type-body-sm-regular text-fg-caption hover:text-fg-heading"
      >
        View all appointments
        <ArrowRightIcon className="size-4" />
      </Link>
      <AppointmentDetailsDialog appointmentId={openId} onClose={() => setOpenId(null)} />
    </DashboardCard>
  );
}

/**
 * Time, patient, reason and status; on narrow cards the reason (and, narrower still, the status)
 * move under the patient, where there's no room for their own columns.
 */
function AppointmentRow({
  appointment,
  showDay,
  onOpen,
}: {
  appointment: Appointment;
  showDay: boolean;
  onOpen: (id: string) => void;
}) {
  const at = new Date(appointment.at);
  const { patient } = appointment;

  return (
    <li className="flex items-center gap-3 border-b py-3.5 pl-4 type-body-sm-regular">
      <div className="flex w-20 shrink-0 flex-col @md:w-24">
        {showDay && <span className="type-caption text-fg-caption">{formatShortDay(at)}</span>}
        <span className="text-fg-heading">{formatClockTime(at)}</span>
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <PersonAvatar name={patient.name} src={patient.avatarUrl} />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-fg-heading">{patient.name}</span>
          <span className="truncate text-fg-caption">{patient.phone}</span>
          <span className="truncate text-fg-caption @md:hidden">{appointment.reason}</span>
          <StatusTag status={appointment.status} className="mt-1 self-start @sm:hidden" />
        </div>
      </div>
      <span className="hidden w-[22%] truncate text-fg-caption @md:block">
        {appointment.reason}
      </span>
      {/* A fixed width keeps the reason column lined up whatever the status. */}
      <div className="hidden w-24 shrink-0 @sm:block">
        <StatusTag status={appointment.status} className="inline-block" />
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Open ${patient.name}’s appointment`}
        onClick={() => onOpen(appointment.id)}
        className="-mr-1.5 shrink-0 text-fg-caption"
      >
        <CaretRightIcon className="size-4" />
      </Button>
    </li>
  );
}
