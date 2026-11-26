import { CaretRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { RECORDS_PAGE_SIZE, visitRecordsQuery } from "@/features/clinical/api/queries";
import type { Visit, VisitRecord } from "@/features/clinical/api/schemas";
import { RecordEventDialog } from "@/features/clinical/components/record-event-dialog";
import { formatDayAndTime } from "@/lib/format";

/**
 * Everything recorded during the visit (notes, vitals, results, drugs, discharge forms), newest
 * first; each opens in a dialog to show the record in full.
 */
export function VisitRecords({ visit }: { visit: Pick<Visit, "id" | "kind"> }) {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<VisitRecord | null>(null);
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
      <ul className="flex flex-col divide-y">
        {data?.items.map((record) => {
          const { day, time } = formatDayAndTime(new Date(record.at), now);
          return (
            <li key={record.id}>
              <button
                type="button"
                onClick={() => setOpen(record)}
                className="flex w-full items-center gap-3 rounded-md py-3.5 text-left outline-none hover:bg-surface focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                  <span className="type-body-sm-medium text-fg-heading">{record.title}</span>
                  <span className="type-caption text-fg-caption">
                    {[record.by, `${day}, ${time}`].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <CaretRightIcon aria-hidden className="size-4 shrink-0 text-fg-caption" />
              </button>
            </li>
          );
        })}
      </ul>
      {data && data.total > RECORDS_PAGE_SIZE && (
        <TablePagination
          page={page}
          pageSize={RECORDS_PAGE_SIZE}
          total={data.total}
          onPageChange={setPage}
        />
      )}
      <RecordEventDialog record={open} onClose={() => setOpen(null)} />
    </div>
  );
}
