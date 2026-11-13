import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { DashboardTable } from "@/components/dashboard/dashboard-table";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { TableCell, TableRow } from "@/components/ui/table";
import { recentUploadsQuery } from "@/features/radiologist/api/queries";
import { OpenButton } from "@/features/radiologist/components/open-button";
import { UploadStatusTag } from "@/features/radiologist/components/status-tag";
import { formatDayAndTime } from "@/lib/format";
import { type Period, periodLabels } from "@/lib/period";

/** How many uploads the card shows. */
const PREVIEW_ROWS = 6;

// On narrow cards the upload time moves under the patient's name.
const columns = {
  file: "",
  uploaded: "hidden w-[28%] @md:table-cell",
  status: "w-28",
  action: "w-12",
};

const noneIn = {
  today: "Nothing uploaded today.",
  week: "Nothing uploaded this week.",
  month: "Nothing uploaded this month.",
} as const satisfies Record<Period, string>;

/** Scan results uploaded in the period, newest first, and whether each went through. */
export function RecentUploadsCard() {
  const [period, setPeriod] = useState<Period>("week");
  const { data, isError } = useQuery(recentUploadsQuery(period));
  // When the page opened, for "Today".
  const [now] = useState(() => new Date());

  return (
    <DashboardCard
      title="Recent Uploads"
      className="p-5"
      action={
        <FilterSelect
          label="Recent uploads period"
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
          { label: "File / Results", className: `${columns.file} type-body-sm-regular` },
          { label: "Uploaded", className: `${columns.uploaded} type-body-sm-regular` },
          { label: "Status", className: `${columns.status} type-body-sm-regular` },
          { label: "Open", hideLabel: true, className: columns.action },
        ]}
        empty={
          isError
            ? "We couldn’t load the uploads. Try again in a moment."
            : data?.items.length === 0 && noneIn[period]
        }
      >
        {data?.items.slice(0, PREVIEW_ROWS).map((upload) => {
          const { day, time } = formatDayAndTime(new Date(upload.uploadedAt), now);
          return (
            <TableRow key={upload.id}>
              <TableCell className={columns.file}>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-fg-heading">{upload.scanType}</span>
                  <span className="truncate text-fg-caption">{upload.patient.name}</span>
                  <span className="truncate text-fg-caption @md:hidden">
                    {day}, {time}
                  </span>
                </div>
              </TableCell>
              <TableCell className={columns.uploaded}>
                <div className="flex flex-col">
                  <span className="text-fg-heading">{day}</span>
                  <span className="text-fg-caption">{time}</span>
                </div>
              </TableCell>
              <TableCell className={columns.status}>
                <UploadStatusTag status={upload.status} />
              </TableCell>
              <TableCell className={`${columns.action} text-right`}>
                <OpenButton
                  label={`Open ${upload.patient.name}’s ${upload.scanType} results`}
                  // TODO(design): open the uploaded results once they're designed.
                  onClick={() => toast.info("Scan results aren’t built yet.")}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </DashboardTable>
    </DashboardCard>
  );
}
