import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { StatusPill } from "@/components/dashboard/status-pill";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { LAB_ORDERS_PAGE_SIZE, labOrdersQuery } from "@/features/doctor/api/queries";
import type { LabOrder } from "@/features/doctor/api/schemas";
import { ReviewButtons } from "@/features/doctor/components/review-buttons";
import { formatDayAndTime } from "@/lib/format";

/** A test's status in words, and how it's colored. */
const testStatus: Record<
  string,
  { label: string; tone: "warning" | "info" | "success" | "error" }
> = {
  pending: { label: "Waiting for the lab", tone: "warning" },
  in_progress: { label: "In progress", tone: "info" },
  sample_collected: { label: "Sample taken", tone: "info" },
  result_ready: { label: "Awaiting lab approval", tone: "info" },
  result_accepted_by_lab_admin: { label: "Ready for your review", tone: "warning" },
  result_accepted_by_doctor: { label: "Reviewed", tone: "success" },
  rejected: { label: "Rejected", tone: "error" },
};

/**
 * The patient's lab tests at this hospital, newest first, with results once they're in; one the
 * lab admin has approved waits for the doctor to approve or reject.
 */
export function LabResults({ hin }: { hin: string }) {
  const [page, setPage] = useState(1);
  const { data, isError } = useQuery(labOrdersQuery(hin, page));
  // When the page opened, for "Today" and "Yesterday".
  const [now] = useState(() => new Date());

  const empty = isError
    ? "We couldn’t load the lab tests. Try again in a moment."
    : data?.items.length === 0 && "No lab tests ordered yet.";

  return (
    <section aria-label="Lab results" className="flex flex-col gap-4">
      {empty || !data ? (
        <p className="rounded-xl border bg-card py-10 text-center type-body-sm-regular text-fg-caption">
          {empty || "Loading…"}
        </p>
      ) : (
        data.items.map((order) => <OrderCard key={order.id} order={order} now={now} />)
      )}
      {data && data.total > LAB_ORDERS_PAGE_SIZE && (
        <TablePagination
          page={page}
          pageSize={LAB_ORDERS_PAGE_SIZE}
          total={data.total}
          onPageChange={setPage}
        />
      )}
    </section>
  );
}

function OrderCard({ order, now }: { order: LabOrder; now: Date }) {
  const { day, time } = formatDayAndTime(new Date(order.at), now);
  return (
    <article className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <header className="flex flex-col gap-0.5">
        <h3 className="type-body-sm-medium text-fg-heading">
          {order.tests.map(({ name }) => name).join(", ")}
        </h3>
        <p className="type-caption text-fg-caption">
          {[order.orderedBy && `Ordered by ${order.orderedBy}`, `${day}, ${time}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>
      <ul className="flex flex-col divide-y rounded-lg border">
        {order.tests.map((test) => {
          const status = testStatus[test.status] ?? { label: test.status, tone: "info" as const };
          return (
            <li key={test.id} className="flex flex-col gap-2 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="type-body-sm-medium text-fg-heading">{test.name}</span>
                <StatusPill tone={status.tone}>{status.label}</StatusPill>
              </div>
              {test.values.length > 0 && (
                <dl className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
                  {test.values.map(({ name, value }) => (
                    <div key={name} className="flex justify-between gap-3">
                      <dt className="type-body-sm-regular text-fg-caption">{name}</dt>
                      <dd className="type-body-sm-medium text-fg-heading">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {test.interpretation && (
                <p className="type-body-sm-regular text-fg-body">{test.interpretation}</p>
              )}
              {test.status === "result_accepted_by_lab_admin" && (
                <ReviewButtons kind="lab" id={test.id} name={`the ${test.name} result`} />
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
