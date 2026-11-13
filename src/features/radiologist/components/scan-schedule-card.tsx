import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { DashboardTable, PersonCell } from "@/components/dashboard/dashboard-table";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { TableCell, TableRow } from "@/components/ui/table";
import { scanScheduleQuery } from "@/features/radiologist/api/queries";
import { OpenButton } from "@/features/radiologist/components/open-button";
import { formatDayAndTime } from "@/lib/format";
import { type Period, periodLabels } from "@/lib/period";

/** How many scans the card shows. */
const PREVIEW_ROWS = 6;

// On narrow cards the scan type moves under the patient's HIN.
const columns = {
  when: "w-28 @md:w-[30%]",
  patient: "",
  scan: "hidden w-[30%] @md:table-cell",
  action: "w-12",
};

const noneIn = {
  today: "No scans booked for today.",
  week: "No scans booked this week.",
  month: "No scans booked this month.",
} as const satisfies Record<Period, string>;

/** The scans booked for the coming period, soonest first. */
export function ScanScheduleCard() {
  const [period, setPeriod] = useState<Period>("week");
  const { data, isError } = useQuery(scanScheduleQuery(period));
  // When the page opened, for "Today".
  const [now] = useState(() => new Date());

  return (
    <DashboardCard
      title="Upcoming Scan Schedule"
      className="p-5"
      action={
        <FilterSelect
          label="Scan schedule period"
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
          { label: "Scan Type", className: `${columns.scan} type-body-sm-regular` },
          { label: "Open", hideLabel: true, className: columns.action },
        ]}
        empty={
          isError
            ? "We couldn’t load the schedule. Try again in a moment."
            : data?.items.length === 0 && noneIn[period]
        }
      >
        {data?.items.slice(0, PREVIEW_ROWS).map((scan) => {
          const { day, time } = formatDayAndTime(new Date(scan.at), now);
          return (
            <TableRow key={scan.id}>
              <TableCell className={columns.when}>
                <div className="flex flex-col">
                  <span className="text-fg-heading">{day}</span>
                  <span className="text-fg-caption">{time}</span>
                </div>
              </TableCell>
              <TableCell className={columns.patient}>
                <PersonCell
                  name={scan.patient.name}
                  avatarUrl={scan.patient.avatarUrl}
                  detail={
                    <>
                      HIN: {scan.patient.hin}
                      <span className="block truncate @md:hidden">{scan.scanType}</span>
                    </>
                  }
                />
              </TableCell>
              <TableCell className={`${columns.scan} text-fg-heading`}>{scan.scanType}</TableCell>
              <TableCell className={`${columns.action} text-right`}>
                <OpenButton
                  label={`Open ${scan.patient.name}’s ${scan.scanType}`}
                  // TODO(design): open the booked scan once its details are designed.
                  onClick={() => toast.info("Scan details aren’t built yet.")}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </DashboardTable>
    </DashboardCard>
  );
}
