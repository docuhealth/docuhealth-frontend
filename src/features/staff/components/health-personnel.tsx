import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { DashboardTable, PersonCell } from "@/components/dashboard/dashboard-table";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { SearchField } from "@/components/dashboard/search-field";
import { StatusPill } from "@/components/dashboard/status-pill";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { TableCell, TableRow } from "@/components/ui/table";
import { STAFF_DIRECTORY_PAGE_SIZE, staffDirectoryQuery } from "@/features/staff/api/queries";
import { type StaffMember, type StaffRole, staffRoleLabels } from "@/lib/staff-profile";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const roleFilter = { all: "All roles", ...staffRoleLabels } as const;
type RoleFilter = keyof typeof roleFilter;

const columns = { detail: "w-[18%]", status: "w-28" };

/** The facility's staff, to find a colleague's role and contact details. */
export function HealthPersonnel() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [page, setPage] = useState(1);
  const term = useDebouncedValue(search.trim());
  const { data, isError } = useQuery(
    staffDirectoryQuery({ page, search: term, role: role as StaffRole | "all" }),
  );
  const items = data?.items ?? [];

  const empty = isError
    ? "We couldn’t load your colleagues. Try again in a moment."
    : data?.items.length === 0 &&
      (term || role !== "all" ? "No one matches your search." : "No staff yet.");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="type-h4">Health Personnel</h1>
        <p className="type-body-sm-regular text-fg-caption">
          Find your colleagues and how to reach them.
        </p>
      </div>

      <section aria-label="Staff" className="@container rounded-xl border bg-card p-4">
        <header className="flex flex-wrap items-center gap-4">
          <SearchField
            size="lg"
            label="Search staff"
            placeholder="Search by name or email"
            value={search}
            onChange={(next) => {
              setSearch(next);
              setPage(1);
            }}
            className="@3xl:w-96"
          />
          <FilterSelect
            label="Role"
            value={role}
            options={roleFilter}
            onChange={(next) => {
              setRole(next);
              setPage(1);
            }}
            className="min-w-44 @3xl:ml-auto"
          />
        </header>

        <div className="hidden @3xl:block">
          <DashboardTable
            compact
            className="type-body-sm-regular [&_tbody_tr:last-child]:border-b"
            columns={[
              { label: "Name", className: "type-body-sm-regular" },
              { label: "Role", className: `${columns.detail} type-body-sm-regular` },
              { label: "Phone no.", className: `${columns.detail} type-body-sm-regular` },
              { label: "Gender", className: `${columns.detail} type-body-sm-regular` },
              { label: "Status", className: `${columns.status} type-body-sm-regular` },
            ]}
            empty={empty}
          >
            {items.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <PersonCell name={member.name} avatarUrl={null} detail={member.email} />
                </TableCell>
                <TableCell>{roleName(member)}</TableCell>
                <TableCell>{member.phone ?? "—"}</TableCell>
                <TableCell className="capitalize">{member.gender ?? "—"}</TableCell>
                <TableCell>
                  <ActiveStatus member={member} />
                </TableCell>
              </TableRow>
            ))}
          </DashboardTable>
        </div>

        <div className="mt-4 border-t @3xl:hidden">
          {empty ? (
            <p className="py-10 text-center type-caption text-fg-caption">{empty}</p>
          ) : (
            <ul aria-label="Staff">
              {items.map((member) => (
                <li key={member.id} className="flex flex-col gap-3 border-b px-1 py-3">
                  <div className="type-caption">
                    <PersonCell name={member.name} avatarUrl={null} detail={member.email} />
                  </div>
                  {/* Lined up under the name, past the avatar. */}
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 pl-10 @md:grid-cols-4">
                    <Detail label="Role">{roleName(member)}</Detail>
                    <Detail label="Phone no.">{member.phone ?? "—"}</Detail>
                    <Detail label="Gender">
                      <span className="capitalize">{member.gender ?? "—"}</span>
                    </Detail>
                    <Detail label="Status">
                      <ActiveStatus member={member} />
                    </Detail>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </div>

        {data && data.total > 0 && (
          <TablePagination
            page={page}
            pageSize={STAFF_DIRECTORY_PAGE_SIZE}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </section>
    </div>
  );
}

function roleName(member: StaffMember) {
  return member.role ? staffRoleLabels[member.role] : "Administrator";
}

function ActiveStatus({ member }: { member: StaffMember }) {
  return (
    <StatusPill tone={member.active ? "success" : "neutral"}>
      {member.active ? "Active" : "Inactive"}
    </StatusPill>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-1">
      <dt className="type-caption text-fg-caption">{label}</dt>
      <dd className="max-w-full truncate type-caption text-fg-heading">{children}</dd>
    </div>
  );
}
