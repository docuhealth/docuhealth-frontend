import { CaretLeftIcon, CaretRightIcon, TestTubeIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { CountTab, CountTabsList } from "@/components/dashboard/count-tabs";
import { DashboardTable, PersonCell } from "@/components/dashboard/dashboard-table";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { PeriodSelect } from "@/components/dashboard/period-select";
import { SearchField } from "@/components/dashboard/search-field";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { TEST_RECORDS_PAGE_SIZES, testRecordListQuery } from "@/features/lab-scientist/api/queries";
import {
  type TestRecord,
  type TestSort,
  testSortLabels,
  type TestTab,
  testStageLabels,
  testTabLabels,
  sexLabel,
} from "@/features/lab-scientist/api/schemas";
import {
  CalendarIcon,
  GridViewIcon,
  ListViewIcon,
  UnfoldMoreIcon,
  UserIcon,
} from "@/components/hugeicons";
import { TestStatusTag } from "@/features/lab-scientist/components/status-tag";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ageOn, formatDateDotTime, formatDayAndTime, maskHin } from "@/lib/format";
import type { Period } from "@/lib/period";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/dashboard/skeletons";
import { useIsFacilityAdmin } from "@/stores/auth-store";

const stages = Object.keys(testStageLabels) as TestTab[];

type View = "list" | "grid";

// The design's layout on wide cards: Patient ~27%, the details sharing what's left.
const columns = {
  test: "w-[17%]",
  requestedBy: "w-[17%]",
  requestedOn: "w-[17%]",
  status: "w-28",
  action: "w-24",
};

const emptyIn = {
  pending: "No pending tests.",
  in_progress: "No tests in progress.",
  completed: "No completed tests yet.",
  rejected: "No rejected test orders.",
  result_approval: "No results are waiting for your approval.",
} as const satisfies Record<TestTab, string>;

/**
 * Every test order sent to the lab in the period, by stage, searchable and sortable; as a table
 * (a list on narrow cards) or a grid of cards. The Test orders page heads it.
 */
