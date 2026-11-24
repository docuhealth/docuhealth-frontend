import { CaretRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { DashboardTable, PersonCell } from "@/components/dashboard/dashboard-table";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { testAppointmentsQuery } from "@/features/lab-scientist/api/queries";
import { formatTime } from "@/lib/format";
import { type Period, periodLabels } from "@/lib/period";

/** How many appointments the card shows. */
const PREVIEW_ROWS = 6;

/** e.g. "Oct 24, 2026", as the design writes the appointment's day. */
const appointmentDay = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

// On narrow cards the test type moves under the patient's HIN.
const columns = {
  when: "w-28 @md:w-[30%]",
  patient: "",
  test: "hidden w-[30%] @md:table-cell",
  action: "w-12",
};

const noneIn = {
  today: "No tests booked for today.",
  week: "No tests booked this week.",
  month: "No tests booked this month.",
} as const satisfies Record<Period, string>;

/** The tests booked for the coming period, soonest first. */
export function TestAppointmentsCard() {
  const [period, setPeriod] = useState<Period>("week");
  const { data, isError } = useQuery(testAppointmentsQuery(period));

  return (
    <DashboardCard
      title="Upcoming Test Appointments"
      className="p-5"
      action={
        <FilterSelect
          label="Test appointments period"
          size="sm"
          value={period}
          options={periodLabels}
          onChange={setPeriod}
        />
      }
    >
      <DashboardTable
        className="type-body-sm-regular"
        columns={[
          { label: "Date & Time", className: `${columns.when} type-body-sm-regular` },
          { label: "Patient Name", className: `${columns.patient} type-body-sm-regular` },
          { label: "Test Type", className: `${columns.test} type-body-sm-regular` },
          { label: "Open", hideLabel: true, className: columns.action },
        ]}
        loading={!data}
        empty={
          isError
            ? "We couldn’t load the appointments. Try again in a moment."
            : data?.items.length === 0 && noneIn[period]
        }
      >
        {data?.items.slice(0, PREVIEW_ROWS).map((appointment) => {
          const when = new Date(appointment.at);
          return (
            <TableRow key={appointment.id}>
              <TableCell className={columns.when}>
                <div className="flex flex-col">
                  <span className="text-fg-heading">{appointmentDay.format(when)}</span>
                  <span className="text-fg-caption">{formatTime(when)}</span>
                </div>
              </TableCell>
              <TableCell className={columns.patient}>
                <PersonCell
                  name={appointment.patient.name}
                  avatarUrl={appointment.patient.avatarUrl}
                  detail={
                    <>
                      HIN: {appointment.patient.hin}
                      <span className="block truncate @md:hidden">{appointment.testType}</span>
                    </>
                  }
                />
              </TableCell>
              <TableCell className={`${columns.test} text-fg-heading`}>
                {appointment.testType}
              </TableCell>
              <TableCell className={`${columns.action} text-right`}>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Open ${appointment.patient.name}’s ${appointment.testType}`}
                  // TODO(design): open the booked test once its details are designed.
                  onClick={() => toast.info("Appointment details aren’t built yet.")}
                  className="-mr-1.5 text-fg-caption"
                >
                  <CaretRightIcon className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </DashboardTable>
    </DashboardCard>
  );
}
