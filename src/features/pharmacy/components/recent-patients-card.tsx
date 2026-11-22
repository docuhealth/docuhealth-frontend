import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { DashboardTable, PersonCell } from "@/components/dashboard/dashboard-table";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { TableCell, TableRow } from "@/components/ui/table";
import { RECENT_PATIENTS_PAGE_SIZE, recentPatientsQuery } from "@/features/pharmacy/api/queries";
import type { RecentPatient } from "@/features/pharmacy/api/schemas";
import { ageOn, formatDayAndTime, maskHin } from "@/lib/format";

const spans = {
  "1": "Last 24 hours",
  "7": "Last 7 days",
  "30": "Last 30 days",
  "90": "Last 3 months",
} as const;
type Span = keyof typeof spans;

/** Patients the pharmacy gave drugs to lately, most recent first. */
export function RecentPatientsCard() {
  const [span, setSpan] = useState<Span>("7");
  const [page, setPage] = useState(1);
  const { data, isError } = useQuery(recentPatientsQuery(Number(span), page));
  // When the page opened, for "Today" and ages.
  const [now] = useState(() => new Date());

  const empty = isError
    ? "We couldn’t load the recent patients. Try again in a moment."
    : data?.items.length === 0 && "No patients were given drugs in this time.";

  return (
    <DashboardCard
      title="Recent patients"
      action={
        <FilterSelect
          label="Time"
          size="sm"
          value={span}
          options={spans}
          onChange={(next) => {
            setSpan(next);
            setPage(1);
          }}
        />
      }
    >
      <DashboardTable
        className="mt-3 type-body-sm-regular"
        columns={[
          { label: "Patient", className: "type-body-sm-regular" },
          { label: "Last given drugs", className: "w-36 type-body-sm-regular" },
        ]}
        empty={empty}
      >
        {data?.items.map((patient) => (
          <TableRow key={patient.hin}>
            <TableCell>
              <Patient patient={patient} now={now} />
            </TableCell>
            <TableCell>
              <When at={patient.lastDispensedAt} now={now} />
            </TableCell>
          </TableRow>
        ))}
      </DashboardTable>
      {data && data.total > RECENT_PATIENTS_PAGE_SIZE && (
        <TablePagination
          page={page}
          pageSize={RECENT_PATIENTS_PAGE_SIZE}
          total={data.total}
          onPageChange={setPage}
        />
      )}
    </DashboardCard>
  );
}

function Patient({ patient, now }: { patient: RecentPatient; now: Date }) {
  return (
    <PersonCell
      name={patient.name}
      avatarUrl={null}
      detail={[
        `HIN ${maskHin(patient.hin)}`,
        patient.dateOfBirth && `${ageOn(new Date(patient.dateOfBirth), now)} yrs`,
        patient.sex !== "prefer_not_to_say" && (patient.sex === "male" ? "Male" : "Female"),
      ]
        .filter(Boolean)
        .join(" · ")}
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
