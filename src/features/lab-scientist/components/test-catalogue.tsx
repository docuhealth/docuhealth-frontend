import { PlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardTable } from "@/components/dashboard/dashboard-table";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { SearchField } from "@/components/dashboard/search-field";
import { StatusPill } from "@/components/dashboard/status-pill";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  TEST_CATALOGUE_PAGE_SIZE,
  testCategoriesQuery,
  testCatalogueQuery,
} from "@/features/lab-scientist/api/queries";
import {
  type CatalogueTest,
  resultFormatLabels,
  turnaroundFromHours,
  unitLabels,
} from "@/features/lab-scientist/api/schemas";
import { TestDetailsDialog } from "@/features/lab-scientist/components/test-details-dialog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useIsFacilityAdmin } from "@/stores/auth-store";

const ALL = "all";

/** Columns that only show once the card is wide enough. */
const columns = {
  category: "hidden @xl:table-cell w-40",
  result: "hidden @3xl:table-cell w-44",
  turnaround: "hidden @lg:table-cell w-36",
  status: "w-28",
  action: "w-24",
};

/**
 * DocuHealth's test catalogue as the lab sees it: each test, and whether (and how) the lab has
 * set it up. Every lab scientist can read it; the lab's admin adds tests (sets them up for the
 * lab) and edits them. TODO(api): tests have no price, so none is shown or set.
 */
export function TestCatalogue() {
  const admin = useIsFacilityAdmin();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL);
  const [page, setPage] = useState(1);
  const term = useDebouncedValue(search.trim());
  const { data: categories } = useQuery(testCategoriesQuery());
  const { data, isError } = useQuery(
    testCatalogueQuery({
      search: term,
      category: category === ALL ? "" : category,
      page,
      pageSize: TEST_CATALOGUE_PAGE_SIZE,
    }),
  );
  // Which test the dialog is for: `null` to pick one (Add test).
  const [dialog, setDialog] = useState<{ test: CatalogueTest | null } | null>(null);

  const categoryOptions: Record<string, string> = {
    [ALL]: "All categories",
    ...Object.fromEntries((categories ?? []).map(({ id, name }) => [id, name])),
  };

  const empty = isError
    ? "We couldn’t load the test catalogue. Try again in a moment."
    : data?.items.length === 0 &&
      (term ? `No tests match “${term}”.` : "There are no tests in this category yet.");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="type-h4">Test catalogue</h1>
          <p className="type-body-sm-regular text-fg-caption">
            {admin
              ? "The tests your lab runs: how each result is reported, how long it takes and its normal ranges."
              : "The tests your lab runs, and how each result is reported. Your lab’s admin manages them."}
          </p>
        </div>
        {admin && (
          <Button
            className="h-12 w-full gap-2 px-5 type-heading-sm sm:w-auto"
            onClick={() => setDialog({ test: null })}
          >
            <PlusIcon data-icon="inline-start" />
            Add test
          </Button>
        )}
      </div>

      <section aria-label="Tests" className="@container rounded-xl border bg-card p-4">
        <header className="flex flex-wrap items-center gap-4">
          <SearchField
            size="lg"
            label="Search tests"
            placeholder="Search by test, category or parameter"
            value={search}
            onChange={(next) => {
              setSearch(next);
              setPage(1);
            }}
            className="@3xl:w-96"
          />
          <FilterSelect
            label="Category"
            value={category}
            options={categoryOptions}
            onChange={(next) => {
              setCategory(next);
              setPage(1);
            }}
            className="w-full @3xl:ml-auto @3xl:w-auto"
          />
        </header>

        <DashboardTable
          className="type-body-sm-regular"
          columns={[
            { label: "Test", className: "type-body-sm-regular" },
            { label: "Category", className: `${columns.category} type-body-sm-regular` },
            { label: "Result", className: `${columns.result} type-body-sm-regular` },
            { label: "Turnaround", className: `${columns.turnaround} type-body-sm-regular` },
            { label: "Status", className: `${columns.status} type-body-sm-regular` },
            ...(admin ? [{ label: "Actions", hideLabel: true, className: columns.action }] : []),
          ]}
          loading={!data}
          empty={empty}
        >
          {data?.items.map((test) => (
            <TableRow key={test.id}>
              <TableCell className="whitespace-normal">
                <p className="text-fg-heading">{test.name}</p>
                {/* Where the Category column is hidden, it goes under the name. */}
                <p className="type-caption text-fg-caption @xl:hidden">
                  {test.category?.name ?? "—"}
                </p>
              </TableCell>
              <TableCell className={columns.category}>{test.category?.name ?? "—"}</TableCell>
              <TableCell className={`${columns.result} whitespace-normal`}>
                {test.details
                  ? `${resultFormatLabels[test.details.resultFormat]} · ${unitLabels[test.details.unit]}`
                  : "—"}
              </TableCell>
              <TableCell
                className={`${columns.turnaround} whitespace-normal ${test.details ? "" : "text-fg-caption"}`}
              >
                {turnaroundOf(test)}
              </TableCell>
              <TableCell>
                {test.details ? (
                  <StatusPill tone="success">Set up</StatusPill>
                ) : (
                  <StatusPill tone="neutral">Not set up</StatusPill>
                )}
              </TableCell>
              {admin && (
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`${test.details ? "Edit" : "Set up"} ${test.name}`}
                    onClick={() => setDialog({ test })}
                    className="bg-card type-caption-semibold font-sans text-fg-heading"
                  >
                    {test.details ? "Edit" : "Set up"}
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </DashboardTable>

        {data && data.total > 0 && (
          <TablePagination
            page={page}
            pageSize={TEST_CATALOGUE_PAGE_SIZE}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </section>

      <TestDetailsDialog
        open={!!dialog}
        onOpenChange={(open) => !open && setDialog(null)}
        test={dialog?.test ?? null}
      />
    </div>
  );
}

/** The lab's own turnaround, or the catalogue's usual one until the lab sets it. */
function turnaroundOf(test: CatalogueTest) {
  if (test.details) return test.details.turnaround || "—";
  return test.defaultTurnaroundHours
    ? `Usually ${turnaroundFromHours(test.defaultTurnaroundHours)}`
    : "—";
}
