import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TablePagination } from "@/components/dashboard/table-pagination";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RECORDS_PAGE_SIZE, visitRecordsQuery } from "@/features/clinical/api/queries";
import type { Visit } from "@/features/clinical/api/schemas";
import { formatDayAndTime } from "@/lib/format";

/**
 * Everything recorded during the visit (notes, vitals, results, drugs, discharge forms), newest
 * first; each opens to show what was recorded.
 */
export function VisitRecords({ visit }: { visit: Pick<Visit, "id" | "kind"> }) {
  const [page, setPage] = useState(1);
  const { data, isError } = useQuery(visitRecordsQuery(visit.kind, visit.id, page));
  // When the page opened, for "Today" and "Yesterday".
  const [now] = useState(() => new Date());

  if (isError) {
    return (
      <p className="py-10 text-center type-body-sm-regular text-fg-caption">
        We couldn’t load the visit’s records. Try again in a moment.
      </p>
    );
  }
  if (data?.items.length === 0) {
    return (
      <p className="py-10 text-center type-body-sm-regular text-fg-caption">
        Nothing has been recorded during this visit yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      <Accordion type="multiple" className="flex flex-col">
        {data?.items.map((record) => {
          const { day, time } = formatDayAndTime(new Date(record.at), now);
          return (
            <AccordionItem key={record.id} value={record.id}>
              <AccordionTrigger className="gap-3 py-3.5 hover:no-underline">
                <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left">
                  <span className="type-body-sm-medium text-fg-heading">{record.title}</span>
                  <span className="type-caption text-fg-caption">
                    {[record.by, `${day}, ${time}`].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                {record.details.length === 0 ? (
                  <p className="pb-2 type-body-sm-regular text-fg-caption">No details recorded.</p>
                ) : (
                  <dl className="flex flex-col divide-y rounded-lg border">
                    {record.details.map(({ label, value }) => (
                      <div
                        key={label}
                        className="grid gap-1 px-4 py-2.5 sm:grid-cols-[12rem_1fr] sm:gap-3"
                      >
                        <dt className="type-body-sm-regular text-fg-caption">{label}</dt>
                        <dd className="type-body-sm-regular break-words whitespace-pre-line text-fg-heading">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      {data && data.total > RECORDS_PAGE_SIZE && (
        <TablePagination
          page={page}
          pageSize={RECORDS_PAGE_SIZE}
          total={data.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
