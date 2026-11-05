import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { patientQueueQuery } from "@/features/hospital-admin/api/queries";
import { type PatientQueue, queueStatusLabels } from "@/features/hospital-admin/api/schemas";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { DashboardTable, PersonCell } from "@/components/dashboard/dashboard-table";
import { SearchField } from "@/components/dashboard/search-field";
import { StatusPill } from "@/components/dashboard/status-pill";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const statusTones = {
  pending: "warning",
  in_progress: "info",
  completed: "success",
} as const satisfies Record<PatientQueue["items"][number]["status"], string>;

// On narrow cards the # column goes, so the name column becomes the first one (and takes over
// the first column's wider left padding); on the narrowest, the wait time moves under the status.
const columns = {
  number: "hidden w-12 @md:table-cell",
  name: "pl-4 @md:pl-2",
  status: "w-28",
  wait: "hidden w-20 @sm:table-cell",
};

/** Today's patient queue, searchable by name or HIN. */
export function QueueCard() {
  const [search, setSearch] = useState("");
  const term = useDebouncedValue(search.trim());
  const { data, isError } = useQuery(patientQueueQuery(term));

  return (
    <DashboardCard
      title="Queue Management"
      action={
        <SearchField
          label="Search patients"
          placeholder="Search Patient"
          value={search}
          onChange={setSearch}
        />
      }
    >
      <DashboardTable
        columns={[
          { label: "#", className: columns.number },
          { label: "Patient Name", className: columns.name },
          { label: "Status", className: columns.status },
          { label: "Wait time", className: columns.wait },
        ]}
        empty={
          isError
            ? "We couldn’t load the queue. Try again in a moment."
            : data?.items.length === 0 &&
              (term ? `No patients match “${term}”.` : "No patients are waiting.")
        }
      >
        {data?.items.map((entry, index) => (
          <TableRow key={entry.id}>
            <TableCell className={columns.number}>{index + 1}</TableCell>
            <TableCell className={columns.name}>
              <PersonCell
                name={entry.patient.name}
                avatarUrl={entry.patient.avatarUrl}
                detail={`HIN: ${entry.patient.hin}`}
              />
            </TableCell>
            <TableCell className={columns.status}>
              <div className="flex flex-col items-start gap-1">
                <StatusPill tone={statusTones[entry.status]}>
                  {queueStatusLabels[entry.status]}
                </StatusPill>
                <span className="@sm:hidden">{entry.waitMinutes} mins</span>
              </div>
            </TableCell>
            <TableCell className={columns.wait}>{entry.waitMinutes} mins</TableCell>
          </TableRow>
        ))}
      </DashboardTable>
    </DashboardCard>
  );
}
