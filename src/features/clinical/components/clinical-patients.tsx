import { CaretRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { CountTab, CountTabsList } from "@/components/dashboard/count-tabs";
import { DashboardTable, PersonCell } from "@/components/dashboard/dashboard-table";
import { SearchField } from "@/components/dashboard/search-field";
import { StatusPill } from "@/components/dashboard/status-pill";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { VISITS_PAGE_SIZE, visitListQuery } from "@/features/clinical/api/queries";
import {
  type ClinicalDashboard,
  type Visit,
  type VisitList,
  visitListLabels,
  visitStatusLabel,
} from "@/features/clinical/api/schemas";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ageOn, formatDayAndTime, maskHin } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/dashboard/skeletons";

const lists = Object.keys(visitListLabels) as VisitList[];

const emptyIn = {
  inpatient: "No one is admitted right now.",
  outpatient: "No one is checked in right now.",
  outpatient_discharge: "No one has been checked out yet.",
  inpatient_discharge: "No one has been discharged yet.",
} as const satisfies Record<VisitList, string>;

/** Each list's columns between Patient and View, as `detailsOf` fills them. */
const columnsOf = {
  inpatient: ["Ward · Bed", "Requested by", "Admitted", "Status"],
  outpatient: ["Checked in", "Status"],
  outpatient_discharge: ["Checked out by", "Checked out"],
  inpatient_discharge: ["Ward · Bed", "Discharged by", "Admitted", "Discharged"],
} as const satisfies Record<VisitList, readonly string[]>;

/**
 * The hospital's patients by where their visit stands (admitted, checked in, checked out,
 * discharged), searchable by name; each opens the visit's patient page.
 */
