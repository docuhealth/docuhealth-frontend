import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { cn } from "@/lib/utils";

/**
 * A dashboard card's table: grey header row with rounded top corners, 12px text throughout.
 * `empty` replaces the rows (e.g. "No patients match …") when it's given; `compact` rows are
 * 52px tall instead of 60px; `plainHeader` drops the grey header for lines above and below it.
 *
 * Columns have fixed widths except the one without a width class, which takes the rest. To fit
 * narrow cards, give a column `hidden @lg:table-cell` (etc.) — on its header via `columns` and on
 * its cells — so it only shows once the card (a `@container`) is wide enough.
 */
export function DashboardTable({
  columns,
  empty,
  compact,
  plainHeader,
  className,
  children,
}: {
  /**
   * `hideLabel` keeps the label for screen readers only, e.g. for a column of row actions;
   * `header` replaces it with something else, like a select-all checkbox.
   */
  columns: { label: string; hideLabel?: boolean; header?: ReactNode; className?: string }[];
  empty?: ReactNode;
  compact?: boolean;
  plainHeader?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    // Rounds the header's top corners whichever of its columns are showing.
    <div className={cn("mt-4 overflow-hidden", !plainHeader && "rounded-t-lg")}>
      <Table
        className={cn(
          "table-fixed type-caption text-fg-body [&_td:first-child]:pl-4",
          compact ? "[&_td]:py-2.5" : "[&_td]:py-3.5",
          className,
        )}
      >
        <TableHeader className={plainHeader ? "[&_tr]:border-y" : "[&_tr]:border-0"}>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={column.label}
                className={cn(
                  "type-caption text-fg-body first:pl-4",
                  plainHeader ? "bg-transparent" : "bg-line",
                  compact ? "h-8" : "h-9",
                  column.className,
                )}
              >
                {column.header ??
                  (column.hideLabel ? (
                    <span className="sr-only">{column.label}</span>
                  ) : (
                    column.label
                  ))}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {empty ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="py-10! text-center text-fg-caption">
                {empty}
              </TableCell>
            </TableRow>
          ) : (
            children
          )}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * A person's avatar, name and one line about them (e.g. their HIN), for a table cell; `badge`
 * sits after the name (e.g. "Admin").
 */
export function PersonCell({
  name,
  avatarUrl,
  detail,
  badge,
}: {
  name: string;
  avatarUrl: string | null;
  detail: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <PersonAvatar name={name} src={avatarUrl} />
      {/* Long names and emails end in "…" rather than spilling into the next column. */}
      <div className="flex min-w-0 flex-col">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-fg-heading">{name}</span>
          {badge}
        </span>
        <span className="truncate text-fg-caption">{detail}</span>
      </div>
    </div>
  );
}
