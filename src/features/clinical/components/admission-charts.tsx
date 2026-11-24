import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useState } from "react";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { TablePagination } from "@/components/dashboard/table-pagination";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CHART_PAGE_SIZE, chartQuery, fluidBalanceQuery } from "@/features/clinical/api/queries";
import { type Chart, chartLabels } from "@/features/clinical/api/schemas";
import { formatDayAndTime } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/dashboard/skeletons";

const ml = (value: number) => `${value.toLocaleString("en-GB")} ml`;

/**
 * What's been recorded on an admitted patient's charts (vital signs, medications, fluids,
 * glucose, IV fluids, procedures, seizures), newest first, with today's fluid balance.
 */
export function AdmissionCharts({ admissionId }: { admissionId: string }) {
  const [chart, setChart] = useState<Chart>("vital-signs");
  const [page, setPage] = useState(1);
  const { data, error } = useQuery(chartQuery(admissionId, chart, page));
  const { data: balance } = useQuery(fluidBalanceQuery(admissionId));
  // When the page opened, for "Today" and "Yesterday".
  const [now] = useState(() => new Date());

  const empty = error
    ? isAxiosError(error) && error.response?.status === 403
      ? // TODO(api): the charts are the nurses' only, for now.
        "Only nurses can see the charts for now."
      : "We couldn’t load this chart. Try again in a moment."
    : data?.items.length === 0 && "Nothing is charted here yet.";

  return (
    <div className="flex flex-col gap-4">
      {balance && (
        <section
          aria-label="Today’s fluid balance"
          className="grid grid-cols-3 gap-3 rounded-xl border bg-card p-4"
        >
          {[
            ["Intake today", ml(balance.intake)],
            ["Output today", ml(balance.output)],
            ["Balance", `${balance.balance > 0 ? "+" : ""}${ml(balance.balance)}`],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="type-caption text-fg-caption">{label}</span>
              <span className="type-heading-sm text-fg-heading">{value}</span>
            </div>
          ))}
        </section>
      )}

      <section aria-label="Chart" className="rounded-xl border bg-card px-4 py-3">
        <div className="flex items-center justify-between gap-3 pb-2">
          <h3 className="type-h5">{chartLabels[chart]}</h3>
          <FilterSelect
            label="Chart"
            size="sm"
            value={chart}
            options={chartLabels}
            onChange={(next) => {
              setChart(next);
              setPage(1);
            }}
          />
        </div>
        {empty || !data ? (
          <div>
            {empty ? <EmptyState compact description={empty} /> : <ListSkeleton className="py-4" />}
          </div>
        ) : (
          <Accordion type="multiple" className="flex flex-col border-t">
            {data.items.map((entry) => {
              const when = entry.at && formatDayAndTime(new Date(entry.at), now);
              return (
                <AccordionItem key={entry.id} value={entry.id}>
                  <AccordionTrigger className="gap-3 py-3 hover:no-underline">
                    <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left">
                      <span className="type-body-sm-medium text-fg-heading">
                        {when ? `${when.day}, ${when.time}` : "Recorded"}
                      </span>
                      <span className="truncate type-caption text-fg-caption">
                        {[
                          entry.by,
                          entry.details
                            .slice(0, 2)
                            .map(({ value }) => value)
                            .join(" · "),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <dl className="flex flex-col divide-y rounded-lg border">
                      {entry.details.map(({ label, value }) => (
                        <div
                          key={label}
                          className="grid gap-1 px-4 py-2.5 sm:grid-cols-[12rem_1fr] sm:gap-3"
                        >
                          <dt className="type-body-sm-regular text-fg-caption">{label}</dt>
                          <dd className="type-body-sm-regular break-words text-fg-heading">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
        {data && data.total > CHART_PAGE_SIZE && (
          <TablePagination
            page={page}
            pageSize={CHART_PAGE_SIZE}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </section>
    </div>
  );
}
