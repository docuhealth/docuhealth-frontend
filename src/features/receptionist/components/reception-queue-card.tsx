import { ArrowRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { DashboardTable } from "@/components/dashboard/dashboard-table";
import { SearchField } from "@/components/dashboard/search-field";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { receptionQueueQuery } from "@/features/receptionist/api/queries";
import type { QueueEntry } from "@/features/receptionist/api/schemas";
import { CheckOutDialog } from "@/features/receptionist/components/check-out-dialog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

/** How many waiting patients the card shows; the rest are a click away. */
const PREVIEW_ROWS = 5;

// On narrow cards the # column goes, and the reason moves under the patient's name.
const columns = {
  number: "hidden w-10 @sm:table-cell",
  name: "pl-4 @sm:pl-2",
  reason: "hidden w-[28%] @md:table-cell",
  wait: "w-20",
  action: "w-28",
};

/** The patients waiting now, longest first, each with a button to check them out. */
export function ReceptionQueueCard() {
  const [search, setSearch] = useState("");
  const term = useDebouncedValue(search.trim());
  const { data, isError } = useQuery(receptionQueueQuery(term));
  const [checkingOut, setCheckingOut] = useState<QueueEntry | null>(null);

  return (
    <DashboardCard
      title="Queue Management"
      className="p-5"
      action={
        <SearchField
          label="Search the queue"
          placeholder="Search Patient"
          value={search}
          onChange={setSearch}
        />
      }
    >
      <DashboardTable
        plainHeader
        className="type-body-sm-regular"
        columns={[
          { label: "#", className: `${columns.number} type-body-sm-regular` },
          { label: "Patient Name", className: `${columns.name} type-body-sm-regular` },
          { label: "Reason", className: `${columns.reason} type-body-sm-regular` },
          { label: "Wait time", className: `${columns.wait} type-body-sm-regular` },
          { label: "Action", className: `${columns.action} type-body-sm-regular` },
        ]}
        empty={
          isError
            ? "We couldn’t load the queue. Try again in a moment."
            : data?.items.length === 0 &&
              (term ? `No patients match “${term}”.` : "No one is waiting.")
        }
      >
        {data?.items.slice(0, PREVIEW_ROWS).map((entry, index) => (
          <TableRow key={entry.id}>
            <TableCell className={columns.number}>{index + 1}</TableCell>
            <TableCell className={columns.name}>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-fg-heading">{entry.patient.name}</span>
                <span className="truncate text-fg-caption">HIN: {entry.patient.hin}</span>
                <span className="truncate text-fg-caption @md:hidden">{entry.reason}</span>
              </div>
            </TableCell>
            <TableCell className={`${columns.reason} whitespace-normal text-fg-heading`}>
              {entry.reason}
            </TableCell>
            <TableCell className={`${columns.wait} text-fg-heading`}>
              {entry.waitMinutes} mins
            </TableCell>
            <TableCell className={columns.action}>
              <CheckOutButton entry={entry} onClick={() => setCheckingOut(entry)} />
            </TableCell>
          </TableRow>
        ))}
      </DashboardTable>

      <Link
        to="/hospital/receptionist/patients"
        className="mx-auto mt-auto flex items-center gap-2 pt-4 type-body-sm-regular text-fg-caption hover:text-fg-heading"
      >
        View all in queue
        <ArrowRightIcon className="size-4" />
      </Link>

      <CheckOutDialog entry={checkingOut} onOpenChange={(open) => !open && setCheckingOut(null)} />
    </DashboardCard>
  );
}

function CheckOutButton({ entry, onClick }: { entry: QueueEntry; onClick: () => void }) {
  return (
    <Button
      variant="link"
      aria-label={`Check out ${entry.patient.name}`}
      onClick={onClick}
      className="h-auto gap-1.5 px-0 type-body-sm-medium font-sans text-primary"
    >
      Check out
      <ArrowRightIcon className="size-4" />
    </Button>
  );
}
