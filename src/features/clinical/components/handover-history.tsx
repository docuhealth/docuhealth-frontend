import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { StatusPill } from "@/components/dashboard/status-pill";
import { TablePagination } from "@/components/dashboard/table-pagination";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HANDOVERS_PAGE_SIZE,
  type HandoverRole,
  handoversQuery,
} from "@/features/clinical/api/handovers";
import { formatDayAndTime } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/dashboard/skeletons";

const directionLabels = { received: "Received", sent: "Sent" } as const;
type Direction = keyof typeof directionLabels;

/**
 * The handovers a doctor or nurse has given and taken, newest first; each opens to show what was
 * handed over. A nurse's come as received or sent; a doctor's come together, each marked.
 */
export function HandoverHistory({ staff: role, myId }: { staff: HandoverRole; myId: string }) {
  const [direction, setDirection] = useState<Direction>("received");
  const [page, setPage] = useState(1);
  const { data, isError } = useQuery(handoversQuery(role, direction, page));
  // When the page opened, for "Today" and "Yesterday".
  const [now] = useState(() => new Date());

  const empty = isError
    ? "We couldn’t load the handovers. Try again in a moment."
    : data?.items.length === 0 && "No handovers yet.";

  return (
    <section aria-label="Handovers" className="rounded-xl border bg-card px-4 py-3">
      <div className="flex min-h-9 items-center justify-between gap-3 pb-2">
        <h2 className="type-h5">
          {role === "nurse" ? directionLabels[direction] : "All handovers"}
        </h2>
        {role === "nurse" && (
          <FilterSelect
            label="Handovers"
            size="sm"
            value={direction}
            options={directionLabels}
            onChange={(next) => {
              setDirection(next);
              setPage(1);
            }}
          />
        )}
      </div>
      {empty || !data ? (
        <div>
          {empty ? <EmptyState compact description={empty} /> : <ListSkeleton className="py-4" />}
        </div>
      ) : (
        <Accordion type="multiple" className="flex flex-col border-t">
          {data.items.map((handover) => {
            const sent = role === "nurse" ? direction === "sent" : handover.fromId === myId;
            const when = handover.at && formatDayAndTime(new Date(handover.at), now);
            const colleague = sent
              ? handover.to && `To ${handover.to}`
              : handover.from && `From ${handover.from}`;
            return (
              <AccordionItem key={handover.id} value={handover.id}>
                <AccordionTrigger className="gap-3 py-3 hover:no-underline">
                  <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="type-body-sm-medium text-fg-heading">
                        {handover.patientName}
                      </span>
                      {role === "doctor" && (
                        <StatusPill tone={sent ? "neutral" : "info"}>
                          {sent ? "Sent" : "Received"}
                        </StatusPill>
                      )}
                    </span>
                    <span className="type-caption text-fg-caption">
                      {[`HIN ${handover.hin}`, colleague, when && `${when.day}, ${when.time}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <dl className="flex flex-col divide-y rounded-lg border">
                    {handover.sections.map(({ label, text }) => (
                      <div
                        key={label}
                        className="grid gap-1 px-4 py-2.5 sm:grid-cols-[14rem_1fr] sm:gap-3"
                      >
                        <dt className="type-body-sm-regular text-fg-caption">{label}</dt>
                        <dd className="type-body-sm-regular break-words whitespace-pre-line text-fg-heading">
                          {text}
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
      {data && !isError && data.total > HANDOVERS_PAGE_SIZE && (
        <TablePagination
          page={page}
          pageSize={HANDOVERS_PAGE_SIZE}
          total={data.total}
          onPageChange={setPage}
        />
      )}
    </section>
  );
}