export function TestRecords({
  period,
  onPeriodChange,
}: {
  period: Period;
  onPeriodChange: (period: Period) => void;
}) {
  const [stage, setStage] = useState<TestTab>("pending");
  // The lab's admin also gets a Result Approval tab (as in v1).
  const admin = useIsFacilityAdmin();
  const tabs = admin ? [...stages, "result_approval" as const] : stages;
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<TestSort>("latest");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<View>("list");
  const pageSize = TEST_RECORDS_PAGE_SIZES[view];
  const term = useDebouncedValue(search.trim());
  const { data, isError } = useQuery(
    testRecordListQuery({ stage, search: term, sort, page, pageSize, period }),
  );
  // When the page opened, for "Today", ages and how long orders have waited.
  const [now] = useState(() => new Date());
  const items = data?.items ?? [];

  const empty = isError
    ? "We couldn’t load the test records. Try again in a moment."
    : data?.items.length === 0 && (term ? `No tests match “${term}”.` : emptyIn[stage]);

  const pageCount = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  function sortBy(next: TestSort) {
    setSort(next);
    setPage(1);
  }

  return (
    <section aria-label="Test orders" className="@container rounded-xl border bg-card p-4">
      <header className="flex flex-wrap items-center gap-4">
        <SearchField
          size="lg"
          label="Search test records"
          placeholder="Search by name, HIN or test"
          value={search}
          onChange={(next) => {
            setSearch(next);
            setPage(1);
          }}
          className="@3xl:w-96"
        />
        {/* A touch tighter on the narrowest cards so "Sort by: …" fits beside the layout switch. */}
        <div className="flex w-full flex-wrap items-center gap-3 @sm:gap-4 @3xl:ml-auto @3xl:w-auto @3xl:flex-nowrap">
          {period && onPeriodChange && (
            // Its own row on narrow cards, so sort and the layout switch stay together below it.
            <div className="flex-1 basis-full *:w-full @md:basis-auto @3xl:flex-none">
              <PeriodSelect
                value={period}
                onChange={(next) => {
                  onPeriodChange(next);
                  setPage(1);
                }}
              />
            </div>
          )}
          <FilterSelect
            label="Sort"
            value={sort}
            options={testSortLabels}
            display={(value) => `Sort by: ${testSortLabels[value]}`}
            onChange={sortBy}
            // Never narrower than its label: if it can't fit, the switch wraps instead.
            className="min-w-fit flex-1 @3xl:flex-none"
          />
          <ViewToggle
            value={view}
            onChange={(next) => {
              setView(next);
              setPage(1);
            }}
          />
          {/* The grid pages from up here instead of under the cards. */}
          {view === "grid" && (
            <div className="flex shrink-0 gap-4">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="size-12 bg-card text-fg-heading"
              >
                <CaretLeftIcon className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Next page"
                disabled={page >= pageCount}
                onClick={() => setPage(page + 1)}
                className="size-12 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
              >
                <CaretRightIcon className="size-5" />
              </Button>
            </div>
          )}
        </div>
      </header>

      <Tabs
        value={stage}
        onValueChange={(next) => {
          setStage(next as TestTab);
          setPage(1);
        }}
        className="mt-2 gap-0"
      >
        {/* Ruled edge to edge, past the card's padding. */}
        <CountTabsList className="-mx-4 w-auto px-4">
          {tabs.map((value) => (
            <CountTab key={value} value={value} count={data?.counts[value]}>
              {testTabLabels[value]}
            </CountTab>
          ))}
        </CountTabsList>
      </Tabs>

      {view === "grid" ? (
        <RecordGrid items={items} empty={empty} now={now} />
      ) : (
        <>
          <div className="hidden @4xl:block">
            <DashboardTable
              // The last row keeps its divider to separate the table from the pagination.
              className="type-body-sm-regular [&_tbody_tr:last-child]:border-b"
              columns={[
                { label: "Patient", className: "type-body-sm-regular" },
                { label: "Test", className: `${columns.test} type-body-sm-regular` },
                {
                  label: "Requested by",
                  className: `${columns.requestedBy} type-body-sm-regular`,
                },
                {
                  label: "Requested on",
                  className: `${columns.requestedOn} type-body-sm-regular`,
                  header: (
                    <button
                      type="button"
                      onClick={() => sortBy(sort === "latest" ? "oldest" : "latest")}
                      aria-label={`Requested on, ${testSortLabels[sort].toLowerCase()} first`}
                      className="inline-flex items-center gap-1 rounded-sm outline-none hover:text-fg-heading focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      Requested on
                      <UnfoldMoreIcon className="size-4" />
                    </button>
                  ),
                },
                { label: "Status", className: `${columns.status} type-body-sm-regular` },
                { label: "Actions", hideLabel: true, className: columns.action },
              ]}
              loading={!data}
              empty={empty}
            >
              {items.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <Patient patient={record.patient} now={now} />
                  </TableCell>
                  <TableCell className="whitespace-normal text-fg-heading">
                    {record.testType}
                  </TableCell>
                  <TableCell className="whitespace-normal">{record.requestedBy}</TableCell>
                  <TableCell>
                    <RequestedOn record={record} now={now} />
                  </TableCell>
                  <TableCell>
                    <TestStatusTag record={record} now={now} />
                  </TableCell>
                  <TableCell className="text-right">
                    <ViewButton record={record} />
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
              <ul aria-label="Test records">
                {items.map((record) => (
                  <li key={record.id} className="flex flex-col gap-3 border-b px-1 py-3">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1 type-body-sm-regular">
                        <Patient patient={record.patient} now={now} />
                      </div>
                      <ViewButton record={record} />
                    </div>
                    {/* Lined up under the name, past the avatar. */}
                    <Details
                      record={record}
                      now={now}
                      showStatus
                      className="pl-10 @xl:grid-cols-4"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {view === "list" && data && data.total > 0 && (
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={data.total}
          onPageChange={setPage}
        />
      )}
    </section>
  );
}

/** List / grid switch: two icon buttons in a grey track, the chosen one raised in white. */
function ViewToggle({ value, onChange }: { value: View; onChange: (view: View) => void }) {
  const options: { view: View; label: string; icon: ReactNode }[] = [
    { view: "grid", label: "Grid view", icon: <GridViewIcon className="size-5" /> },
    { view: "list", label: "List view", icon: <ListViewIcon className="size-5" /> },
  ];
  return (
    <fieldset className="flex shrink-0 gap-1 rounded-md bg-line p-1">
      <legend className="sr-only">Layout</legend>
      {options.map((option) => (
        <button
          key={option.view}
          type="button"
          aria-label={option.label}
          aria-pressed={value === option.view}
          onClick={() => onChange(option.view)}
          className={cn(
            "grid size-9 place-content-center rounded-sm text-fg-caption transition-colors outline-none hover:text-fg-heading focus-visible:ring-3 focus-visible:ring-ring/50 @sm:size-10",
            value === option.view && "bg-card text-primary shadow-xs hover:text-primary",
          )}
        >
          {option.icon}
        </button>
      ))}
    </fieldset>
  );
}

/** One card per order, as many to a row as the section fits (three on a wide page). */
function RecordGrid({ items, empty, now }: { items: TestRecord[]; empty: ReactNode; now: Date }) {
  if (empty) {
    return <EmptyState compact description={empty} />;
  }
  return (
    <ul
      aria-label="Test records"
      className="mt-4 grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3 @5xl:gap-6"
    >
      {items.map((record) => (
        <li key={record.id} className="flex flex-col gap-4 rounded-xl border p-5">
          {/* Unlike the table, the card wraps the patient's details rather than cutting them. */}
          <div className="flex items-start gap-3">
            <PersonAvatar name={record.patient.name} src={record.patient.avatarUrl} size="xl" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-1.5">
              <span className="type-body text-fg-heading">{record.patient.name}</span>
              <span className="type-body-sm-regular text-fg-caption">
                {patientDetail(record.patient, now)}
              </span>
            </div>
            <div className="shrink-0 pt-1.5">
              <TestStatusTag record={record} now={now} />
            </div>
          </div>
          <dl className="flex flex-col gap-3 border-y py-4">
            <CardDetail icon={<TestTubeIcon />} label="Test">
              {record.testType}
            </CardDetail>
            <CardDetail icon={<UserIcon />} label="Requested by">
              {record.requestedBy}
            </CardDetail>
            <CardDetail icon={<CalendarIcon />} label="Requested on">
              {formatDateDotTime(new Date(record.requestedAt))}
            </CardDetail>
          </dl>
          <Button
            asChild
            variant="outline"
            className="mt-auto h-12 gap-2 border-primary bg-card type-body-sm-medium text-primary hover:bg-primary/5 hover:text-primary"
          >
            <Link
              to="/hospital/lab-scientist/test-orders/$orderId"
              params={{ orderId: record.id }}
              aria-label={`View details of ${record.patient.name}’s ${record.testType}`}
            >
              View details
              <CaretRightIcon data-icon="inline-end" className="size-4" />
            </Link>
          </Button>
        </li>
      ))}
    </ul>
  );
}

/** A label with its icon on the left, its value on the right. */
function CardDetail({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex shrink-0 items-center gap-1.5 type-body-sm-regular text-fg-caption [&_svg]:size-4">
        {icon}
        {label}
      </dt>
      <dd className="min-w-0 text-right type-body text-fg-heading">{children}</dd>
    </div>
  );
}

/** The test, who asked for it and when (and, with `showStatus`, its status) as labelled pairs. */
function Details({
  record,
  now,
  showStatus,
  className,
}: {
  record: TestRecord;
  now: Date;
  showStatus?: boolean;
  className?: string;
}) {
  return (
    <dl className={cn("grid grid-cols-2 gap-x-4 gap-y-3", className)}>
      <Detail label="Test">{record.testType}</Detail>
      <Detail label="Requested by">{record.requestedBy}</Detail>
      <Detail label="Requested on">
        <RequestedOn record={record} now={now} />
      </Detail>
      {showStatus && (
        <Detail label="Status">
          <TestStatusTag record={record} now={now} />
        </Detail>
      )}
    </dl>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-1">
      <dt className="type-caption text-fg-caption">{label}</dt>
      <dd className="type-caption text-fg-heading">{children}</dd>
    </div>
  );
}

function Patient({ patient, now }: { patient: TestRecord["patient"]; now: Date }) {
  return (
    <PersonCell
      name={patient.name}
      avatarUrl={patient.avatarUrl}
      detail={patientDetail(patient, now)}
    />
  );
}

/** "HIN 54692 •••• · 52 yrs · Male". */
function patientDetail(patient: TestRecord["patient"], now: Date) {
  return [
    `HIN ${maskHin(patient.hin)}`,
    `${ageOn(new Date(patient.dateOfBirth), now)} yrs`,
    sexLabel(patient.sex),
  ]
    .filter(Boolean)
    .join(" · ");
}

function RequestedOn({ record, now }: { record: TestRecord; now: Date }) {
  const { day, time } = formatDayAndTime(new Date(record.requestedAt), now);
  return (
    <div className="flex flex-col">
      <span className="text-fg-heading">{day}</span>
      <span className="text-fg-caption">{time}</span>
    </div>
  );
}

function ViewButton({ record }: { record: TestRecord }) {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="gap-1 bg-card type-caption-semibold font-sans text-fg-heading"
    >
      <Link
        to="/hospital/lab-scientist/test-orders/$orderId"
        params={{ orderId: record.id }}
        aria-label={`View ${record.patient.name}’s ${record.testType}`}
      >
        View
        <CaretRightIcon data-icon="inline-end" className="size-3" />
      </Link>
    </Button>
  );
}
