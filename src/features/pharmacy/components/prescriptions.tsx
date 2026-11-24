import { CaretRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { CountTab, CountTabsList } from "@/components/dashboard/count-tabs";
import { DashboardTable, PersonCell } from "@/components/dashboard/dashboard-table";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import {
  PRESCRIPTIONS_PAGE_SIZE,
  type PrescriptionSort,
  type PrescriptionTab,
  prescriptionListQuery,
} from "@/features/pharmacy/api/queries";
import type { Prescription } from "@/features/pharmacy/api/schemas";
import { PrescriptionStatusPill } from "@/features/pharmacy/components/prescription-status";
import { ageOn, formatDayAndTime, maskHin } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/dashboard/skeletons";

const tabLabels = { pending: "Pending", settled: "Settled" } as const satisfies Record<
  PrescriptionTab,
  string
>;
const tabs = Object.keys(tabLabels) as PrescriptionTab[];

const sortLabels = { latest: "Latest", oldest: "Oldest" } as const satisfies Record<
  PrescriptionSort,
  string
>;

const emptyIn = {
  pending: "No prescriptions are waiting to be dispensed.",
  settled: "No prescriptions have been settled yet.",
} as const satisfies Record<PrescriptionTab, string>;

/** "Paracetamol, Amoxicillin +1". */
function drugSummary(prescription: Prescription) {
  const [first, second, ...rest] = prescription.drugs.map(({ name }) => name);
  return [first, second].filter(Boolean).join(", ") + (rest.length ? ` +${rest.length}` : "");
}

/**
 * Doctors' prescriptions for the pharmacy: those still to dispense, and those settled (every
 * drug dispensed or marked unavailable). Each opens its page, where drugs are dispensed.
 */
export function Prescriptions() {
  const [tab, setTab] = useState<PrescriptionTab>("pending");
  const [sort, setSort] = useState<PrescriptionSort>("latest");
  const [page, setPage] = useState(1);
  const { data, isError } = useQuery(prescriptionListQuery(tab, sort, page));
  // When the page opened, for "Today" and ages.
  const [now] = useState(() => new Date());
  const items = data?.items ?? [];

  const empty = isError
    ? "We couldn’t load the prescriptions. Try again in a moment."
    : data?.items.length === 0 && emptyIn[tab];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="type-h4">Prescriptions</h1>
        <p className="type-body-sm-regular text-fg-caption">
          Doctors’ prescriptions for your patients.
        </p>
      </div>

      <section aria-label="Prescriptions" className="@container rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <Tabs
            value={tab}
            onValueChange={(next) => {
              setTab(next as PrescriptionTab);
              setPage(1);
            }}
            className="gap-0"
          >
            <CountTabsList>
              {tabs.map((value) => (
                <CountTab key={value} value={value} count={data?.counts[value]}>
                  {tabLabels[value]}
                </CountTab>
              ))}
            </CountTabsList>
          </Tabs>
          <FilterSelect
            label="Sort"
            size="sm"
            value={sort}
            options={sortLabels}
            display={(chosen) => `Sort: ${sortLabels[chosen]}`}
            onChange={(next) => {
              setSort(next);
              setPage(1);
            }}
            highlight
          />
        </div>

        <div className="hidden @3xl:block">
          <DashboardTable
            className="type-body-sm-regular [&_tbody_tr:last-child]:border-b"
            columns={[
              { label: "Patient", className: "type-body-sm-regular" },
              { label: "Medications", className: "w-[24%] type-body-sm-regular" },
              { label: "Prescribed by", className: "w-[18%] type-body-sm-regular" },
              { label: "Prescribed", className: "w-32 type-body-sm-regular" },
              { label: "Status", className: "w-32 type-body-sm-regular" },
              { label: "Actions", hideLabel: true, className: "w-24" },
            ]}
            loading={!data}
            empty={empty}
          >
            {items.map((prescription) => (
              <TableRow key={prescription.id}>
                <TableCell>
                  <Patient prescription={prescription} now={now} />
                </TableCell>
                <TableCell className="whitespace-normal">
                  <Medications prescription={prescription} />
                </TableCell>
                <TableCell className="whitespace-normal">{prescription.orderedBy ?? "—"}</TableCell>
                <TableCell>
                  <When at={prescription.createdAt} now={now} />
                </TableCell>
                <TableCell>
                  <PrescriptionStatusPill status={prescription.status} />
                </TableCell>
                <TableCell className="text-right">
                  <ViewButton prescription={prescription} />
                </TableCell>
              </TableRow>
            ))}
          </DashboardTable>
        </div>

        <div className="mt-4 border-t @3xl:hidden">
          {empty ? (
            <EmptyState compact description={empty} />
          ) : !data ? (
            <ListSkeleton className="py-4" />
          ) : (
            <ul aria-label="Prescriptions">
              {items.map((prescription) => (
                <li key={prescription.id} className="flex flex-col gap-3 border-b px-1 py-3">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1 type-body-sm-regular">
                      <Patient prescription={prescription} now={now} />
                    </div>
                    <ViewButton prescription={prescription} />
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 pl-10 @md:grid-cols-4">
                    <Detail label="Medications">
                      <Medications prescription={prescription} />
                    </Detail>
                    <Detail label="Prescribed by">{prescription.orderedBy ?? "—"}</Detail>
                    <Detail label="Prescribed">
                      <When at={prescription.createdAt} now={now} />
                    </Detail>
                    <Detail label="Status">
                      <PrescriptionStatusPill status={prescription.status} />
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
            pageSize={PRESCRIPTIONS_PAGE_SIZE}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </section>
    </div>
  );
}

function Patient({ prescription, now }: { prescription: Prescription; now: Date }) {
  const { patient } = prescription;
  return (
    <PersonCell
      name={patient.name}
      avatarUrl={null}
      detail={[
        `HIN ${maskHin(patient.hin)}`,
        patient.dateOfBirth && `${ageOn(new Date(patient.dateOfBirth), now)} yrs`,
      ]
        .filter(Boolean)
        .join(" · ")}
    />
  );
}

function Medications({ prescription }: { prescription: Prescription }) {
  const count = prescription.drugs.length;
  return (
    <div className="flex flex-col">
      <span className="text-fg-heading">
        {count} {count === 1 ? "medication" : "medications"}
      </span>
      <span className="text-fg-caption">{drugSummary(prescription)}</span>
    </div>
  );
}

function ViewButton({ prescription }: { prescription: Prescription }) {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="gap-1 bg-card type-caption-semibold font-sans text-fg-heading"
    >
      <Link
        to="/hospital/pharmacy/prescriptions/$prescriptionId"
        params={{ prescriptionId: prescription.id }}
        aria-label={`View ${prescription.patient.name}’s prescription`}
      >
        View
        <CaretRightIcon data-icon="inline-end" className="size-3" />
      </Link>
    </Button>
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

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-1">
      <dt className="type-caption text-fg-caption">{label}</dt>
      <dd className="max-w-full type-caption text-fg-heading">{children}</dd>
    </div>
  );
}