export function ClinicalPatients({
  dashboard,
  list,
  onListChange,
}: {
  dashboard: ClinicalDashboard;
  list: VisitList;
  onListChange: (list: VisitList) => void;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const term = useDebouncedValue(search.trim());
  const { data, isError } = useQuery(visitListQuery(list, term, page));
  // When the page opened, for "Today" and ages.
  const [now] = useState(() => new Date());
  const items = data?.items ?? [];
  const columns = columnsOf[list];

  const empty = isError
    ? "We couldn’t load the patients. Try again in a moment."
    : data?.items.length === 0 && (term ? "No patients match your search." : emptyIn[list]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="type-h4">Patient Management</h1>
        <p className="type-body-sm-regular text-fg-caption">
          The hospital’s patients, by where their visit stands.
        </p>
      </div>

      <section aria-label="Patients" className="@container rounded-xl border bg-card p-4">
        <header className="flex flex-wrap items-center gap-4">
          <SearchField
            size="lg"
            label="Search patients"
            placeholder="Search by patient name"
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            className="@3xl:w-80"
          />
        </header>

        <Tabs
          value={list}
          onValueChange={(next) => {
            onListChange(next as VisitList);
            setPage(1);
          }}
          className="mt-2 gap-0"
        >
          <CountTabsList className="-mx-4 w-auto px-4">
            {lists.map((value) => (
              <CountTab key={value} value={value} count={value === list ? data?.total : undefined}>
                {visitListLabels[value]}
              </CountTab>
            ))}
          </CountTabsList>
        </Tabs>

        <div className="hidden @4xl:block">
          <DashboardTable
            className="type-body-sm-regular [&_tbody_tr:last-child]:border-b"
            columns={[
              { label: "Patient", className: "type-body-sm-regular" },
              ...columns.map((label) => ({ label, className: "w-[16%] type-body-sm-regular" })),
              { label: "Actions", hideLabel: true, className: "w-24" },
            ]}
            loading={!data}
            empty={empty}
          >
            {items.map((visit) => (
              <TableRow key={visit.id}>
                <TableCell>
                  <Patient visit={visit} now={now} />
                </TableCell>
                {detailsOf(visit, now).map((detail, index) => (
                  <TableCell key={columns[index]} className="whitespace-normal">
                    {detail}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <ViewButton dashboard={dashboard} visit={visit} />
                </TableCell>
              </TableRow>
            ))}
          </DashboardTable>
        </div>

        <div className="mt-4 border-t @4xl:hidden">
          {empty ? (
            <EmptyState compact description={empty} />
          ) : !data ? (
            <ListSkeleton className="py-4" />
          ) : (
            <ul aria-label="Patients">
              {items.map((visit) => (
                <li key={visit.id} className="flex flex-col gap-3 border-b px-1 py-3">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1 type-body-sm-regular">
                      <Patient visit={visit} now={now} />
                    </div>
                    <ViewButton dashboard={dashboard} visit={visit} />
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 pl-10 @md:grid-cols-4">
                    {detailsOf(visit, now).map((detail, index) => (
                      <div key={columns[index]} className="flex min-w-0 flex-col items-start gap-1">
                        <dt className="type-caption text-fg-caption">{columns[index]}</dt>
                        <dd className="max-w-full type-caption text-fg-heading">{detail}</dd>
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
            page={page}
            pageSize={VISITS_PAGE_SIZE}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </section>
    </div>
  );
}

/** A visit's details, in the order of its list's columns. */
function detailsOf(visit: Visit, now: Date): ReactNode[] {
  const ward = (
    <Lines key="ward" first={visit.ward ?? "—"} second={visit.bed && `Bed ${visit.bed}`} />
  );
  const status = <VisitStatus key="status" status={visit.status} />;
  switch (visit.list) {
    case "inpatient":
      return [
        ward,
        visit.requestedBy ?? "—",
        <When key="in" at={visit.startedAt} now={now} />,
        status,
      ];
    case "outpatient":
      return [<When key="in" at={visit.startedAt} now={now} />, status];
    case "outpatient_discharge":
      return [visit.endedBy ?? "—", <When key="out" at={visit.endedAt} now={now} />];
    case "inpatient_discharge":
      return [
        ward,
        visit.endedBy ?? "—",
        <When key="in" at={visit.startedAt} now={now} />,
        <When key="out" at={visit.endedAt} now={now} />,
      ];
  }
}

/** A visit's status as a pill: amber while it needs someone, green once it's done. */
export function VisitStatus({ status }: { status: string | null }) {
  const label = visitStatusLabel(status);
  if (!label) return <>—</>;
  const tone =
    status === "awaiting_nurse_discharge" || status === "pending" || status === "doctor_idle"
      ? "warning"
      : status === "discharged" || status === "closed" || status === "doctor_seen"
        ? "success"
        : "info";
  return <StatusPill tone={tone}>{label}</StatusPill>;
}

function Patient({ visit, now }: { visit: Visit; now: Date }) {
  const { patient } = visit;
  return (
    <PersonCell
      name={patient.name}
      avatarUrl={null}
      detail={[
        `HIN ${maskHin(patient.hin)}`,
        `${ageOn(new Date(patient.dateOfBirth), now)} yrs`,
        patient.sex !== "prefer_not_to_say" && (patient.sex === "male" ? "Male" : "Female"),
      ]
        .filter(Boolean)
        .join(" · ")}
    />
  );
}

function ViewButton({ dashboard, visit }: { dashboard: ClinicalDashboard; visit: Visit }) {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="gap-1 bg-card type-caption-semibold font-sans text-fg-heading"
    >
      <Link
        to={
          dashboard === "doctor"
            ? "/hospital/doctor/patients/$visitId"
            : "/hospital/nurse/patients/$visitId"
        }
        params={{ visitId: visit.id }}
        search={{ list: visit.list }}
        aria-label={`View ${visit.patient.name}`}
      >
        View
        <CaretRightIcon data-icon="inline-end" className="size-3" />
      </Link>
    </Button>
  );
}

function Lines({ first, second }: { first: ReactNode; second?: ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-fg-heading">{first}</span>
      {second && <span className="text-fg-caption">{second}</span>}
    </div>
  );
}

function When({ at, now }: { at: string | null; now: Date }) {
  if (!at) return <>—</>;
  const { day, time } = formatDayAndTime(new Date(at), now);
  return <Lines first={day} second={time} />;
}
