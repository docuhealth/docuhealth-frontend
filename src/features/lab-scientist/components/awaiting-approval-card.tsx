import { ArrowRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { pendingApprovalsQuery } from "@/features/lab-scientist/api/queries";
import { PendingTag } from "@/features/lab-scientist/components/status-tag";
import { TestTubeBadge } from "@/features/lab-scientist/components/test-name";
import { formatDay, formatTime } from "@/lib/format";

/** How many results the card shows. */
const PREVIEW_ROWS = 6;

/** Results entered and waiting for approval, newest first. */
export function AwaitingApprovalCard() {
  const { data, isError } = useQuery(pendingApprovalsQuery());
  // When the page opened, for "Today" and "Yesterday".
  const [now] = useState(() => new Date());

  const empty = isError
    ? "We couldn’t load the results awaiting approval. Try again in a moment."
    : data?.items.length === 0 && "No results are waiting for approval.";

  return (
    <DashboardCard
      title="Awaiting Approval"
      className="p-5"
      action={
        <Link
          to="/hospital/lab-scientist/test-orders"
          className="flex items-center gap-1.5 type-body-sm-regular text-fg-caption hover:text-fg-heading"
        >
          View all pending results
          <ArrowRightIcon className="size-4" />
        </Link>
      }
    >
      {empty ? (
        <p className="py-10 text-center type-body-sm-regular text-fg-caption">{empty}</p>
      ) : (
        <ul aria-label="Results awaiting approval" className="mt-2 border-t">
          {data?.items.slice(0, PREVIEW_ROWS).map((item) => (
            <li key={item.id} className="flex items-center gap-3 border-b py-3">
              <TestTubeBadge />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate type-body-sm-regular text-fg-heading">
                  {item.testType}
                </span>
                <span className="truncate type-caption text-fg-caption">
                  {item.patient.name} · {relativeDay(new Date(item.enteredAt), now)}
                </span>
              </div>
              <PendingTag />
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}

/** "Today, 10:42 AM", "Yesterday, 3:15 PM", or the day alone ("21 Oct 2026") before that. */
function relativeDay(date: Date, now: Date) {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === now.toDateString()) return `Today, ${formatTime(date)}`;
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${formatTime(date)}`;
  return formatDay(date);
}
