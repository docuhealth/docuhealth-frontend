import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { STAFF_PAGE_SIZE, staffListQuery } from "@/features/hospital-admin/api/queries";
import {
  sexLabels,
  type StaffFilter,
  type StaffMember,
  staffRoles,
  staffStatusLabels,
} from "@/features/hospital-admin/api/schemas";
import { DashboardTable, PersonCell } from "@/components/dashboard/dashboard-table";
import { StaffActionsMenu } from "@/features/hospital-admin/components/staff-actions-menu";
import { StatusPill } from "@/components/dashboard/status-pill";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { formatTimeAgo } from "@/lib/format";

// The design's layout on wide cards: Name ~28%, the others 14% each.
const columns = {
  select: "w-10",
  detail: "w-24 @4xl:w-[14%]",
  sex: "w-16 @4xl:w-[14%]",
  actions: "w-12",
};

/** Rows ticked for a bulk action; ids on the current page only. */
export type StaffSelection = {
  selected: ReadonlySet<string>;
  onChange: (selected: Set<string>) => void;
};

/**
 * A page of the hospital's staff matching `search` and `filter`, with pagination. A table once
 * its card (a `@container`) fits every column (`@3xl`); below that, a list where each person's
 * details wrap under their name, so nothing is hidden on phones and tablets. Pass `selection`
 * for a checkbox on every row and a select-all in the header.
 */
export function StaffDirectory({
  search,
  filter = "all",
  page,
  onPageChange,
  selection,
}: {
  search: string;
  filter?: StaffFilter;
  page: number;
  onPageChange: (page: number) => void;
  selection?: StaffSelection;
}) {
  const { data, isError } = useQuery(staffListQuery(search, page, filter));
  const items = data?.items ?? [];

  const empty = isError
    ? "We couldn’t load your staff. Try again in a moment."
    : data?.items.length === 0 &&
      (search || filter !== "all" ? "No staff match your search." : "No staff added yet.");

  const allSelected =
    !!selection && items.length > 0 && items.every(({ id }) => selection.selected.has(id));
  const someSelected = !!selection && items.some(({ id }) => selection.selected.has(id));

  function toggle(id: string, checked: boolean) {
    if (!selection) return;
    const next = new Set(selection.selected);
    if (checked) next.add(id);
    else next.delete(id);
    selection.onChange(next);
  }

  const selectAll = selection && (
    <Checkbox
      aria-label="Select all on this page"
      checked={allSelected ? true : someSelected ? "indeterminate" : false}
      onCheckedChange={(checked) =>
        selection.onChange(checked === true ? new Set(items.map(({ id }) => id)) : new Set())
      }
      className="size-4.5 border-fg-caption/50 bg-card"
    />
  );

  const rowCheckbox = (member: StaffMember) =>
    selection && (
      <Checkbox
        aria-label={`Select ${member.name}`}
        checked={selection.selected.has(member.id)}
        onCheckedChange={(checked) => toggle(member.id, checked === true)}
        className="size-4.5 border-fg-caption/50 bg-card"
      />
    );

  return (
    <>
      <div className="hidden @3xl:block">
        <DashboardTable
          compact
          // The last row keeps its divider to separate the table from the pagination.
          className="[&_tbody_tr:last-child]:border-b"
          columns={[
            ...(selection
              ? [{ label: "Select", header: selectAll, className: columns.select }]
              : []),
            { label: "Name" },
            { label: "Role/Dept", className: columns.detail },
            { label: "Phone no.", className: columns.detail },
            { label: "Added", className: columns.detail },
            { label: "Status", className: columns.detail },
            { label: "Sex", className: columns.sex },
            { label: "Actions", hideLabel: true, className: columns.actions },
          ]}
          empty={empty}
        >
          {items.map((member) => (
            <TableRow
              key={member.id}
              data-state={selection?.selected.has(member.id) ? "selected" : undefined}
            >
              {selection && <TableCell>{rowCheckbox(member)}</TableCell>}
              <TableCell>
                <StaffPerson member={member} />
              </TableCell>
              <TableCell>{staffRoles[member.role].one}</TableCell>
              <TableCell>{member.phone}</TableCell>
              <TableCell>{formatTimeAgo(new Date(member.addedAt))}</TableCell>
              <TableCell>
                <StaffStatus member={member} />
              </TableCell>
              <TableCell>{member.sex ? sexLabels[member.sex] : "—"}</TableCell>
              <TableCell>
                <StaffActionsMenu member={member} />
              </TableCell>
            </TableRow>
          ))}
        </DashboardTable>
      </div>

      <div className="mt-4 border-t @3xl:hidden">
        {empty ? (
          <p className="py-10 text-center type-caption text-fg-caption">{empty}</p>
        ) : (
          <>
            {selection && items.length > 0 && (
              <label className="flex items-center gap-3 border-b px-1 py-3 type-caption text-fg-body">
                {selectAll}
                Select all on this page
              </label>
            )}
            <ul aria-label="Staff">
              {items.map((member) => (
                <li key={member.id} className="flex flex-col gap-3 border-b px-1 py-3">
                  <div className="flex items-center gap-3">
                    {rowCheckbox(member)}
                    <div className="min-w-0 flex-1 type-caption">
                      <StaffPerson member={member} />
                    </div>
                    <StaffActionsMenu member={member} />
                  </div>
                  {/* Lined up under the name: past the avatar (and the checkbox, if any). */}
                  <dl
                    className={
                      selection
                        ? "grid grid-cols-2 gap-x-4 gap-y-3 pl-17.5 @md:grid-cols-3"
                        : "grid grid-cols-2 gap-x-4 gap-y-3 pl-10 @md:grid-cols-3"
                    }
                  >
                    <Detail label="Status">
                      <StaffStatus member={member} />
                    </Detail>
                    <Detail label="Role/Dept">{staffRoles[member.role].one}</Detail>
                    <Detail label="Phone no.">{member.phone}</Detail>
                    <Detail label="Added">{formatTimeAgo(new Date(member.addedAt))}</Detail>
                    <Detail label="Sex">{member.sex ? sexLabels[member.sex] : "—"}</Detail>
                  </dl>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {data && data.total > 0 && (
        <TablePagination
          page={page}
          pageSize={STAFF_PAGE_SIZE}
          total={data.total}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}

function StaffPerson({ member }: { member: StaffMember }) {
  return (
    <PersonCell
      name={member.name}
      avatarUrl={member.avatarUrl}
      detail={member.email}
      badge={
        member.isAdmin && (
          <span className="shrink-0 rounded-[4px] bg-primary/10 px-1.5 py-px type-caption-medium text-primary">
            Admin
          </span>
        )
      }
    />
  );
}

function StaffStatus({ member }: { member: StaffMember }) {
  return (
    <StatusPill tone={member.status === "on_team" ? "success" : "neutral"}>
      {staffStatusLabels[member.status]}
    </StatusPill>
  );
}

/** One labelled detail in the narrow layout's list. */
function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-1">
      <dt className="type-caption text-fg-caption">{label}</dt>
      <dd className="max-w-full truncate type-caption text-fg-heading">{children}</dd>
    </div>
  );
}
