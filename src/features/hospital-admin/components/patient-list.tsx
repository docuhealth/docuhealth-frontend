import { CaretRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { PATIENTS_PAGE_SIZE, patientListQuery } from "@/features/hospital-admin/api/queries";
import {
  type PatientListParams,
  type PatientTab,
  type PatientVisit,
  sexLabels,
  visitTypeLabels,
} from "@/features/hospital-admin/api/schemas";
import { DashboardTable, PersonCell } from "@/components/dashboard/dashboard-table";
import { TablePagination } from "@/components/dashboard/table-pagination";
import {
  ageOn,
  formatDayAndTime,
  formatDayOfStay,
  formatDuration,
  maskHin,
  minutesBetween,
} from "@/lib/format";

// The design's layout on wide cards: Patient ~27%, the details sharing what's left.
const width = {
  three: "w-[18%] type-body-sm-regular",
  two: "w-[24%] type-body-sm-regular",
  four: "w-[13%] type-body-sm-regular",
  pill: "w-28 type-body-sm-regular",
};

/** Each tab's columns between Patient and the View button, matching `detailsOf`. */
const tabColumns: Record<PatientTab, { label: string; className: string }[]> = {
  admitted: [
    { label: "Ward · Bed", className: width.three },
    { label: "Admitted by", className: width.three },
    { label: "Admitted on", className: width.three },
    { label: "Length of stay", className: width.pill },
  ],
  checked_in: [
    { label: "Visit type", className: width.three },
    { label: "Checked-In by", className: width.three },
    { label: "Check-In at", className: width.three },
    { label: "Waiting Time", className: width.pill },
  ],
  checked_out: [
    { label: "Checked-Out by", className: width.two },
    { label: "Check-Out date", className: width.two },
    { label: "Visit Duration", className: width.pill },
  ],
  discharged: [
    { label: "Ward · Bed", className: width.four },
    { label: "Discharged by", className: width.four },
    { label: "Admitted on", className: width.four },
    { label: "Discharged on", className: width.four },
    { label: "Total stay", className: width.pill },
  ],
};

/** A visit's details, in the order of its tab's columns. */
function detailsOf(visit: PatientVisit, now: Date): ReactNode[] {
  switch (visit.status) {
    case "admitted":
      return [
        <Lines key="ward" first={visit.ward} second={`Bed ${visit.bed}`} />,
        visit.admittedBy,
        <When key="admitted" at={visit.admittedAt} now={now} />,
        <Pill key="stay">{formatDayOfStay(new Date(visit.admittedAt), now)}</Pill>,
      ];
    case "checked_in":
      return [
        <Lines
          key="type"
          first={visitTypeLabels[visit.visitType]}
          second={visit.bed && `Bed ${visit.bed}`}
        />,
        visit.checkedInBy,
        <When key="in" at={visit.checkedInAt} now={now} />,
        <Pill key="wait">{formatDuration(visit.waitMinutes)}</Pill>,
      ];
    case "checked_out":
      return [
        visit.checkedOutBy,
        <When key="out" at={visit.checkedOutAt} now={now} />,
        <Pill key="took">
          {formatDuration(
            minutesBetween(new Date(visit.checkedInAt), new Date(visit.checkedOutAt)),
          )}
        </Pill>,
      ];
    case "discharged":
      return [
        <Lines key="ward" first={visit.ward} second={`Bed ${visit.bed}`} />,
        visit.dischargedBy,
        <When key="admitted" at={visit.admittedAt} now={now} />,
        <When key="discharged" at={visit.dischargedAt} now={now} />,
        <Pill key="stay">
          {formatDuration(minutesBetween(new Date(visit.admittedAt), new Date(visit.dischargedAt)))}
        </Pill>,
      ];
  }
}

/**
 * A page of one tab's patients, with pagination. A table once its card (a `@container`) fits
 * every column (`@5xl`); below that, a list where each visit's details wrap under the patient.
 */
export function PatientList({
  params,
  filtered,
  onPageChange,
}: {
  params: PatientListParams;
  /** A search or filter is narrowing the list, for the empty message. */
  filtered: boolean;
  onPageChange: (page: number) => void;
}) {
  const { data, isError } = useQuery(patientListQuery(params));
  // When the page opened, for "Today" and lengths of stay.
  const [now] = useState(() => new Date());
  const items = data?.items ?? [];
  const columns = tabColumns[params.tab];

  const empty = isError
    ? "We couldn’t load these patients. Try again in a moment."
    : data?.items.length === 0 &&
      (filtered ? "No patients match your search." : "No patients here yet.");

  return (
    <>
      <div className="hidden @5xl:block">
        <DashboardTable
          // The last row keeps its divider to separate the table from the pagination.
          className="type-body-sm-regular [&_tbody_tr:last-child]:border-b"
          columns={[
            { label: "Patient", className: "type-body-sm-regular" },
            ...columns,
            { label: "Actions", hideLabel: true, className: "w-24" },
          ]}
          empty={empty}
        >
          {items.map((visit) => (
            <TableRow key={visit.id}>
              <TableCell>
                <Patient patient={visit.patient} />
              </TableCell>
              {detailsOf(visit, now).map((detail, index) => (
                <TableCell key={columns[index]?.label} className="whitespace-normal">
                  {detail}
                </TableCell>
              ))}
              <TableCell className="text-right">
                <ViewButton patient={visit.patient} />
              </TableCell>
            </TableRow>
          ))}
        </DashboardTable>
      </div>

      <div className="mt-4 border-t @5xl:hidden">
        {empty ? (
          <p className="py-10 text-center type-caption text-fg-caption">{empty}</p>
        ) : (
          <ul aria-label="Patients">
            {items.map((visit) => (
              <li key={visit.id} className="flex flex-col gap-3 border-b px-1 py-3">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1 type-body-sm-regular">
                    <Patient patient={visit.patient} />
                  </div>
                  <ViewButton patient={visit.patient} />
                </div>
                {/* Lined up under the name, past the avatar. */}
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 pl-10 @xl:grid-cols-4 @3xl:grid-cols-5">
                  {detailsOf(visit, now).map((detail, index) => (
                    <div key={columns[index]?.label} className="flex min-w-0 flex-col gap-1">
                      <dt className="type-caption text-fg-caption">{columns[index]?.label}</dt>
                      <dd className="type-caption text-fg-heading">{detail}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </div>

      {data && data.total > 0 && (
        <TablePagination
          page={params.page}
          pageSize={PATIENTS_PAGE_SIZE}
          total={data.total}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}

function Patient({ patient }: { patient: PatientVisit["patient"] }) {
  const age = ageOn(new Date(patient.dateOfBirth));
  return (
    <PersonCell
      name={patient.name}
      avatarUrl={patient.avatarUrl}
      detail={[
        `HIN ${maskHin(patient.hin)}`,
        `${age} yrs`,
        patient.sex !== "prefer_not_to_say" && sexLabels[patient.sex],
      ]
        .filter(Boolean)
        .join(" · ")}
    />
  );
}

/** Two lines in a cell: the main one, then a caption under it. */
function Lines({ first, second }: { first: ReactNode; second?: ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-fg-heading">{first}</span>
      {second && <span className="text-fg-caption">{second}</span>}
    </div>
  );
}

function When({ at, now }: { at: string; now: Date }) {
  const { day, time } = formatDayAndTime(new Date(at), now);
  return <Lines first={day} second={time} />;
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-[4px] bg-primary/10 px-2 py-0.5 type-body-sm-medium whitespace-nowrap text-primary">
      {children}
    </span>
  );
}

function ViewButton({ patient }: { patient: PatientVisit["patient"] }) {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="gap-1 bg-card type-caption-semibold font-sans text-fg-heading"
    >
      <Link
        to="/hospital/admin/patients/$patientId"
        params={{ patientId: patient.id }}
        aria-label={`View ${patient.name}`}
      >
        View
        <CaretRightIcon data-icon="inline-end" className="size-3" />
      </Link>
    </Button>
  );
}
