import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CountTab, CountTabsList } from "@/components/dashboard/count-tabs";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { Tabs } from "@/components/ui/tabs";
import {
  type LabReview,
  labReviewQuery,
  REVIEW_PAGE_SIZE,
  type ScanReview,
  scanReviewQuery,
} from "@/features/doctor/api/results";
import { ReviewButtons } from "@/features/doctor/components/review-buttons";
import { formatDayAndTime } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/dashboard/skeletons";

const tabLabels = { lab: "Lab results", scans: "Scan reports" } as const;
type Tab = keyof typeof tabLabels;

/**
 * Results waiting for the doctor: lab results the lab admin has approved, and scan reports. Each
 * is approved, or rejected with a reason.
 */
export function ResultReview() {
  const [tab, setTab] = useState<Tab>("lab");
  const [page, setPage] = useState(1);
  const lab = useQuery(labReviewQuery(tab === "lab" ? page : 1));
  const scans = useQuery(scanReviewQuery(tab === "scans" ? page : 1));
  // When the page opened, for "Today" and "Yesterday".
  const [now] = useState(() => new Date());
  const current = tab === "lab" ? lab : scans;

  const empty = current.isError
    ? "We couldn’t load the results. Try again in a moment."
    : current.data?.items.length === 0 && "Nothing is waiting for your review.";

  return (
    <section aria-label="Results to review" className="rounded-xl border bg-card p-4">
      <Tabs
        value={tab}
        onValueChange={(next) => {
          setTab(next as Tab);
          setPage(1);
        }}
        className="gap-0"
      >
        <CountTabsList className="-mx-4 w-auto px-4">
          <CountTab value="lab" count={lab.data?.total}>
            {tabLabels.lab}
          </CountTab>
          <CountTab value="scans" count={scans.data?.total}>
            {tabLabels.scans}
          </CountTab>
        </CountTabsList>
      </Tabs>

      {empty || !current.data ? (
        <div>
          {empty ? <EmptyState compact description={empty} /> : <ListSkeleton className="py-4" />}
        </div>
      ) : (
        <ul className="flex flex-col divide-y">
          {tab === "lab"
            ? (lab.data?.items ?? []).map((item) => <LabItem key={item.id} item={item} now={now} />)
            : (scans.data?.items ?? []).map((item) => (
                <ScanItem key={item.id} item={item} now={now} />
              ))}
        </ul>
      )}
      {current.data && current.data.total > REVIEW_PAGE_SIZE && (
        <TablePagination
          page={page}
          pageSize={REVIEW_PAGE_SIZE}
          total={current.data.total}
          onPageChange={setPage}
        />
      )}
    </section>
  );
}

const when = (at: string | null, now: Date) => {
  if (!at) return null;
  const { day, time } = formatDayAndTime(new Date(at), now);
  return `${day}, ${time}`;
};

function LabItem({ item, now }: { item: LabReview; now: Date }) {
  const collected = when(item.collectedAt, now);
  return (
    <li className="flex flex-col gap-3 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="type-body-sm-medium text-fg-heading">{item.test}</h3>
          <p className="type-caption text-fg-caption">
            {/* TODO(api): the review list doesn't say whose test it is. */}
            {["Patient —", collected && `Sample taken ${collected}`].filter(Boolean).join(" · ")}
          </p>
        </div>
        <ReviewButtons kind="lab" id={item.id} name={`the ${item.test} result`} />
      </div>
      {item.values.length > 0 ? (
        <dl className="grid grid-cols-1 gap-x-4 gap-y-1 rounded-lg border px-4 py-3 sm:grid-cols-2">
          {item.values.map(({ name, value }) => (
            <div key={name} className="flex justify-between gap-3">
              <dt className="type-body-sm-regular text-fg-caption">{name}</dt>
              <dd className="type-body-sm-medium text-fg-heading">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="type-body-sm-regular text-fg-caption">The result’s values aren’t attached.</p>
      )}
      {item.interpretation && (
        <p className="type-body-sm-regular text-fg-body">{item.interpretation}</p>
      )}
    </li>
  );
}

function ScanItem({ item, now }: { item: ScanReview; now: Date }) {
  const reported = when(item.reportedAt, now);
  return (
    <li className="flex flex-col gap-3 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="type-body-sm-medium text-fg-heading">{item.scan}</h3>
          <p className="type-caption text-fg-caption">
            {[
              `${item.patient.name} · HIN ${item.patient.hin}`,
              item.reporter && `Reported by ${item.reporter}`,
              reported,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <ReviewButtons kind="scan" id={item.id} name={`the ${item.scan} report`} />
      </div>
      <dl className="flex flex-col divide-y rounded-lg border">
        {item.sections.map(({ label, text }) => (
          <div key={label} className="grid gap-1 px-4 py-2.5 sm:grid-cols-[12rem_1fr] sm:gap-3">
            <dt className="type-body-sm-regular text-fg-caption">{label}</dt>
            <dd className="type-body-sm-regular break-words whitespace-pre-line text-fg-heading">
              {text}
            </dd>
          </div>
        ))}
      </dl>
    </li>
  );
}
