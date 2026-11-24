import { useRouterState } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Loading placeholders in the shapes of what's coming, so a screen doesn't jump when its data
 * arrives. The theme's `muted` is nearly white, so these use the border grey to show on cards.
 */
function Bone({ className }: { className?: string }) {
  return <Skeleton className={cn("bg-line", className)} />;
}

/** Text-ish widths, so rows don't all look the same. */
const widths = ["w-3/4", "w-1/2", "w-2/3", "w-5/6", "w-2/5"];

/**
 * Rows for a `DashboardTable` while its page loads: one bar per column, the first a person (round
 * avatar and two lines). `columns` carries each column's `className` so hidden columns stay hidden.
 */
export function TableRowsSkeleton({
  columns,
  rows = 5,
}: {
  columns: { className?: string }[];
  rows?: number;
}) {
  return Array.from({ length: rows }, (_, row) => (
    <tr key={row} aria-hidden="true" className="border-b last:border-0">
      {columns.map((column, index) => (
        <td key={index} className={cn("px-2 py-3 first:pl-4", column.className)}>
          {index === 0 ? (
            <div className="flex items-center gap-2">
              <Bone className="size-8 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Bone className={cn("h-3", widths[row % widths.length])} />
                <Bone className="h-2.5 w-1/3" />
              </div>
            </div>
          ) : (
            <Bone className={cn("h-3", widths[(row + index) % widths.length])} />
          )}
        </td>
      ))}
    </tr>
  ));
}

/** A list of cards or rows (notes, handovers, results) while it loads. */
export function ListSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <output aria-label="Loading" className={cn("flex flex-col gap-3", className)}>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex flex-col gap-2 rounded-lg border p-4">
          <Bone className="h-3.5 w-1/3" />
          <Bone className={cn("h-3", widths[row % widths.length])} />
          <Bone className="h-3 w-1/2" />
        </div>
      ))}
    </output>
  );
}

/** A row of `StatCard`s while the numbers load. */
function StatCardsSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <output aria-label="Loading" className={cn("grid grid-cols-2 gap-4 xl:grid-cols-4", className)}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex flex-col gap-2 rounded-xl bg-card p-1 ring-1 ring-line">
          <Bone className="mx-3 my-2.5 h-3 w-1/2" />
          <div className="flex flex-col gap-3 rounded-lg border bg-surface px-2.5 py-3">
            <Bone className="h-6 w-1/3" />
            <Bone className="h-2.5 w-2/3" />
          </div>
        </div>
      ))}
    </output>
  );
}

/** A card's content (a chart, a profile, details) while it loads. */
export function CardSkeleton({ lines = 4, className }: { lines?: number; className?: string }) {
  return (
    <output aria-label="Loading" className={cn("flex flex-col gap-3 py-2", className)}>
      <Bone className="h-4 w-1/3" />
      {Array.from({ length: lines }, (_, line) => (
        <Bone key={line} className={cn("h-3", widths[line % widths.length])} />
      ))}
    </output>
  );
}

/** A whole dashboard page while its route loads: the heading, a row of stat cards and a table. */
function PageSkeleton() {
  return (
    <output aria-label="Loading" className="flex flex-col gap-8 p-4 sm:p-8">
      <div className="flex flex-col gap-2">
        <Bone className="h-6 w-56" />
        <Bone className="h-3.5 w-80 max-w-full" />
      </div>
      <StatCardsSkeleton />
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
        <Bone className="h-4 w-40" />
        <table className="w-full table-fixed">
          <tbody>
            <TableRowsSkeleton columns={[{}, {}, { className: "hidden sm:table-cell" }, {}]} />
          </tbody>
        </table>
      </div>
    </output>
  );
}

/** A login or sign-up form while its page loads: a title, a few fields and the button. */
function FormSkeleton() {
  return (
    <output aria-label="Loading" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Bone className="h-6 w-48" />
        <Bone className="h-3.5 w-64 max-w-full" />
      </div>
      {Array.from({ length: 3 }, (_, field) => (
        <div key={field} className="flex flex-col gap-2">
          <Bone className="h-3 w-24" />
          <Bone className="h-12 w-full" />
        </div>
      ))}
      <Bone className="h-12 w-full" />
    </output>
  );
}

// Internal paths (sections are path prefixes inside the app): the staff dashboards and
// DocuHealth's admin section, and the login and sign-up pages.
const dashboardPath =
  /^\/(hospital\/(admin|doctor|nurse|receptionist|lab-scientist|radiologist|pharmacy)|admin)(\/|$)/;
const authPath =
  /\/(login|forgot-password|register|register-hospital|verify|verify-nin|first-login)$/;

/**
 * What the router shows while a page that takes more than a moment loads, shaped like that page:
 * a dashboard's heading, stat cards and table; a login or sign-up form; nothing on the public site.
 */
export function RoutePending() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (authPath.test(pathname)) return <FormSkeleton />;
  if (dashboardPath.test(pathname)) return <PageSkeleton />;
  return null;
}
